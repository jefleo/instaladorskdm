/**
 * Monta o palco 1920×1080 e expõe `window.__vapti` (SPEC §3) para o renderizador:
 *   duracao, fps, pronto (fontes + grão prontos) e setTime(t) — render SÍNCRONO via flushSync,
 *   depois document.fonts.ready e dois requestAnimationFrame.
 *
 * Parâmetros de URL:
 *   ?w=1920&h=1080  escala o palco por transform (padrão 1920×1080)
 *   ?rascunho=1     sem grão (prévia)
 *   ?legenda=1      legenda queimada
 *   ?demo=1         sequência de teste do kit (~8 s), em vez do filme
 *   ?t=12.5         instante inicial (prévia)
 *   ?hud=1          mostra tempo/frase por cima (só prévia; ver kit/previa.ts)
 */
import "./video.css";
import { useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Film } from "./Film";
import { cenas } from "./scenes";
import { cenasDemo, tlDemo } from "./scenes/_demo";
import { timelineOuNada } from "./timeline";
import { prepararTexturas } from "./kit";
import { iniciarPrevia } from "./kit/previa";

declare global {
  interface Window {
    __vapti: {
      duracao: number;
      fps: number;
      pronto: Promise<void>;
      setTime(t: number): Promise<void>;
    };
  }
}

const params = new URLSearchParams(window.location.search);
const numero = (v: string | null, padrao: number) => {
  const n = v === null ? NaN : Number(v);
  return Number.isFinite(n) && n > 0 ? n : padrao;
};
const flag = (nome: string) => params.has(nome) && params.get(nome) !== "0" && params.get(nome) !== "false";

const W = numero(params.get("w"), 1920);
const H = numero(params.get("h"), 1080);
const escala = Math.min(W / 1920, H / 1080);
const demo = flag("demo");
const rascunho = flag("rascunho");
const legenda = flag("legenda");
const tl = demo ? tlDemo : timelineOuNada;

/* ---- Relógio externo: o único "estado" do filme é o t pedido pelo renderizador ---- */
let tAtual = Number(params.get("t") ?? 0) || 0;
const ouvintes = new Set<() => void>();
const assinar = (cb: () => void) => {
  ouvintes.add(cb);
  return () => {
    ouvintes.delete(cb);
  };
};
const lerT = () => tAtual;

function SemTimeline() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <p className="font-mono" style={{ fontSize: 30, color: "var(--cor-coral)" }}>
        video/build/timeline.json não existe — rode npm run video:timeline
      </p>
    </div>
  );
}

function App() {
  const t = useSyncExternalStore(assinar, lerT);
  return (
    <div id="palco" style={{ transform: escala === 1 ? undefined : `scale(${escala})` }}>
      {tl ? <Film tl={tl} cenas={demo ? cenasDemo : cenas} t={t} rascunho={rascunho} legenda={legenda} marcaDesde={demo ? "D01" : "F009"} /> : <SemTimeline />}
    </div>
  );
}

document.body.style.width = `${W}px`;
document.body.style.height = `${H}px`;

const raiz = createRoot(document.getElementById("raiz")!);
flushSync(() => raiz.render(<App />));

const doisQuadros = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

/** Faces usadas pelo filme: carregadas antes do primeiro quadro (evita troca de fonte no meio). */
const FONTES = [
  '500 64px "Bricolage Grotesque"',
  '700 64px "Bricolage Grotesque"',
  '800 64px "Bricolage Grotesque"',
  '400 32px "Manrope"',
  '500 32px "Manrope"',
  '600 32px "Manrope"',
  '700 32px "Manrope"',
  '400 32px "JetBrains Mono"',
  '500 32px "JetBrains Mono"',
  '700 32px "JetBrains Mono"',
];

/** Renderiza o quadro do instante `t` de forma síncrona e espera a pintura. */
async function setTime(t: number): Promise<void> {
  flushSync(() => {
    tAtual = t;
    ouvintes.forEach((f) => f());
  });
  await document.fonts.ready;
  await doisQuadros();
}

const pronto = (async () => {
  if (!tl) throw new Error("video/build/timeline.json não existe: rode `npm run video:timeline`.");
  await prepararTexturas();
  await Promise.all(FONTES.map((f) => document.fonts.load(f, "Vapti R$ 0123456789 ÁÉçãõ×→")));
  await document.fonts.ready;
  await setTime(tAtual);
})();

window.__vapti = {
  duracao: tl?.duracao ?? 0,
  fps: tl?.fps ?? 30,
  pronto,
  setTime,
};

// Prévia interativa (teclado, ?hud=1). Não roda nada sozinha durante a captura.
if (tl) iniciarPrevia({ tl, setTime, lerT, hud: flag("hud") });
