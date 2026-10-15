import type { ReactNode } from "react";
import { ShieldAlert, TrendingUp } from "lucide-react";
import { Card, Selo } from "../../components/base";
import { riscos, vantagens } from "../../data/vapti";
import { rotulos } from "../../content/ui";

/*
 * V19 — vantagens e riscos lado a lado, com o MESMO peso visual:
 * mesmo <Card> (verde × coral), mesma largura, mesma altura, mesmo título,
 * mesma numeração e o mesmo tamanho de texto nos itens.
 */

export interface FaixaLista {
  /** Índices [de, até) da lista de vantagens. */
  vantagens: [number, number];
  /** Índices [de, até) da lista de riscos. */
  riscos: [number, number];
}

/** Riscos cujo texto traz número projetado (a perda de equilíbrio). */
const RISCO_PROJETADO = new Set([0]);

export function VantagensRiscos({ faixa }: { faixa: FaixaLista }) {
  const r = rotulos.vantagensRiscos;
  const [v0, v1] = faixa.vantagens;
  const [r0, r1] = faixa.riscos;
  return (
    <div className="grade-2 encher" style={{ ["--vao" as string]: "var(--esp-6)" }}>
      <Card tom="verde" titulo={r.vantagens} icone={TrendingUp} como="section" className="h-full">
        <Contagem texto={r.faixa(v0 + 1, v1, vantagens.length)} />
        <ol className="mt-[0.6em] space-y-[0.9em]">
          {vantagens.slice(v0, v1).map((v, i) => (
            <Linha key={v} numero={v0 + i + 1} tom="verde" principal={v} />
          ))}
        </ol>
      </Card>
      <Card tom="coral" titulo={r.riscosMitigacao} icone={ShieldAlert} como="section" className="h-full">
        <Contagem texto={r.faixa(r0 + 1, r1, riscos.length)} />
        <ol className="mt-[0.6em] space-y-[0.9em]">
          {riscos.slice(r0, r1).map((x, i) => (
            <Linha
              key={x.risco}
              numero={r0 + i + 1}
              tom="coral"
              principal={x.risco}
              projecao={RISCO_PROJETADO.has(r0 + i)}
              secundario={
                <>
                  <span className="font-mono uppercase text-coral" style={{ letterSpacing: "0.06em" }}>
                    {r.mitigacao}
                  </span>{" "}
                  {x.mitigacao}
                </>
              }
            />
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Contagem({ texto }: { texto: string }) {
  return (
    <p className="-mt-[0.2em] font-mono text-apoio uppercase text-texto-3" style={{ letterSpacing: "0.1em" }}>
      {texto}
    </p>
  );
}

function Linha({
  numero,
  tom,
  principal,
  secundario,
  projecao,
}: {
  numero: number;
  tom: "verde" | "coral";
  principal: string;
  secundario?: ReactNode;
  projecao?: boolean;
}) {
  return (
    <li className="grid grid-cols-[2.1em_minmax(0,1fr)] gap-x-[0.5em] border-t border-borda pt-[0.7em]">
      <span className={`font-mono font-bold ${tom === "verde" ? "text-verde" : "text-coral"}`} style={{ lineHeight: 1.35 }}>
        {String(numero).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-texto" style={{ lineHeight: 1.35 }}>
          {principal}
          {projecao ? (
            <>
              {" "}
              <Selo tipo="projecao" className="align-middle" />
            </>
          ) : null}
        </p>
        {secundario ? (
          <p className="mt-[0.3em] text-apoio text-texto-2" style={{ lineHeight: 1.4 }}>
            {secundario}
          </p>
        ) : null}
      </div>
    </li>
  );
}
