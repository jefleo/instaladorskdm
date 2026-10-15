/**
 * Tela 1 — Conversa com balões genéricos (sem marca de aplicativo de terceiros).
 * O cliente manda um áudio; o assistente responde e envia o link da plataforma.
 */
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { ArrowUpRight, ChevronLeft, Mic, Pause, Play } from "lucide-react";
import { Icone, Wordmark } from "../base";
import { prototipo } from "../../content/ui";
import { Tela, trans, useCelular } from "./pecas";

const c = prototipo.conversa;
type Balao = (typeof c.baloes)[number];

/** Forma de onda decorativa (determinística, sem dado). */
const ONDA = Array.from({ length: 36 }, (_, i) => 0.22 + 0.78 * Math.abs(Math.sin(i * 1.71) * Math.cos(i * 0.43 + 0.6)));

export function TelaConversa({ aoAbrirLink }: { aoAbrirLink: () => void }) {
  const { estatico } = useCelular();
  const total = c.baloes.length;
  const raiz = useRef<HTMLDivElement>(null);
  const rolagem = useRef<HTMLDivElement>(null);
  const visivel = useInView(raiz, { once: true, amount: 0.3 });
  const [mostrados, setMostrados] = useState(estatico ? total : 0);
  const [digitando, setDigitando] = useState(false);

  // Revela os balões em sequência quando a tela entra em cena.
  useEffect(() => {
    if (estatico || !visivel) return;
    const timers: number[] = [];
    let t = 250;
    timers.push(window.setTimeout(() => setMostrados(1), t));
    for (let k = 1; k < total; k++) {
      t += 420;
      timers.push(window.setTimeout(() => setDigitando(true), t));
      t += k === 1 ? 900 : 650;
      const n = k + 1;
      timers.push(
        window.setTimeout(() => {
          setDigitando(false);
          setMostrados(n);
        }, t),
      );
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [estatico, visivel, total]);

  // Mantém o último balão à vista.
  useEffect(() => {
    const el = rolagem.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: estatico ? "auto" : "smooth" });
  }, [mostrados, digitando, estatico]);

  const topo = (
    <div className="flex h-[60px] items-center gap-[10px] border-b border-borda px-[12px]">
      <span aria-hidden="true" className="grid size-[32px] place-items-center text-texto-2">
        <Icone icone={ChevronLeft} tamanho={24} />
      </span>
      <span aria-hidden="true" className="grid size-[40px] place-items-center rounded-full bg-verde">
        <span className="font-titulo text-[20px] font-extrabold leading-none tracking-[-0.05em] text-[var(--cor-sobre-verde)]">V</span>
      </span>
      <div className="min-w-0 leading-tight">
        <h3 className="font-texto text-[17px] font-bold tracking-normal text-texto">{c.contato}</h3>
        <p className="font-texto text-[13px] text-texto-3">{c.contatoStatus}</p>
      </div>
    </div>
  );

  const compositor = (
    <div aria-hidden="true" className="flex items-center gap-[10px]">
      <div className="flex h-[46px] flex-1 items-center rounded-full border border-borda bg-superficie px-[18px] font-texto text-[16px] text-texto-3">
        {c.campo}
      </div>
      <span className="grid size-[46px] place-items-center rounded-full bg-superficie-3 text-texto">
        <Icone icone={Mic} tamanho={21} />
      </span>
    </div>
  );

  return (
    <div ref={raiz} className="h-full">
      <Tela topo={topo} fundoTopo="bg-superficie" rodape={compositor} rolagemRef={rolagem} className="px-[14px] pb-[16px]">
        <div className="flex justify-center py-[14px]">
          <span className="rounded-full bg-superficie-2 px-[12px] py-[4px] font-mono text-[12px] uppercase tracking-[0.1em] text-texto-3">{c.hoje}</span>
        </div>
        <ol className="flex flex-col gap-[10px]" aria-live="polite">
          {c.baloes.slice(0, mostrados).map((b, i) => (
            <motion.li
              key={i}
              initial={estatico ? false : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={trans(estatico, 0.3)}
              className={`flex ${b.de === "cliente" ? "justify-end" : "justify-start"}`}
              style={{ transformOrigin: b.de === "cliente" ? "right bottom" : "left bottom" }}
            >
              <BalaoConteudo balao={b} aoAbrirLink={aoAbrirLink} />
            </motion.li>
          ))}
          {digitando ? (
            <li className="flex justify-start" aria-label={c.digitando}>
              <span className="flex items-center gap-[5px] rounded-[18px] rounded-bl-[6px] border border-borda bg-superficie px-[14px] py-[13px]">
                {[0, 1, 2].map((k) => (
                  <motion.span
                    key={k}
                    className="size-[7px] rounded-full bg-texto-3"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: k * 0.15 }}
                  />
                ))}
              </span>
            </li>
          ) : null}
        </ol>
      </Tela>
    </div>
  );
}

