// Texto em português do Brasil: normalização, números por extenso, sílabas, sílaba tônica e pronúncia.

export function semAcento(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// ---------- números por extenso (0..9999), para anos e pesos de duração ----------
const UN = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZ = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CEN = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

export function porExtenso(n) {
  if (n < 20) return UN[n];
  if (n < 100) return DEZ[Math.floor(n / 10)] + (n % 10 ? " e " + UN[n % 10] : "");
  if (n === 100) return "cem";
  if (n < 1000) return CEN[Math.floor(n / 100)] + (n % 100 ? " e " + porExtenso(n % 100) : "");
  if (n < 10000) {
    const m = Math.floor(n / 1000);
    const r = n % 1000;
    const milhar = m === 1 ? "mil" : UN[m] + " mil";
    if (!r) return milhar;
    return milhar + (r < 100 || r % 100 === 0 ? " e " : " ") + porExtenso(r);
  }
  return String(n);
}

/** Expande dígitos isolados em palavras (usado para a voz e para o peso de duração). */
export function expandirNumeros(texto) {
  return texto.replace(/\d+/g, (m) => porExtenso(parseInt(m, 10)));
}

// ---------- sílabas ----------
const VOGAIS = new Set("aeiouáéíóúâêôãõàü".split(""));
const ONSET2 = new Set(["qu", "gu", "br", "cr", "dr", "fr", "gr", "pr", "tr", "vr", "bl", "cl", "fl", "gl", "pl", "ch", "lh", "nh"]);
const DITONGOS = new Set(["ai", "ei", "oi", "ui", "au", "eu", "iu", "ou", "ao", "ãe", "õe", "éi", "ói", "ái", "au", "eu"]);

/** Separação silábica aproximada (suficiente para achar a sílaba tônica). */
export function silabas(palavra) {
  const p = palavra.toLowerCase().replace(/[^a-záéíóúâêôãõàüç]/g, "");
  if (!p) return [];
  const c = p.split("");
  // marca vogais; "u" depois de q/g antes de e/i é mudo (consoante)
  const ehV = c.map((ch, i) => {
    if (!VOGAIS.has(ch)) return false;
    if (ch === "u" && i > 0 && (c[i - 1] === "q" || (c[i - 1] === "g" && i + 1 < c.length && "eiéíê".includes(c[i + 1]))) && i + 1 < c.length && VOGAIS.has(c[i + 1])) return false;
    return true;
  });
  // núcleos: grupos de vogais, quebrando hiatos
  const nucleos = []; // [ini, fim)
  let i = 0;
  while (i < c.length) {
    if (!ehV[i]) {
      i++;
      continue;
    }
    let j = i + 1;
    while (j < c.length && ehV[j]) {
      const par = c[j - 1] + c[j];
      const semAc = semAcento(par);
      const ditongo = DITONGOS.has(par) || DITONGOS.has(semAc) || (c[j - 1] === "ã" && c[j] === "o") || (c[j - 1] === "õ" && c[j] === "e");
      if (ditongo || (j - i === 1 && /[iu]/.test(c[j]) && /[aeoáéóâêô]/.test(c[j - 1]) && !"áéíóú".includes(c[j]))) j++;
      else break;
    }
    nucleos.push([i, j]);
    i = j;
  }
  if (nucleos.length <= 1) return [p];
  const cortes = [0];
  for (let k = 0; k < nucleos.length - 1; k++) {
    const fimN = nucleos[k][1];
    const iniProx = nucleos[k + 1][0];
    const cons = p.slice(fimN, iniProx);
    let corte;
    if (cons.length === 0) corte = fimN;
    else if (cons.length === 1) corte = fimN;
    else {
      const ult2 = cons.slice(-2);
      if (ONSET2.has(ult2)) corte = iniProx - 2;
      else corte = iniProx - 1;
      if (cons.endsWith("rr") || cons.endsWith("ss")) corte = iniProx - 1;
    }
    cortes.push(corte);
  }
  cortes.push(p.length);
  const out = [];
  for (let k = 0; k < cortes.length - 1; k++) out.push(p.slice(cortes[k], cortes[k + 1]));
  return out.filter(Boolean);
}

const ACENTUADAS = /[áéíóúâêôãõ]/;
// nomes próprios e estrangeirismos que fogem da regra
const EXCECOES_TONICA = { vapti: 0, zippi: 0, pix: 0, baas: 0, mei: 0, esc: 0, dealroom: 0 };

/** Índice da sílaba tônica (heurística do português). */
export function indiceTonica(sils) {
  const n = sils.length;
  if (n <= 1) return 0;
  for (let i = 0; i < n; i++) if (ACENTUADAS.test(sils[i])) return i;
  const palavra = sils.join("");
  // oxítonas: terminadas em r, l, z, i, u, im, um, om, ins, uns, ão (acento já tratado)
  if (EXCECOES_TONICA[semAcento(palavra)] !== undefined) return Math.min(n - 1, EXCECOES_TONICA[semAcento(palavra)]);
  if (/(r|l|z|i|u|im|um|om|is|us|ins|uns|ons)$/.test(palavra)) return n - 1;
  return n - 2;
}

/** Peso de duração de uma palavra (≈ sílabas, com leve peso de letras). */
export function pesoPalavra(w) {
  let t = w.replace(/[^\p{L}\p{N}]/gu, "");
  if (!t) return 0.2;
  if (/^\d+$/.test(t)) t = porExtenso(parseInt(t, 10));
  const partes = t.split(/\s+/);
  let peso = 0;
  for (const parte of partes) {
    const s = silabas(parte);
    peso += Math.max(1, s.length) + 0.12 * parte.length;
  }
  return peso;
}

/** Fração (0..1) do início da sílaba tônica dentro da palavra. */
export function fracaoTonica(w) {
  let t = w.replace(/[^\p{L}\p{N}]/gu, "");
  if (/^\d+$/.test(t)) {
    t = porExtenso(parseInt(t, 10)).split(/\s+/)[0];
  }
  const s = silabas(t);
  if (s.length <= 1) return 0;
  const k = indiceTonica(s);
  // pesos: cada sílaba conta 1 + 0.12 por letra, como em pesoPalavra
  const pesos = s.map((x) => 1 + 0.12 * x.length);
  const total = pesos.reduce((a, b) => a + b, 0);
  const antes = pesos.slice(0, k).reduce((a, b) => a + b, 0);
  return antes / total;
}

// ---------- pronúncia para o sintetizador ----------
const PRONUNCIA = [
  [/\bZippi\b/g, "Zípi"],
  [/\bVapti\b/g, "Vápiti"],
  [/\bBaaS\b/g, "Bás"],
  [/\bESC\b/g, "ê ésse cê"],
  [/\bMEI\b/g, "mêi"],
  [/\bPix\b/g, "Piks"],
  [/\bDealroom\b/g, "Dílrum"],
  [/\bFIDC\b/g, "fidíce"],
  [/\bCCB\b/g, "cê cê bê"],
  [/\bOuro\b/g, "Ouro"],
];

/** Texto pronto para o sintetizador: números por extenso, siglas e nomes próprios com grafia fonética. */
export function textoParaVoz(texto) {
  let t = expandirNumeros(texto);
  for (const [re, sub] of PRONUNCIA) t = t.replace(re, sub);
  return t;
}

/** Tokeniza a fala em palavras (mantendo a pontuação colada, como na legenda). */
export function tokenizar(texto) {
  return texto.split(/\s+/).filter(Boolean);
}

/** Acha o primeiro token da expressão de ênfase dentro dos tokens; devolve {i, n} ou null. */
export function acharEnfase(tokens, enfase) {
  const alvo = tokenizar(enfase).map((x) => semAcento(x).replace(/[^a-z0-9]/g, ""));
  const norm = tokens.map((x) => semAcento(x).replace(/[^a-z0-9]/g, ""));
  for (const modo of ["exato", "sufixo"]) {
    for (let i = 0; i + alvo.length <= norm.length; i++) {
      let ok = true;
      for (let k = 0; k < alvo.length; k++) {
        const bate = modo === "exato" ? norm[i + k] === alvo[k] : norm[i + k].endsWith(alvo[k]);
        if (!bate) ok = false;
      }
      if (ok) return { i, n: alvo.length };
    }
  }
  return null;
}
