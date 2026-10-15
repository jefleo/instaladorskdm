import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Icone } from "../components/base";
import {
  BarrasFidc,
  CaixaIrregular,
  CascataFase1,
  CurvaMargemPerda,
  Eficiencia,
  FluxoBaas,
  LinhaTempoZippi,
  MapaAutonomos,
  PixRetentativas,
  PlanosPagamento,
  PrecoComparativo,
  ReguaDuasTrilhas,
  Simulador,
  TabelaCapital,
  TresFases,
} from "../components/viz";
import { isPrint } from "../lib/modo";

/*
 * Página interna #/viz — bancada do dev-dataviz. Cada componente aparece num contêiner
 * "secao" de 1680 px (palco de 1920 menos as margens) e, embaixo, em 390 px.
 * Não é conteúdo da apresentação.
 */

const secao = (largura: number | string): CSSProperties => ({
  containerType: "inline-size",
  containerName: "secao",
  width: largura,
  maxWidth: "100%",
});

const ITENS: { id: string; nome: string; el: (estreito: boolean) => ReactNode }[] = [
  { id: "V02", nome: "CaixaIrregular", el: () => <CaixaIrregular /> },
  { id: "V03", nome: "MapaAutonomos", el: () => <MapaAutonomos /> },
  { id: "V04", nome: "LinhaTempoZippi", el: () => <LinhaTempoZippi /> },
  { id: "V05", nome: "BarrasFidc", el: () => <BarrasFidc /> },
  { id: "V08", nome: "PlanosPagamento", el: () => <PlanosPagamento /> },
  { id: "V09", nome: "PixRetentativas", el: () => <PixRetentativas /> },
  { id: "V13", nome: "FluxoBaas", el: () => <FluxoBaas /> },
  { id: "V14", nome: "PrecoComparativo", el: () => <PrecoComparativo /> },
  { id: "V15", nome: "CascataFase1", el: () => <CascataFase1 /> },
  { id: "V16", nome: "CurvaMargemPerda", el: () => <CurvaMargemPerda /> },
  { id: "V17", nome: "TresFases", el: () => <TresFases /> },
  { id: "V18", nome: "Eficiencia", el: () => <Eficiencia /> },
  { id: "V20", nome: "ReguaDuasTrilhas", el: () => <ReguaDuasTrilhas /> },
  { id: "—", nome: "Simulador", el: () => <Simulador /> },
  { id: "A", nome: "TabelaCapital", el: () => <TabelaCapital /> },
];

function Rotulo({ id, nome, extra }: { id: string; nome: string; extra?: string }) {
  return (
    <p className="mb-[16px] flex items-center gap-[10px] font-mono text-[15px] uppercase tracking-[0.12em] text-texto-3">
      <span className="text-verde">{id}</span>
      <span className="traco-vupt" aria-hidden="true" style={{ width: "18px", height: "4px" }} />
      {nome}
      {extra ? <span className="normal-case tracking-normal">· {extra}</span> : null}
    </p>
  );
}

export function PaginaViz() {
  const [claro, setClaro] = useState(() => isPrint || document.documentElement.dataset.modo === "claro");
  useEffect(() => {
    const html = document.documentElement;
    if (claro) html.dataset.modo = "claro";
    else delete html.dataset.modo;
  }, [claro]);

  return (
    <main className="min-h-screen bg-tinta font-texto text-texto">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-borda px-[max(16px,calc((100%-1680px)/2))] py-[28px]">
        <div>
          <p className="font-titulo text-[34px] font-extrabold tracking-[-0.03em]">Bancada de gráficos</p>
          <p className="font-mono text-[14px] uppercase tracking-[0.12em] text-texto-3">#/viz · página interna · contêiner de 1680 px e de 390 px</p>
        </div>
        {!isPrint ? (
          <button
            type="button"
            onClick={() => setClaro((v) => !v)}
            aria-pressed={claro}
            className="inline-flex items-center gap-3 rounded-full border border-borda-forte bg-superficie px-5 py-2 font-mono text-[15px] uppercase tracking-[0.08em] hover:bg-superficie-2"
          >
            <Icone icone={claro ? Moon : Sun} tamanho="1.1em" />
            {claro ? "Ver escuro" : "Ver claro (impressão)"}
          </button>
        ) : null}
      </header>

      {/* Palco: 1680 px */}
      {ITENS.map((it) => (
        <section key={it.nome} className="border-b border-borda py-[56px]" data-bancada={it.nome}>
          <div className="mx-auto" style={secao(1680)}>
            <div className="px-0">
              <Rotulo id={it.id} nome={it.nome} extra="palco" />
              {it.el(false)}
            </div>
          </div>
        </section>
      ))}

      {/* Compacto do resumo A4 */}
      <section className="border-b border-borda py-[56px]">
        <div className="mx-auto" style={{ width: 720, maxWidth: "100%" }}>
          <Rotulo id="V13" nome="FluxoBaas" extra="compacto (resumo A4, 720 px)" />
          <FluxoBaas compacto />
        </div>
      </section>

      {/* Estreito: 390 px */}
      <section className="py-[56px]">
        <div className="mx-auto px-[16px]" style={{ maxWidth: 1680 + 32 }}>
          <Rotulo id="390" nome="Contêiner estreito" />
          <div className="flex flex-wrap items-start gap-[32px]">
            {ITENS.map((it) => (
              <div key={it.nome} style={secao(390)} className="rounded-3 border border-borda p-[16px]" data-bancada-estreito={it.nome}>
                <Rotulo id={it.id} nome={it.nome} />
                {it.el(true)}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