function BalaoConteudo({ balao, aoAbrirLink }: { balao: Balao; aoAbrirLink: () => void }) {
  if (balao.tipo === "audio") return <BalaoAudio duracao={balao.duracao} transcricao={balao.transcricao} />;
  if (balao.tipo === "link") {
    return (
      <div className="w-[272px] overflow-hidden rounded-[18px] rounded-bl-[6px] border border-borda bg-superficie">
        <div className="border-b border-borda bg-superficie-2 px-[16px] pb-[14px] pt-[16px]">
          <Wordmark tamanho={26} />
          <p className="mt-[10px] font-texto text-[15px] font-bold text-texto">{c.linkTitulo}</p>
          <p className="font-texto text-[14px] text-texto-2">{c.linkTexto}</p>
        </div>
        <div className="p-[10px]">
          <button
            type="button"
            onClick={aoAbrirLink}
            className="flex h-[46px] w-full items-center justify-center gap-[8px] rounded-[12px] bg-verde font-texto text-[16px] font-bold text-[var(--cor-sobre-verde)] transition-transform duration-200 active:scale-[0.98]"
          >
            {balao.texto}
            <Icone icone={ArrowUpRight} tamanho={18} />
          </button>
        </div>
      </div>
    );
  }
  return (
    <p className="max-w-[282px] rounded-[18px] rounded-bl-[6px] border border-borda bg-superficie px-[14px] py-[10px] font-texto text-[16px] leading-[1.38] text-texto">
      {balao.texto}
    </p>
  );
}

function BalaoAudio({ duracao, transcricao }: { duracao: string; transcricao: string }) {
  const { estatico } = useCelular();
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const controle = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => () => controle.current?.stop(), []);

  const alternar = () => {
    if (tocando) {
      controle.current?.stop();
      setTocando(false);
      return;
    }
    if (estatico) {
      setProgresso(1);
      return;
    }
    setTocando(true);
    const inicio = progresso >= 1 ? 0 : progresso;
    controle.current = animate(inicio, 1, {
      duration: 2.6 * (1 - inicio),
      ease: "linear",
      onUpdate: setProgresso,
      onComplete: () => setTocando(false),
    });
  };

  return (
    <div className="w-[282px] rounded-[18px] rounded-br-[6px] bg-superficie-3 px-[12px] pb-[10px] pt-[10px]">
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          onClick={alternar}
          aria-label={tocando ? c.pausar : c.ouvir}
          className="grid size-[40px] flex-none place-items-center rounded-full bg-texto text-tinta"
        >
          <Icone icone={tocando ? Pause : Play} tamanho={18} className={tocando ? "" : "translate-x-[1px]"} />
        </button>
        <svg viewBox={`0 0 ${ONDA.length * 5} 32`} className="h-[32px] flex-1" aria-label={c.audioRotulo} role="img">
          {ONDA.map((h, i) => {
            const altura = Math.max(3, h * 30);
            const ouvido = i / ONDA.length < progresso;
            return (
              <rect
                key={i}
                x={i * 5 + 1}
                y={16 - altura / 2}
                width={2.6}
                height={altura}
                rx={1.3}
                fill={ouvido ? "var(--cor-verde)" : "var(--cor-texto-3)"}
              />
            );
          })}
        </svg>
        <span className="flex-none font-mono text-[13px] text-texto-2">{duracao}</span>
      </div>
      <p className="mt-[8px] border-t border-borda-forte pt-[7px] font-texto text-[13px] leading-snug text-texto-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-texto-3">{c.transcricao} · </span>
        {transcricao}
      </p>
    </div>
  );
}
