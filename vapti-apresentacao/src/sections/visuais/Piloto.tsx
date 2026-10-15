import type { ReactNode } from "react";
import { piloto } from "../../data/vapti";
import { rotulos } from "../../content/ui";
import type { Secao } from "../../content/tipos";
import { Rotulo } from "../Slide";

/** Ordem das metas no semáforo (V22): as quatro que decidem a escala, depois as operacionais. */
const METAS_PRINCIPAIS = [0, 1, 3, 2];
const METAS_OPERACIONAIS = [4, 5, 6];

type Luz = "verde" | "coral" | "azul";

const LUZ: Record<Luz, { caixa: string; barra: string; titulo: string; ponto: string }> = {
  verde: { caixa: "border-verde-borda bg-verde-suave", barra: "bg-verde", titulo: "text-verde", ponto: "var(--cor-verde)" },
  coral: { caixa: "border-coral-borda bg-coral-suave", barra: "bg-coral", titulo: "text-coral", ponto: "var(--cor-coral)" },
  azul: { caixa: "border-azul-borda bg-azul-suave", barra: "bg-azul", titulo: "text-azul", ponto: "var(--cor-azul)" },
};

/** V22 — piloto em semáforo: metas (verde), parada (coral) e escala. */
export function PilotoSemaforo({ secao }: { secao: Secao }) {
  const [bMetas, bParada, bEscala, bPorque] = secao.blocos;
  return (
    <div className="flex flex-col gap-[var(--esp-6)]">
      <div className="grade-3" style={{ ["--vao" as string]: "var(--esp-6)" }}>
        <Coluna luz="verde" titulo={bMetas?.titulo ?? ""}>
          {METAS_PRINCIPAIS.map((i) => (
            <Linha key={i} luz="verde">
              {piloto.metas[i]}
            </Linha>
          ))}
        </Coluna>
        <Coluna luz="coral" titulo={bParada?.titulo ?? ""}>
          {piloto.parada.map((p) => (
            <Linha key={p} luz="coral">
              {p}
            </Linha>
          ))}
        </Coluna>
        <Coluna luz="azul" titulo={bEscala?.titulo ?? ""} rodape={piloto.escalaNota}>
          {piloto.escala.map((e) => (
            <Linha key={e} luz="azul">
              {e}
            </Linha>
          ))}
        </Coluna>
      </div>

      <div className="dividir" style={{ ["--colunas" as string]: "minmax(0, 1.25fr) minmax(0, 1fr)", ["--vao" as string]: "var(--esp-7)" }}>
        <div>
          <Rotulo>{rotulos.piloto.operacionais}</Rotulo>
          <ul className="mt-[0.4em] flex flex-wrap gap-[var(--esp-3)]">
            {METAS_OPERACIONAIS.map((i) => (
              <li key={i} className="rounded-full border border-borda-forte px-[0.8em] py-[0.25em] text-apoio font-medium text-texto-2">
                {piloto.metas[i]}
              </li>
            ))}
          </ul>
        </div>
        {bPorque ? (
          <div className="border-l-[3px] border-verde pl-[0.85em]">
            <p className="font-titulo text-corpo-g font-bold text-texto">{bPorque.titulo}</p>
            <p className="mt-[0.25em] text-corpo text-texto-2" style={{ lineHeight: 1.4 }}>
              {bPorque.texto}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Coluna({ luz, titulo, rodape, children }: { luz: Luz; titulo: string; rodape?: string; children: ReactNode }) {
  const c = LUZ[luz];
  return (
    <section aria-label={titulo} className={`relative flex flex-col overflow-hidden rounded-3 border p-[1em_1.15em] ${c.caixa}`}>
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[4px] ${c.barra}`} />
      <h3 className={`flex items-center gap-[0.55em] font-titulo text-h3 font-bold ${c.titulo}`} style={{ lineHeight: 1.08 }}>
        <span
          aria-hidden="true"
          className="inline-block size-[0.62em] flex-none rounded-full"
          style={{ background: c.ponto, boxShadow: `0 0 0 0.16em color-mix(in srgb, ${c.ponto} 22%, transparent)` }}
        />
        {titulo}
      </h3>
      <ul className="mt-[0.55em] space-y-[0.5em] text-corpo text-texto" style={{ lineHeight: 1.35 }}>
        {children}
      </ul>
      {rodape ? (
        <p className="mt-auto pt-[0.8em] text-apoio font-medium text-texto-2" style={{ lineHeight: 1.4 }}>
          {rodape}
        </p>
      ) : null}
    </section>
  );
}

function Linha({ luz, children }: { luz: Luz; children: ReactNode }) {
  return (
    <li className="flex gap-[0.6em] border-t border-borda pt-[0.45em]">
      <span aria-hidden="true" className="mt-[0.5em] size-[0.42em] flex-none rounded-full" style={{ background: LUZ[luz].ponto }} />
      <span className="min-w-0 font-medium">{children}</span>
    </li>
  );
}
