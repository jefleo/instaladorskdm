// Testes automatizados de QA sobre dist/index.html (file://, rede bloqueada).
// Resultado em entregas/qa/resultados.json; resumo no terminal.
// Uso: node scripts/qa.mjs   (ou chamado por scripts/entregas.mjs)
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { DIST, ENTREGAS, QA, RAIZ, URL_BASE, abrirNavegador, esperarPronto, idsDasTelas, novoContexto, vigiarConsole } from "./comum.mjs";

/* ------------------------------------------------------------------------ */
/* Medições no navegador                                                     */
/* ------------------------------------------------------------------------ */

/** Roda dentro da página: mede cortes, saídas do palco, fontes e contraste da tela visível. */
function medirTela({ seletorRaiz, fonteMin }) {
  const raiz = document.querySelector(seletorRaiz);
  if (!raiz) return { erro: `sem ${seletorRaiz}` };
  const palco = raiz.getBoundingClientRect();
  const escala = palco.width / 1920 || 1;

  const desc = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const cls = (typeof el.className === "string" ? el.className : el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 3);
    if (cls.length) s += "." + cls.join(".");
    return s;
  };
  const textoDe = (el) => (el.innerText ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 70);
  const visivel = (el) => {
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return false;
    if (el.closest("[aria-hidden='true'], .sr-only-vapti, .sr-only")) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const textoProprio = (el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);

  // ---- cor ----
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) {
      // color(srgb r g b / a) ou oklch → usa canvas para converter
      const cv = document.createElement("canvas");
      cv.width = cv.height = 1;
      const cx = cv.getContext("2d");
      cx.clearRect(0, 0, 1, 1);
      cx.fillStyle = c;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    }
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  };
  const sobre = (cima, baixo) => {
    const a = cima[3];
    return [0, 1, 2].map((i) => cima[i] * a + baixo[i] * (1 - a)).concat(1);
  };
  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const razao = (a, b) => {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const fundoDe = (el) => {
    const camadas = [];
    let temImagem = false;
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== "none") temImagem = true;
      const c = parse(cs.backgroundColor);
      if (c[3] > 0) {
        camadas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let cor = parse(getComputedStyle(document.body).backgroundColor);
    if (cor[3] < 1) cor = [255, 255, 255, 1];
    for (let i = camadas.length - 1; i >= 0; i--) cor = sobre(camadas[i], cor);
    return { cor, temImagem };
  };
  const opacidade = (el) => {
    let o = 1;
    for (let e = el; e && e !== document.body; e = e.parentElement) o *= Number(getComputedStyle(e).opacity);
    return o;
  };

  const cortes = [];
  const fora = [];
  const fontes = [];
  const contraste = [];
  const todos = Array.from(raiz.querySelectorAll("*"));
  for (const el of todos) {
    if (!visivel(el)) continue;
    const cs = getComputedStyle(el);
    // corte: overflow escondido com conteúdo maior que a caixa
    const escondeX = /hidden|clip/.test(cs.overflowX) || cs.textOverflow === "ellipsis";
    const escondeY = /hidden|clip/.test(cs.overflowY) || cs.webkitLineClamp !== "none";
    // .encaixe reduz o conteúdo com transform: a rolagem mede o tamanho sem escala; o corte real é medido pelos retângulos abaixo
    if ((escondeX || escondeY) && (el.innerText || "").trim() && !el.classList.contains("encaixe")) {
      const cx = escondeX && el.scrollWidth > el.clientWidth + 1;
      const cy = escondeY && el.scrollHeight > el.clientHeight + 1;
      if (cx || cy) cortes.push({ el: desc(el), texto: textoDe(el), sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight });
    }
    // saída do palco (só elementos com texto próprio ou svg de texto)
    if (textoProprio(el) || el.tagName === "text") {
      const r = el.getBoundingClientRect();
      const t = 1;
      if (r.left < palco.left - t || r.top < palco.top - t || r.right > palco.right + t || r.bottom > palco.bottom + t) {
        fora.push({ el: desc(el), texto: textoDe(el), rect: [r.left - palco.left, r.top - palco.top, r.right - palco.left, r.bottom - palco.top].map((v) => Math.round(v / escala)) });
      }
      // texto que escapa do ancestral que corta (overflow hidden)
      for (let a = el.parentElement; a && a !== raiz; a = a.parentElement) {
        const acs = getComputedStyle(a);
        if (/hidden|clip/.test(acs.overflowX + acs.overflowY)) {
          const ar = a.getBoundingClientRect();
          if (r.right > ar.right + 2 || r.bottom > ar.bottom + 2 || r.left < ar.left - 2 || r.top < ar.top - 2) {
            const ja = cortes.some((c) => c.el === desc(a) && c.texto === textoDe(a));
            if (!ja) cortes.push({ el: desc(a), texto: textoDe(el), motivo: "filho com texto ultrapassa caixa com overflow hidden", filho: desc(el) });
          }
          break;
        }
      }
      // fonte
      // tamanho efetivo no palco de 1920: considera transform (encaixe, celular) e o viewBox de svg
      const tam = parseFloat(cs.fontSize);
      let efetivo = tam;
      const svg = el.closest("svg");
      if (svg) {
        const vb = svg.viewBox?.baseVal;
        const r2 = svg.getBoundingClientRect();
        if (vb && vb.width) efetivo = (tam * r2.width) / escala / vb.width;
      } else if (el.offsetWidth > 0) {
        efetivo = (tam * r.width) / el.offsetWidth / escala;
      }
      efetivo = Math.round(efetivo * 10) / 10;
      fontes.push(efetivo);
      if (efetivo < fonteMin - 0.4) fontes.push({ el: desc(el), texto: textoDe(el), px: efetivo });
      // contraste
      if (el.tagName !== "text") {
        const cor = parse(cs.color);
        const { cor: fundo, temImagem } = fundoDe(el);
        const o = opacidade(el);
        const corEf = sobre([cor[0], cor[1], cor[2], cor[3] * o], fundo);
        const rz = razao(corEf, fundo);
        const grande = efetivo >= 24 || (efetivo >= 18.66 && Number(cs.fontWeight) >= 700);
        const min = grande ? 3 : 4.5;
        if (rz < min) contraste.push({ el: desc(el), texto: textoDe(el), razao: Math.round(rz * 100) / 100, min, px: efetivo, cor: cs.color, fundo: `rgb(${fundo.slice(0, 3).map(Math.round).join(",")})`, fundoComImagem: temImagem, opacidade: Math.round(o * 100) / 100 });
      }
    }
  }
  // sobreposição de textos: retângulos de linhas de texto de folhas diferentes que se cruzam
  const caixas = [];
  for (const el of todos) {
    if (!visivel(el) || !textoProprio(el)) continue;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const r of rg.getClientRects()) if (r.width > 2 && r.height > 2) caixas.push({ el, r });
    }
  }
  const sobrepostos = [];
  for (let i = 0; i < caixas.length; i++) {
    for (let j = i + 1; j < caixas.length; j++) {
      const A = caixas[i], B = caixas[j];
      if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
      const h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (w <= 0 || h <= 0) continue;
      const area = w * h;
      const menor = Math.min(A.r.width * A.r.height, B.r.width * B.r.height);
      if (area / menor > 0.25) {
        sobrepostos.push({ a: desc(A.el), ta: textoDe(A.el).slice(0, 40), b: desc(B.el), tb: textoDe(B.el).slice(0, 40), frac: Math.round((area / menor) * 100) / 100 });
        if (sobrepostos.length > 30) break;
      }
    }
  }
  const tamanhos = fontes.filter((f) => typeof f === "number");
  const pequenas = fontes.filter((f) => typeof f === "object");
  return { cortes, fora, menorFonte: Math.min(...tamanhos), pequenas, contraste, sobrepostos, nTextos: tamanhos.length };
}

