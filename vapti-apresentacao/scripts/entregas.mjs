// Gera as entregas a partir de dist/index.html (via file://, rede bloqueada):
// HTML único, PDF 16:9, resumo A4 e capturas de QA. Depois roda os testes (scripts/qa.mjs).
// Uso: npm run entregas   (ou: node scripts/entregas.mjs [--sem-qa])
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { DIST, ENTREGAS, QA, TELAS_CHAVE, URL_BASE, abrirNavegador, esperarPronto, idsDasTelas, novoContexto } from "./comum.mjs";

if (!existsSync(DIST)) {
  console.error("dist/index.html não existe. Rode npm run build.");
  process.exit(1);
}

const kb = (arq) => `${(statSync(arq).size / 1024).toFixed(0)} KB`;
mkdirSync(QA, { recursive: true });

// 1. Arquivo único
const html = resolve(ENTREGAS, "vapti-apresentacao.html");
copyFileSync(DIST, html);
console.log(`✓ ${html} (${kb(html)})`);

const navegador = await abrirNavegador();
let bloqueadasTotal = 0;
try {
  // 2. PDF 16:9 (?print=1, modo claro, uma tela por página)
  {
    const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 1920, height: 1080 } });
    const p = await contexto.newPage();
    await p.emulateMedia({ media: "print", reducedMotion: "reduce" });
    await p.goto(`${URL_BASE}?print=1`);
    await p.waitForSelector("[data-pagina]");
    await esperarPronto(p, 800);
    const arq = resolve(ENTREGAS, "vapti-apresentacao.pdf");
    await p.pdf({ path: arq, width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
    console.log(`✓ ${arq} (${kb(arq)})`);
    bloqueadasTotal += bloqueadas.length;
    await contexto.close();
  }

  // 3. Resumo A4 (?resumo=1, uma página)
  {
    const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 1240, height: 1754 } });
    const p = await contexto.newPage();
    await p.emulateMedia({ media: "print", reducedMotion: "reduce" });
    await p.goto(`${URL_BASE}?resumo=1`);
    await p.waitForSelector(".folha");
    await esperarPronto(p, 500);
    const arq = resolve(ENTREGAS, "vapti-resumo.pdf");
    await p.pdf({ path: arq, format: "A4", printBackground: true, preferCSSPageSize: true });
    console.log(`✓ ${arq} (${kb(arq)})`);
    bloqueadasTotal += bloqueadas.length;
    await contexto.close();
  }

  // 4. Capturas do modo apresentação
  const { contexto: ctxIds } = await novoContexto(navegador);
  const ids = await idsDasTelas(ctxIds);
  await ctxIds.close();

  const capturar = async (largura, altura, lista) => {
    const pasta = resolve(QA, `${largura}x${altura}`);
    rmSync(pasta, { recursive: true, force: true });
    mkdirSync(pasta, { recursive: true });
    const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: largura, height: altura } });
    const p = await contexto.newPage();
    await p.goto(`${URL_BASE}#/${lista[0]}`);
    await p.waitForSelector(".palco");
    await esperarPronto(p, 2900); // espera a barra de controles sumir (mouse parado)
    for (const id of lista) {
      await p.evaluate((h) => (window.location.hash = h), `#/${id}`);
      await p.waitForFunction((id) => document.querySelector(`.palco [data-slide="${id}"]`), id);
      await esperarPronto(p, 450);
      await p.screenshot({ path: resolve(pasta, `${id}.png`) });
    }
    bloqueadasTotal += bloqueadas.length;
    await contexto.close();
    console.log(`✓ ${pasta} (${lista.length} capturas)`);
  };
  await capturar(1920, 1080, ids);
  await capturar(1440, 900, TELAS_CHAVE);
  await capturar(1280, 720, TELAS_CHAVE);

  // 5. Modo leitura no celular (390×844): página inteira e topo
  {
    const pasta = resolve(QA, "390x844");
    rmSync(pasta, { recursive: true, force: true });
    mkdirSync(pasta, { recursive: true });
    const { contexto, bloqueadas } = await novoContexto(navegador, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await contexto.newPage();
    await p.goto(URL_BASE);
    await p.waitForSelector("[data-exibicao='leitura']");
    await esperarPronto(p, 800);
    await p.screenshot({ path: resolve(pasta, "topo.png") });
    // rola até o fim para disparar o que depende de visibilidade, e volta ao topo
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await esperarPronto(p, 500);
    // página inteira com deviceScaleFactor 1 para não estourar o tamanho da imagem
    const ctx1 = await novoContexto(navegador, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p1 = await ctx1.contexto.newPage();
    await p1.goto(URL_BASE);
    await p1.waitForSelector("[data-exibicao='leitura']");
    await esperarPronto(p1, 800);
    await p1.screenshot({ path: resolve(pasta, "pagina-inteira.png"), fullPage: true });
    bloqueadasTotal += bloqueadas.length + ctx1.bloqueadas.length;
    await ctx1.contexto.close();
    await contexto.close();
    console.log(`✓ ${pasta} (topo e página inteira)`);
  }
} finally {
  await navegador.close();
}

console.log(`Requisições bloqueadas (rede): ${bloqueadasTotal}`);
if (bloqueadasTotal > 0) process.exitCode = 1;

if (!process.argv.includes("--sem-qa")) {
  const { rodarQa } = await import("./qa.mjs");
  const ok = await rodarQa();
  if (!ok) process.exitCode = 1;
}
