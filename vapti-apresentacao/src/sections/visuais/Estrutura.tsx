import { CalendarCheck, Check, Equal, Eye, ShieldCheck, X } from "lucide-react";
import { Icone } from "../../components/base";
import { caminhos, estrutura, gamificacao } from "../../data/vapti";
import { rotulos } from "../../content/ui";
import { Item, Rotulo } from "../Slide";

const ICONES_PRINCIPIOS = [CalendarCheck, Eye, Equal, ShieldCheck];

/** V11 — princípios do jogo justo. */
export function PrincipiosJogo() {
  return (
    <section aria-label={rotulos.principios.titulo}>
      <Rotulo tom="verde">{rotulos.principios.titulo}</Rotulo>
      <ol className="grade-4 mt-[var(--esp-4)]">
        {gamificacao.principios.map((p, i) => (
          <li key={p} className="relative flex flex-col rounded-3 border border-verde-borda bg-verde-suave p-[1em_1.1em]">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[4px] rounded-t-3 bg-verde" />
            <div className="flex items-center justify-between">
              <span className="text-verde">
                <Icone icone={ICONES_PRINCIPIOS[i % ICONES_PRINCIPIOS.length]} tamanho="1.5em" className="text-corpo-g" />
              </span>
              <span className="font-mono text-apoio text-texto-3">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="mt-[0.7em] text-corpo-g font-semibold text-texto" style={{ lineHeight: 1.25 }}>
              {p}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** V12 — três caminhos: ✕ ✕ ✓. */
export function TresCaminhos() {
  const r = rotulos.caminhos;
  return (
    <ol className="grade-3" style={{ ["--vao" as string]: "var(--esp-6)" }}>
      {caminhos.opcoes.map((o) => {
        const tom = o.ok ? "verde" : "coral";
        return (
          <li
            key={o.nome}
            className={`relative flex flex-col overflow-hidden rounded-3 border p-[1.1em_1.2em] ${
              o.ok ? "border-verde-borda bg-verde-suave shadow-2" : "border-borda bg-superficie"
            }`}
          >
            <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[4px] ${o.ok ? "bg-verde" : "bg-borda-forte"}`} />
            <div className="flex items-center gap-[0.6em]">
              <span
                className={`grid size-[1.7em] flex-none place-items-center rounded-full text-corpo-g ${
                  o.ok ? "bg-verde text-[var(--cor-sobre-verde)]" : "border-2 border-coral text-coral"
                }`}
              >
                <Icone icone={o.ok ? Check : X} tamanho="0.95em" strokeWidth={2.5} rotulo={o.ok ? r.viavel : r.descartado} />
              </span>
              <Rotulo tom={tom}>{o.ok ? r.viavel : r.descartado}</Rotulo>
            </div>
            <h3
              className={`mt-[0.55em] font-titulo font-bold ${o.ok ? "text-verde" : "text-texto"}`}
              style={{ fontSize: "var(--fs-subtitulo)", lineHeight: 1.12, letterSpacing: "-0.02em" }}
            >
              {o.nome}
            </h3>
            <ul className="mt-[0.7em] space-y-[0.45em] text-corpo text-texto-2" style={{ lineHeight: 1.35 }}>
              {o.motivos.map((m) => (
                <Item key={m} tom={o.ok ? "verde" : "coral"}>
                  {m}
                </Item>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

/** Regras da Resolução Conjunta nº 16 para a estrutura BaaS. */
export function RegrasBaas() {
  return (
    <section aria-label={rotulos.estrutura.regras}>
      <Rotulo tom="azul">{rotulos.estrutura.regras}</Rotulo>
      <ol className="grade-2 mt-[var(--esp-4)]" style={{ ["--vao" as string]: "var(--esp-4) var(--esp-7)" }}>
        {estrutura.regras.map((regra, i) => (
          <li key={regra} className="flex gap-[0.7em] border-t border-borda pt-[0.55em] text-corpo text-texto-2" style={{ lineHeight: 1.38 }}>
            <span className="font-mono text-azul">{String(i + 1).padStart(2, "0")}</span>
            <span>{regra}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