/* ------------------------------------------------------------------------ */
/* Testes                                                                    */
/* ------------------------------------------------------------------------ */

// Termos da seção 4.15 do briefing, codificados em base64 para não aparecerem em texto no projeto.
const TERMOS_415 = ["Y2Fzc2lubw==","aW1wZXJjZXB0w612","cGVyc3Vhc8OjbyBvY3VsdGE=","c29ydGVpbw==","Y29uc8OzcmNpbw==","Y2hpcCBkZXNjYXJ0w6F2ZQ==","Y2hpcHMgZGVzY2FydMOhdmU=","bsO6bWVyb3Mgcm90YXRpdm9z","QVBJIG7Do28gb2ZpY2lhbA==","dGF4YSBkZSBzZXJ2acOnbw==","UiQgMTAgbWlsaMO1ZXMgcG9yIG3DqnM=","cmlzY28gemVybw==","YXByb3Zhw6fDo28gZ2FyYW50aWRh","cmV0b3JubyBnYXJhbnRpZG8=","ZXhwb3Npw6fDo28gZGUgZGV2ZWRvcmVz"].map((b) => Buffer.from(b, "base64").toString("utf8"));

function buscarTermos() {
  const alvos = [];
  const andar = (dir) => {
    for (const nome of readdirSync(dir)) {
      const p = join(dir, nome);
      if (statSync(p).isDirectory()) andar(p);
      else alvos.push(p);
    }
  };
  andar(resolve(RAIZ, "src"));
  for (const n of readdirSync(ENTREGAS)) if (n.endsWith(".html")) alvos.push(resolve(ENTREGAS, n));
  alvos.push(resolve(RAIZ, "index.html"));
  if (existsSync(resolve(RAIZ, "scripts"))) for (const n of readdirSync(resolve(RAIZ, "scripts"))) alvos.push(resolve(RAIZ, "scripts", n));
  const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const achados = [];
  for (const arq of alvos) {
    const linhas = readFileSync(arq, "utf8").split("\n");
    linhas.forEach((l, i) => {
      for (const t of TERMOS_415) {
        if (norm(l).includes(norm(t))) {
          const pos = norm(l).indexOf(norm(t));
          achados.push({ arquivo: `${relative(RAIZ, arq)}:${i + 1}`, termo: t, trecho: l.slice(Math.max(0, pos - 50), pos + 60).trim() });
        }
      }
    });
  }
  return { arquivos: alvos.length, achados };
}

