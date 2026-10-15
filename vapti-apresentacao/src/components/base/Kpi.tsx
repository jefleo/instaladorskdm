import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { semAnimacao } from "../../lib/modo";
import { Selo, type TipoSelo } from "./Selo";
import { corTexto, movimento, type Tom } from "./tons";

export interface KpiProps {
  /** Valor numérico final (vem de src/data/vapti.ts). */
  valor: number;
  /** Formata o número para exibição (ex.: v => "R$ 1,47 mi"). */
  formatar: (v: number) => string;
  rotulo: string;
  legenda?: string;
  tom?: Tom;
  selo?: TipoSelo;
  /** Premissas do selo Projeção, se diferentes das padrão. */
  premissas?: readonly string[];
  /** "g" herói (168px no palco), "m" grade (112px), "p" apoio (72px). */
  tamanho?: "g" | "m" | "p";
  /** Alinhamento do bloco. */
  alinhar?: "esquerda" | "centro";
  className?: string;
}

const FS = { g: "text-kpi", m: "text-kpi-m", p: "text-kpi-p" } as const;

/** Número protagonista: mono, contagem animada ao entrar na tela. */
export function Kpi({ valor, formatar, rotulo, legenda, tom = "verde", selo, premissas, tamanho = "m", alinhar = "esquerda", className }: KpiProps) {
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { once: true, amount: 0.5 });
  const [estatico] = useState(semAnimacao);
  const [atual, setAtual] = useState(estatico ? valor : 0);

  useEffect(() => {
    if (estatico) {
      setAtual(valor);
      return;
    }
    if (!visivel) return;
    const controle = animate(0, valor, {
      duration: movimento.contagem,
      ease: movimento.ease,
      onUpdate: (v) => setAtual(v),
    });
    return () => controle.stop();
  }, [visivel, valor, estatico]);

  const final = formatar(valor);
  const centro = alinhar === "centro";

  return (
    <div ref={ref} className={`flex flex-col ${centro ? "items-center text-center" : "items-start"} ${className ?? ""}`}>
      <p className="flex flex-wrap items-center gap-x-[0.7em] gap-y-[0.4em] font-texto text-corpo font-semibold text-texto-2">
        <span>{rotulo}</span>
        {selo ? <Selo tipo={selo} premissas={premissas} tamanho="sm" /> : null}
      </p>
      {/* Pilha em grade: o valor final invisível reserva a largura e evita "pulos" na contagem */}
      <p
        className={`mt-[0.12em] grid font-mono font-bold ${FS[tamanho]} ${corTexto[tom]}`}
        style={{ lineHeight: "var(--lh-justo)", letterSpacing: "var(--tracking-kpi)", fontVariantNumeric: "tabular-nums" }}
      >
        <span className="invisible col-start-1 row-start-1" aria-hidden="true">{final}</span>
        <span className="col-start-1 row-start-1" aria-hidden="true">{estatico ? final : formatar(atual)}</span>
        <span className="sr-only-vapti">{final}</span>
      </p>
      {legenda ? (
        <p className="mt-[0.6em] max-w-[34ch] font-texto text-apoio text-texto-3" style={{ lineHeight: 1.35 }}>
          {legenda}
        </p>
      ) : null}
    </div>
  );
}
