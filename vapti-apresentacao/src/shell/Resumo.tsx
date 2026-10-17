import { Selo, Wordmark } from "../components/base";
import { FluxoBaas } from "../components/viz";
import { resumo } from "../content/resumo";
import { ContextoExibicao } from "../sections";

const CSS_A4 = `
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; background: #e8e8e1; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media print { html, body { background: var(--cor-tinta); } .folha { box-shadow: none !important; margin: 0 !important; } }
`;

/** ?resumo=1 — resumo de uma página A4, modo claro. */
export function Resumo() {
  return (
    <ContextoExibicao.Provider value="impressao">
      <style>{CSS_A4}</style>
      <main className="folha">
        <header className="flex items-start justify-between gap-6 border-b-2 border-texto pb-[3mm]">
          <div>
            <Wordmark tamanho={40} />
            <h1 className="mt-[2mm] font-titulo text-[21px] font-extrabold leading-[1.1] text-texto">{resumo.titulo}</h1>
          </div>
          <p className="pt-[2mm] text-right font-mono text-[10.5px] uppercase leading-[1.5] tracking-[0.08em] text-texto-3">{resumo.subtitulo}</p>
        </header>

        <p className="mt-[3.5mm] text-[12.5px] font-medium leading-[1.45] text-texto">{resumo.tese}</p>

        <section className="mt-[4mm]">
          <h2 className="folha-h2">{resumo.numerosTitulo}</h2>
          <ul className="mt-[2mm] grid grid-cols-3 gap-[2.5mm]">
            {resumo.numeros.map((n) => (
              <li key={n.rotulo} className="rounded-[6px] border border-borda bg-superficie px-[3mm] py-[2.5mm]">
                <p className="text-[10.5px] font-semibold leading-[1.3] text-texto-2">{n.rotulo}</p>
                <p className="mt-[1mm] font-mono text-[19px] font-bold leading-[1.1] tracking-[-0.03em] text-verde">{n.valor}</p>
                {n.tipo === "projeção" ? <Selo tipo="projecao" tamanho="sm" className="mt-[1.5mm] !text-[9px]" /> : null}
              </li>
            ))}
          </ul>
          <p className="mt-[1.5mm] text-[9.5px] leading-[1.4] text-texto-3">{resumo.numerosNota}</p>
        </section>

        <section className="mt-[4mm]">
          <h2 className="folha-h2">{resumo.estruturaTitulo}</h2>
          <p className="mt-[1.5mm] text-[11px] leading-[1.45] text-texto-2">{resumo.estrutura}</p>
          <div className="folha-fluxo mt-[2mm]">
            <FluxoBaas compacto />
          </div>
        </section>

        <div className="mt-[4mm] grid grid-cols-2 gap-[6mm]">
          <section>
            <h2 className="folha-h2">{resumo.decisoesTitulo}</h2>
            <ol className="mt-[2mm] space-y-[1.5mm]">
              {resumo.decisoes.map((d, i) => (
                <li key={d} className="flex gap-[2mm] text-[11px] leading-[1.4] text-texto">
                  <span className="font-mono font-bold text-verde">{i + 1}</span>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="folha-h2 !text-coral">{resumo.riscosTitulo}</h2>
            <ul className="mt-[2mm] space-y-[1.5mm]">
              {resumo.riscos.map((r) => (
                <li key={r} className="border-l-2 border-coral pl-[2mm] text-[11px] leading-[1.4] text-texto">
                  {r}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="mt-auto border-t border-borda pt-[2.5mm] text-[9.5px] leading-[1.45] text-texto-3">{resumo.aviso}</footer>
      </main>
    </ContextoExibicao.Provider>
  );
}