function checarArquivoUnico() {
  const html = readFileSync(DIST, "utf8");
  const tamanho = statSync(DIST).size;
  const ext = [];
  for (const m of html.matchAll(/<script[^>]*\bsrc\s*=\s*["']?(https?:)?\/\/[^"' >]+/gi)) ext.push(m[0].slice(0, 120));
  for (const m of html.matchAll(/<link[^>]*\bhref\s*=\s*["']?(https?:)?\/\/[^"' >]+/gi)) ext.push(m[0].slice(0, 120));
  for (const m of html.matchAll(/@import\s+(url\()?\s*["']?https?:[^;]+/gi)) ext.push(m[0].slice(0, 120));
  for (const m of html.matchAll(/url\(\s*["']?https?:[^)]+\)/gi)) ext.push(m[0].slice(0, 120));
  const scriptsExternos = (html.match(/<script[^>]+src=/gi) || []).length;
  const linksCss = (html.match(/<link[^>]+rel=["']?stylesheet/gi) || []).length;
  return { bytes: tamanho, mb: Math.round((tamanho / 1048576) * 100) / 100, abaixoDe5MB: tamanho < 5 * 1048576, referenciasExternas: ext, scriptsComSrc: scriptsExternos, linksStylesheet: linksCss };
}

export async function rodarQa() {
  mkdirSync(QA, { recursive: true });
  const R = { quando: new Date().toISOString(), testes: {} };
  const navegador = await abrirNavegador();
  let bloqueadasTotal = [];
  try {
    const { contexto: c0 } = await novoContexto(navegador);
    const ids = await idsDasTelas(c0);
    await c0.close();
    R.telas = ids;

    /* ---- 1. console + medições por tela em 1920×1080 ---- */
    {
      const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 1920, height: 1080 } });
      const p = await contexto.newPage();
      let onde = "carga";
      const msgs = vigiarConsole(p, () => onde);
      await p.goto(`${URL_BASE}#/${ids[0]}`);
      await p.waitForSelector(".palco");
      await esperarPronto(p);
      const porTela = {};
      for (const id of ids) {
        onde = `#/${id}`;
        await p.evaluate((h) => (window.location.hash = h), `#/${id}`);
        await p.waitForFunction((id) => document.querySelector(`.palco [data-slide="${id}"]`), id);
        await esperarPronto(p, 300);
        porTela[id] = await p.evaluate(medirTela, { seletorRaiz: ".palco", fonteMin: 22 });
      }
      R.testes.medicoes1920 = porTela;
      R.testes.console = { mensagens: msgs };
      bloqueadasTotal.push(...bloqueadas);
      await contexto.close();
    }

    /* ---- 1b. medições de contraste/corte no modo impressão (claro) ---- */
    {
      const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 1920, height: 1080 } });
      const p = await contexto.newPage();
      let onde = "print";
      const msgs = vigiarConsole(p, () => onde);
      await p.goto(`${URL_BASE}?print=1`);
      await p.waitForSelector("[data-pagina]");
      await esperarPronto(p, 600);
      const porPagina = {};
      for (const id of ids) {
        porPagina[id] = await p.evaluate(medirTela, { seletorRaiz: `[data-pagina="${id}"]`, fonteMin: 22 });
      }
      R.testes.medicoesPrint = porPagina;
      // outras rotas: resumo, notas, leitura, estilo/protótipo
      for (const [rota, vp] of [
        ["?resumo=1", { width: 1240, height: 1754 }],
        ["?notas=1#/07c", { width: 1440, height: 900 }],
        ["#/prototipo", { width: 1440, height: 900 }],
      ]) {
        onde = rota;
        const p2 = await contexto.newPage();
        const m2 = vigiarConsole(p2, () => rota);
        await p2.setViewportSize(vp);
        await p2.goto(`${URL_BASE}${rota}`);
        await esperarPronto(p2, 800);
        msgs.push(...m2);
        await p2.close();
      }
      // leitura em celular
      {
        const ctxM = await novoContexto(navegador, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
        const pm = await ctxM.contexto.newPage();
        const mm = vigiarConsole(pm, () => "leitura-390");
        await pm.goto(URL_BASE);
        await pm.waitForSelector("[data-exibicao='leitura']");
        await esperarPronto(pm, 500);
        await pm.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
        });
        await esperarPronto(pm, 300);
        const larguraExtra = await pm.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        R.testes.leitura390 = { rolagemHorizontalPx: larguraExtra };
        msgs.push(...mm);
        bloqueadasTotal.push(...ctxM.bloqueadas);
        await ctxM.contexto.close();
      }
      R.testes.console.mensagens.push(...msgs);
      bloqueadasTotal.push(...bloqueadas);
      await contexto.close();
    }

    /* ---- 2. teclado ---- */
    {
      const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 1920, height: 1080 } });
      const p = await contexto.newPage();
      const msgs = vigiarConsole(p, () => "teclado");
      await p.goto(`${URL_BASE}#/${ids[0]}`);
      await p.waitForSelector(".palco");
      await esperarPronto(p);
      const falhas = [];
      const hash = () => p.evaluate(() => window.location.hash);
      const esperarHash = async (h) => {
        try {
          await p.waitForFunction((h) => window.location.hash === h, h, { timeout: 2000 });
          return true;
        } catch {
          return false;
        }
      };
      for (let i = 1; i < ids.length; i++) {
        await p.keyboard.press(i % 3 === 0 ? "Space" : i % 3 === 1 ? "ArrowRight" : "PageDown");
        if (!(await esperarHash(`#/${ids[i]}`))) falhas.push(`→ passo ${i}: esperava #/${ids[i]}, veio ${await hash()}`);
      }
      await p.keyboard.press("ArrowRight");
      if ((await hash()) !== `#/${ids.at(-1)}`) falhas.push("→ na última tela saiu do fim");
      for (let i = ids.length - 2; i >= ids.length - 6; i--) {
        await p.keyboard.press(i % 2 ? "ArrowLeft" : "PageUp");
        if (!(await esperarHash(`#/${ids[i]}`))) falhas.push(`← esperava #/${ids[i]}, veio ${await hash()}`);
      }
      await p.keyboard.press("Home");
      if (!(await esperarHash(`#/${ids[0]}`))) falhas.push("Home não foi para a primeira");
      await p.keyboard.press("ArrowLeft");
      if ((await hash()) !== `#/${ids[0]}`) falhas.push("← na primeira tela saiu do início");
      await p.keyboard.press("End");
      if (!(await esperarHash(`#/${ids.at(-1)}`))) falhas.push("End não foi para a última");
      // grade
      await p.keyboard.press("Home");
      await esperarHash(`#/${ids[0]}`);
      await p.keyboard.press("g");
      const gradeAberta = await p.waitForSelector(".grade-sobreposta", { timeout: 2000 }).then(() => true, () => false);
      if (!gradeAberta) falhas.push("G não abriu a grade");
      for (let k = 0; k < 5; k++) await p.keyboard.press("ArrowRight");
      await p.keyboard.press("Enter");
      if (!(await esperarHash(`#/${ids[5]}`))) falhas.push(`Grade: 5×→ + Enter deveria ir a #/${ids[5]}, veio ${await hash()}`);
      if (await p.$(".grade-sobreposta")) falhas.push("Grade não fechou após Enter");
      await p.keyboard.press("g");
      await p.waitForSelector(".grade-sobreposta", { timeout: 2000 }).catch(() => undefined);
      await p.keyboard.press("Escape");
      await p.waitForTimeout(200);
      if (await p.$(".grade-sobreposta")) falhas.push("Esc não fechou a grade");
      // notas
      await p.keyboard.press("n");
      await p.waitForTimeout(250);
      if (!(await p.$(".apres--notas"))) falhas.push("N não abriu as notas");
      await p.keyboard.press("Escape");
      await p.waitForTimeout(250);
      if (await p.$(".apres--notas")) falhas.push("Esc não fechou as notas");
      // ajuda
      await p.keyboard.press("?");
      await p.waitForTimeout(250);
      const ajuda = await p.evaluate(() => document.querySelectorAll("[role='dialog']").length);
      if (!ajuda) falhas.push("? não abriu a ajuda");
      await p.keyboard.press("Escape");
      await p.waitForTimeout(250);
      if (await p.evaluate(() => document.querySelectorAll("[role='dialog']").length)) falhas.push("Esc não fechou a ajuda");
      // setas dentro do simulador mexem no slider, não trocam a tela; PageDown troca
      await p.evaluate(() => (window.location.hash = "#/07c"));
      await p.waitForSelector(".palco input[type=range]");
      await p.focus(".palco input[type=range]");
      const antes = await p.$eval(".palco input[type=range]", (e) => e.value);
      await p.keyboard.press("ArrowLeft");
      const depois = await p.$eval(".palco input[type=range]", (e) => e.value);
      if ((await hash()) !== "#/07c") falhas.push("← no slider trocou a tela");
      if (antes === depois) falhas.push("← no slider não mudou o valor");
      await p.keyboard.press("PageDown");
      if (!(await esperarHash(`#/${ids[ids.indexOf("07c") + 1]}`))) falhas.push("PageDown com foco no slider não avançou");
      R.testes.teclado = { passos: ids.length - 1, falhas, console: msgs };
      R.testes.console.mensagens.push(...msgs);
      bloqueadasTotal.push(...bloqueadas);
      await contexto.close();
    }

    /* ---- 3. simulador ---- */
    {
      const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 1920, height: 1080 } });
      const p = await contexto.newPage();
      const msgs = vigiarConsole(p, () => "simulador");
      await p.goto(`${URL_BASE}#/07c`);
      await p.waitForSelector(".palco input[type=range]");
      await esperarPronto(p);
      const raiz = ".palco section";
      const texto = () => p.$eval(raiz, (e) => e.innerText);
      const base = await texto();
      const esperados = ["R$ 1,47 mi", "R$ 294,7 mil", "R$ 128,9 mil", "16,75%"];
      const baseFalta = esperados.filter((s) => !base.replace(/ /g, " ").includes(s));
      const definir = (i, v) =>
        p.$$eval(
          `${raiz} input[type=range]`,
          (els, [i, v]) => {
            const el = els[i];
            const alvo = v === "min" ? el.min : v === "max" ? el.max : String(v);
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
            setter.call(el, alvo);
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          },
          [i, v],
        );
      const fase = (n) => p.$$eval(`${raiz} fieldset button`, (els, n) => els[n - 1].click(), n);
      const ler = () =>
        p.$eval(raiz, (s) => {
          const t = s.innerText.replace(/ /g, " ");
          const num = (x) => parseFloat(x.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
          const m = t.match(/Perda escolhida:\s*([\d,]+)\s*%[\s\S]*?Perda de equilíbrio:\s*([^\n]+)/);
          return {
            texto: t,
            perda: m ? num(m[1]) : null,
            equilibrioTexto: m ? m[2].trim() : null,
            equilibrio: m ? num(m[2]) : null,
            alerta: !!s.querySelector("[role=alert]"),
            ruim: /NaN|Infinity|undefined|null/.test(t),
            sliders: Array.from(s.querySelectorAll("input[type=range]")).map((e) => e.value),
          };
        });
      const casos = [];
      for (const cap of ["min", "max"])
        for (const tx of ["min", "max"])
          for (const pd of ["min", "max", 0.08])
            for (const f of [1, 2, 3]) {
              await definir(0, cap);
              await definir(1, tx);
              await definir(2, pd);
              await fase(f);
              await p.waitForTimeout(30);
              const r = await ler();
              const deveAlertar = r.perda !== null && r.equilibrio !== null && r.perda >= r.equilibrio - 0.005;
              const ok = !r.ruim && (deveAlertar ? r.alerta : true) && r.equilibrio !== null;
              casos.push({ capital: cap, taxa: tx, perda: pd, fase: f, sliders: r.sliders, perdaPct: r.perda, equilibrio: r.equilibrioTexto, alerta: r.alerta, deveAlertar, ruim: r.ruim, ok, alertaSemNecessidade: r.alerta && !deveAlertar });
            }
      // varredura de perda até cruzar o equilíbrio no cenário-base
      await p.click(`${raiz} button:has-text("Voltar ao cenário-base")`).catch(() => undefined);
      const varredura = [];
      for (let v = 0.04; v <= 0.2001; v += 0.01) {
        await definir(2, Math.round(v * 1000) / 1000);
        await p.waitForTimeout(20);
        const r = await ler();
        varredura.push({ perda: r.perda, equilibrio: r.equilibrio, alerta: r.alerta, ruim: r.ruim });
      }
      R.testes.simulador = {
        base: { esperados, faltando: baseFalta },
        faixas: await p.$$eval(`${raiz} input[type=range]`, (els) => els.map((e) => ({ min: e.min, max: e.max, step: e.step }))),
        casos,
        falhas: casos.filter((c) => !c.ok),
        alertaSemNecessidade: casos.filter((c) => c.alertaSemNecessidade),
        varreduraBase: varredura,
        varreduraFalhas: varredura.filter((v) => v.ruim || (v.perda >= v.equilibrio ? !v.alerta : false)),
        console: msgs,
      };
      await p.screenshot({ path: resolve(QA, "simulador-extremo.png") });
      R.testes.console.mensagens.push(...msgs);
      bloqueadasTotal.push(...bloqueadas);
      await contexto.close();
    }

    /* ---- 4. protótipo clicável ---- */
    {
      const resultados = [];
      for (const rota of ["#/03", "#/prototipo"]) {
        const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 1920, height: 1080 }, reducedMotion: "no-preference" });
        const p = await contexto.newPage();
        const msgs = vigiarConsole(p, () => `prototipo ${rota}`);
        await p.goto(`${URL_BASE}${rota}`);
        const cel = p.locator("[data-celular='conversa']").first();
        await cel.waitFor();
        await esperarPronto(p, 600);
        const passos = [];
        const regiao = cel.locator("[aria-label='Protótipo de celular com dados fictícios']");
        const passo = async (nome, fn) => {
          try {
            await fn();
            await p.waitForTimeout(450);
            passos.push({ nome, ok: true });
          } catch (e) {
            passos.push({ nome, ok: false, erro: String(e).slice(0, 200) });
          }
        };
        // Conversa: ouve o áudio e abre o link
        await passo("conversa: tocar áudio", () => regiao.getByRole("button", { name: /ouvir/i }).first().click({ timeout: 3000 }));
        await passo("conversa: abrir link", async () => {
          const botoes = regiao.locator("button.bg-verde");
          await botoes.last().click({ timeout: 3000 });
        });
        const primario = () => regiao.locator("button.bg-verde.h-\\[56px\\]");
        for (let etapa = 1; etapa <= 7; etapa++) {
          await passo(`contratação: etapa ${etapa}`, async () => {
            const marca = await regiao.innerText();
            if (!marca.includes(`${etapa}/7`)) throw new Error(`contador ${etapa}/7 ausente`);
            if (etapa === 5) await regiao.locator("input[type=checkbox]").check({ timeout: 3000 });
            await primario().waitFor({ state: "visible", timeout: 3000 });
            await p.waitForFunction((el) => el && !el.disabled, await primario().elementHandle(), { timeout: 8000 });
            await primario().click({ timeout: 3000 });
          });
        }
        await passo("painel visível", async () => {
          const t = await cel.locator("[aria-current='page']").innerText();
          if (!/Painel/.test(t)) throw new Error(`tela atual: ${t}`);
        });
        await passo("painel → níveis", () => regiao.locator("button", { hasText: /nív/i }).last().click({ timeout: 3000 }));
        await passo("níveis visível", async () => {
          const t = await cel.locator("[aria-current='page']").innerText();
          if (!/Níveis/.test(t)) throw new Error(`tela atual: ${t}`);
        });
        await passo("níveis: tocar cada nível", async () => {
          const n = await regiao.locator("button").count();
          for (let i = 0; i < n; i++) {
            const b = regiao.locator("button").nth(i);
            if (await b.isVisible()) await b.click({ timeout: 1000 }).catch(() => undefined);
            if (!(await cel.locator("[aria-current='page']").innerText()).includes("Níveis")) break;
          }
        });
        await passo("trilho → atraso", () => cel.locator("nav button", { hasText: "Atraso" }).click({ timeout: 3000 }));
        await passo("atraso: opções", async () => {
          const botoes = regiao.locator("button");
          const n = await botoes.count();
          for (let i = 1; i < n; i++) await botoes.nth(i).click({ timeout: 1000 }).catch(() => undefined);
        });
        await passo("atraso: voltar ao painel", async () => {
          await cel.locator("nav button", { hasText: "Atraso" }).click();
          await regiao.locator("button[aria-label]").first().click({ timeout: 3000 });
          const t = await cel.locator("[aria-current='page']").innerText();
          if (!/Painel/.test(t)) throw new Error(`tela atual: ${t}`);
        });
        await passo("reiniciar", async () => {
          await cel.locator("nav button", { hasText: "Reiniciar" }).click();
          const t = await cel.locator("[aria-current='page']").innerText();
          if (!/Conversa/.test(t)) throw new Error(`tela atual: ${t}`);
        });
        await p.screenshot({ path: resolve(QA, `prototipo-${rota.replace(/[#/]/g, "")}.png`) });
        resultados.push({ rota, passos, console: msgs });
        R.testes.console.mensagens.push(...msgs);
        bloqueadasTotal.push(...bloqueadas);
        await contexto.close();
      }
      R.testes.prototipo = resultados;
    }

    /* ---- 5. arquivo único e termos proibidos ---- */
    R.testes.arquivoUnico = checarArquivoUnico();
    R.testes.termos415 = buscarTermos();
  } finally {
    await navegador.close();
  }
  R.testes.rede = { bloqueadas: bloqueadasTotal.length, urls: [...new Set(bloqueadasTotal)].slice(0, 20) };

  /* ---- resumo ---- */
  const T = R.testes;
  const med = Object.entries(T.medicoes1920);
  const medP = Object.entries(T.medicoesPrint);
  const soma = (arr, k) => arr.reduce((n, [, v]) => n + (v[k]?.length ?? 0), 0);
  const resumo = {
    console: T.console.mensagens.length,
    rede: T.rede.bloqueadas,
    teclado: T.teclado.falhas.length,
    cortes1920: soma(med, "cortes"),
    foraDoPalco1920: soma(med, "fora"),
    sobrepostos1920: soma(med, "sobrepostos"),
    fontesAbaixo22: soma(med, "pequenas"),
    menorFonte1920: Math.min(...med.map(([, v]) => v.menorFonte)),
    contraste1920: soma(med, "contraste"),
    cortesPrint: soma(medP, "cortes"),
    contrastePrint: soma(medP, "contraste"),
    simuladorBase: T.simulador.base.faltando.length,
    simuladorFalhas: T.simulador.falhas.length + T.simulador.varreduraFalhas.length,
    prototipo: T.prototipo.flatMap((r) => r.passos.filter((x) => !x.ok)).length,
    arquivoMB: T.arquivoUnico.mb,
    refsExternas: T.arquivoUnico.referenciasExternas.length,
    termos415: T.termos415.achados.length,
  };
  R.resumo = resumo;
  writeFileSync(resolve(QA, "resultados.json"), JSON.stringify(R, null, 2));
  console.log("QA:", JSON.stringify(resumo, null, 1));
  const ok =
    resumo.console === 0 && resumo.rede === 0 && resumo.teclado === 0 && resumo.simuladorBase === 0 && resumo.simuladorFalhas === 0 && resumo.prototipo === 0 && T.arquivoUnico.abaixoDe5MB && resumo.refsExternas === 0 && resumo.termos415 === 0;
  return ok;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ok = await rodarQa();
  process.exitCode = ok ? 0 : 1;
}
