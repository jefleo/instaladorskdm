// Temporário (scratch): capturas rápidas de telas escolhidas. Removido ao final.
import { resolve } from "node:path";
import { URL_BASE, abrirNavegador, esperarPronto, novoContexto } from "./comum.mjs";
const OUT = process.env.OUT;
const ids = process.argv.slice(2);
const nav = await abrirNavegador();
const { contexto } = await novoContexto(nav, { viewport: { width: 1920, height: 1080 } });
const p = await contexto.newPage();
const erros = [];
p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && erros.push(m.text()));
p.on("pageerror", (e) => erros.push(String(e)));
await p.goto(`${URL_BASE}#/${ids[0]}`);
await p.waitForSelector(".palco");
await esperarPronto(p, 2900);
for (const id of ids) {
  await p.evaluate((h) => (window.location.hash = h), `#/${id}`);
  await p.waitForFunction((id) => document.querySelector(`.palco [data-slide="${id}"]`), id);
  await esperarPronto(p, 500);
  const esc = await p.$$eval(".palco [data-escala]", (els) => els.map((e) => e.getAttribute("data-escala")));
  console.log(id, "escalas:", esc.join(","));
  await p.screenshot({ path: resolve(OUT, `${id}.png`) });
}
console.log("erros:", erros);
await nav.close();
