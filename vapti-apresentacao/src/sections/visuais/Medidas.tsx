import { ChevronRight } from "lucide-react";
import { Icone, Selo, TabelaComparativa } from "../../components/base";
import { comoMedimos, fases, fontes, rollRateFaixas, type Fase, type Num } from "../../data/vapti";
import { rotulos } from "../../content/ui";
import { dominio } from "../numero";
import { Encaixe, Rotulo } from "../Slide";

/** Painel "Como medimos": as cinco medidas e as faixas de atraso acompanhadas. */
export function ComoMedimos() {
  const ultima = rollRateFaixas.length - 1;
  return (
    <div className="flex flex-col gap-[var(--esp-7)]">
      <section aria-label={rotulos.comoMedimos.faixas}>
        <Rotulo tom="azul">{rotulos.comoMedimos.faixas}</Rotulo>
        <ol className="faixas mt-[var(--esp-4)]">
          {rollRateFaixas.map((f, i) => {
            const cor = i === 0 ? "border-verde-borda bg-verde-suave text-verde" : i === ultima ? "border-coral-borda bg-coral-suave text-coral" : "border-borda-forte bg-superficie text-texto";
            return (
              <li key={f} className="flex items-center gap-[var(--esp-3)]">
                <span className={`rounded-2 border px-[0.9em] py-[0.4em] font-mono text-corpo-g font-bold ${cor}`} style={{ letterSpacing: "-0.02em" }}>
                  {f}
                </span>
                {i < ultima ? (
                  <span className="text-texto-3" aria-hidden="true">
                    <Icone icone={ChevronRight} tamanho="1.3em" className="text-corpo-g" />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>
      <ol className="grade-5" style={{ ["--vao" as string]: "var(--esp-5)" }}>
        {comoMedimos.map((m, i) => (
          <li key={m.titulo} className="relative overflow-hidden rounded-3 border border-borda bg-superficie p-[1em_1.05em]">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[4px] bg-azul" />
            <p className="font-mono text-apoio text-azul">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-[0.3em] font-titulo text-corpo-g font-bold text-texto" style={{ lineHeight: 1.12 }}>
              {m.titulo}
            </h3>
            <p className="mt-[0.45em] text-corpo text-texto-2" style={{ lineHeight: 1.38 }}>
              {m.texto}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

type ChaveFase = (typeof rotulos.tabelaFases.linhas)[number]["chave"];
interface LinhaFases {
  chave: ChaveFase;
  rotulo: string;
  valores: string[];
}

/** Tabela das três fases (Tabela B), transposta: métricas nas linhas, fases nas colunas. */
export function TabelaFases() {
  const r = rotulos.tabelaFases;
  const linhas: LinhaFases[] = r.linhas.map((l) => ({
    chave: l.chave,
    rotulo: l.rotulo,
    valores: fases.map((f) => (f[l.chave as keyof Fase] as Num).rotulo),
  }));
  const destaque = linhas.findIndex((l) => l.chave === r.destaque);
  return (
    <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 2.7fr) minmax(0, 1fr)", ["--vao" as string]: "var(--esp-7)" }}>
      <Encaixe className="min-w-0">
        <TabelaComparativa<LinhaFases>
          legenda={r.legenda}
          className="tabela-compacta"
          destaque={destaque}
          chaveLinha={(l) => l.chave}
          colunas={[
            { chave: "rotulo", titulo: r.metrica, largura: "34%" },
            ...fases.map((f, i) => ({
              chave: `f${f.fase}`,
              titulo: (
                <>
                  {r.fase(f.fase)}
                  <span className="block normal-case text-texto-3">{f.periodo}</span>
                </>
              ),
              numerica: true,
              celula: (l: LinhaFases) => l.valores[i],
            })),
          ]}
          linhas={linhas}
        />
        <p className="mt-[var(--esp-4)] flex flex-wrap items-center gap-x-[0.8em] gap-y-[0.4em] text-apoio text-texto-3">
          <Selo tipo="projecao" />
          <span>{r.legenda}</span>
        </p>
      </Encaixe>
      <section aria-label={r.financiamento}>
        <Rotulo>{r.financiamento}</Rotulo>
        <ol className="mt-[var(--esp-3)] space-y-[0.7em]">
          {fases.map((f) => (
            <li key={f.fase} className="border-t border-borda pt-[0.5em]">
              <p className="font-titulo text-corpo font-bold text-texto">{r.fase(f.fase)}</p>
              <p className="mt-[0.2em] text-apoio text-texto-2" style={{ lineHeight: 1.4 }}>
                {f.financiamento}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

/** Lista de fontes com links (seção 13). */
export function ListaFontes({ de, ate }: { de: number; ate: number }) {
  return (
    <ol className="grade-2" style={{ ["--vao" as string]: "var(--esp-3) var(--esp-8)" }} start={de + 1}>
      {fontes.slice(de, ate).map((f, i) => (
        <li key={f.url} className="grid grid-cols-[2em_minmax(0,1fr)] gap-x-[0.4em] border-t border-borda pt-[0.5em]">
          <span className="font-mono text-apoio text-texto-3" style={{ lineHeight: 1.45 }}>
            {String(de + i + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <a
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-apoio font-semibold text-texto underline decoration-borda-forte underline-offset-[0.2em] hover:decoration-verde"
              style={{ lineHeight: 1.35 }}
            >
              {f.titulo}
              <span className="sr-only-vapti"> {rotulos.fontes.novaAba}</span>
            </a>
            <p className="truncate font-mono text-apoio text-texto-3" style={{ lineHeight: 1.35 }}>
              {dominio(f.url)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
