import { Kpi } from "../../components/base";
import { zippi } from "../../data/vapti";
import { rotulos } from "../../content/ui";
import { formatadorDe } from "../numero";

/** V06 — números da Zippi hoje. Zippi sempre em cinza, só texto; valor estimado sempre com a etiqueta. */
export function NumerosZippi({ horizontal = false }: { horizontal?: boolean }) {
  const r = rotulos.zippiHoje;
  const itens = [
    { num: zippi.concedido, rotulo: r.concedido, nota: r.fonte(zippi.concedido.fonte), estimativa: false },
    { num: zippi.valorEstimado, rotulo: r.valor, nota: r.etiquetaValor, estimativa: true },
    { num: zippi.autonomosApp, rotulo: r.autonomos, nota: r.fonte(zippi.autonomosApp.fonte), estimativa: false },
  ];
  return (
    <ul className={horizontal ? "grade-3" : "grid gap-[var(--esp-4)]"} aria-label={r.titulo}>
      {itens.map((i) => (
        <li
          key={i.rotulo}
          className="flex flex-wrap items-end justify-between gap-x-[var(--esp-6)] gap-y-[var(--esp-3)] rounded-3 border border-cinza-borda bg-cinza-suave px-[1.1em] py-[0.8em]"
        >
          <Kpi valor={i.num.valor} formatar={formatadorDe(i.num)} rotulo={i.rotulo} tom="cinza" tamanho="p" />
          {i.estimativa ? (
            <span
              className="mb-[0.3em] inline-flex items-center whitespace-nowrap rounded-full border border-dashed border-cinza px-[0.8em] py-[0.35em] font-mono text-apoio uppercase text-texto-2"
              style={{ letterSpacing: "0.06em", lineHeight: 1.1 }}
            >
              {i.nota}
            </span>
          ) : (
            <span className="mb-[0.35em] text-apoio text-texto-3">{i.nota}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
