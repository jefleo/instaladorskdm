// Utilidades comuns de entregas.mjs e qa.mjs (Playwright, arquivo único via file://).
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const DIST = resolve(RAIZ, "dist/index.html");
export const ENTREGAS = resolve(RAIZ, "entregas");
export const QA = resolve(ENTREGAS, "qa");
export const URL_BASE = pathToFileURL(DIST).href;

/** Telas-chave para capturas em 1440×900 e 1280×720. */
export const TELAS_CHAVE = ["00", "02", "03", "04", "06c", "07", "07c", "09", "10", "11", "11c", "13"];

const CANDIDATOS = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].filter(Boolean);

export async function abrirNavegador() {
  const executablePath = CANDIDATOS.find((p) => existsSync(p));
  return chromium.launch(executablePath ? { executablePath } : {});
}

/** Contexto com a rede bloqueada: só file:// passa. Devolve o contador de bloqueios. */
export async function novoContexto(navegador, opcoes = {}) {
  const contexto = await navegador.newContext({ reducedMotion: "reduce", ...opcoes });
  const bloqueadas = [];
  await contexto.route("**/*", (r) => {
    const url = r.request().url();
    if (url.startsWith("file:") || url.startsWith("data:") || url.startsWith("blob:")) return r.continue();
    bloqueadas.push(url);
    return r.abort();
  });
  return { contexto, bloqueadas };
}

/** Coleta erros e warnings de console e exceções de página. */
export function vigiarConsole(pagina, onde) {
  const mensagens = [];
  pagina.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") mensagens.push({ onde: onde(), tipo: m.type(), texto: m.text() });
  });
  pagina.on("pageerror", (e) => mensagens.push({ onde: onde(), tipo: "pageerror", texto: String(e) }));
  return mensagens;
}

export async function esperarPronto(pagina, pausa = 350) {
  await pagina.evaluate(() => document.fonts.ready.then(() => undefined));
  await pagina.waitForTimeout(pausa);
}

/** Ids de todas as telas, na ordem, lidos do modo impressão. */
export async function idsDasTelas(contexto) {
  const p = await contexto.newPage();
  await p.goto(`${URL_BASE}?print=1`);
  await p.waitForSelector("[data-pagina]");
  const ids = await p.$$eval("[data-pagina]", (els) => els.map((e) => e.getAttribute("data-pagina")));
  await p.close();
  return ids;
}
