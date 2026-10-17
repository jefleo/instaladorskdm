/**
 * Prévia interativa do filme (npm run video:dev). SÓ PARA OLHAR: nunca roda sozinha
 * durante a captura — o renderizador não aperta teclas e não usa ?hud=1.
 *
 * Teclas: espaço = tocar/pausar · ←/→ = ±1 s (Shift: ±5 s) · , . = ±1 quadro ·
 * Home = início · End = card final · H = liga/desliga o HUD.
 * O relógio de reprodução usa o tempo real do navegador; as cenas continuam f(t).
 */
import { indiceFraseEm, type Timeline } from "../timeline";

interface Opcoes {
  tl: Timeline;
  setTime: (t: number) => Promise<void>;
  lerT: () => number;
  hud: boolean;
}

export function iniciarPrevia({ tl, setTime, lerT, hud }: Opcoes) {
  let tocando = false;
  let ultimo = 0;
  let mostrarHud = hud;
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;left:8px;bottom:8px;z-index:9;font:600 13px/1.3 'JetBrains Mono',monospace;color:#B6F23A;background:rgb(0 0 0 / .7);padding:6px 10px;border-radius:6px;pointer-events:none;white-space:pre";
  const atualizarHud = () => {
    el.style.display = mostrarHud ? "block" : "none";
    if (!mostrarHud) return;
    const t = lerT();
    const i = indiceFraseEm(tl, t);
    const f = i >= 0 ? tl.frases[i] : null;
    el.textContent = `t ${t.toFixed(2)} s · quadro ${Math.floor(t * tl.fps)} · ${f ? `${f.ato} ${f.id} ${f.layout}` : "—"}${tocando ? " ▶" : ""}`;
  };
  document.body.appendChild(el);

  const ir = (t: number) => {
    const alvo = Math.max(0, Math.min(tl.duracao, t));
    void setTime(alvo).then(atualizarHud);
  };

  const passo = (agora: number) => {
    if (!tocando) return;
    const dt = ultimo ? (agora - ultimo) / 1000 : 0;
    ultimo = agora;
    const t = lerT() + dt;
    if (t >= tl.duracao) tocando = false;
    ir(t);
    requestAnimationFrame(passo);
  };

  window.addEventListener("keydown", (e) => {
    const q = 1 / tl.fps;
    const salto = e.shiftKey ? 5 : 1;
    if (e.key === " ") {
      tocando = !tocando;
      ultimo = 0;
      if (tocando) requestAnimationFrame(passo);
    } else if (e.key === "ArrowRight") ir(lerT() + salto);
    else if (e.key === "ArrowLeft") ir(lerT() - salto);
    else if (e.key === ".") ir(lerT() + q);
    else if (e.key === ",") ir(lerT() - q);
    else if (e.key === "Home") ir(0);
    else if (e.key === "End") ir(tl.marcas.cardFinal[0]);
    else if (e.key === "h" || e.key === "H") mostrarHud = !mostrarHud;
    else return;
    e.preventDefault();
    atualizarHud();
  });
  atualizarHud();
}
