import { CaixaIrregular, MapaAutonomos } from "../components/viz";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 01 — O problema: caixa irregular (V02) e 24 milhões de autônomos (V03). */
export function Secao01Problema({ parte }: PropsSecao) {
  const secao = secaoPorId("01");
  const [b0, b1, b2, b3] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1.6fr) minmax(0, 1fr)" }}>
          <div className="coluna">
            <Figura secao={secao} visual="V02" proprio>
              <CaixaIrregular />
            </Figura>
          </div>
          <div className="flex flex-col gap-[var(--esp-7)]">
            {b0 ? <Bloco bloco={b0} tom="azul" /> : null}
            {b1 ? <Bloco bloco={b1} tom="coral" /> : null}
          </div>
        </div>
      </Slide>
    );
  }
  return (
    <Slide secao={secao} parte={parte}>
      <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1.4fr) minmax(0, 1fr)" }}>
        <div className="coluna">
          <Figura secao={secao} visual="V03" proprio>
            <MapaAutonomos />
          </Figura>
        </div>
        <div className="flex flex-col gap-[var(--esp-7)]">
          {b2 ? (
            <div className="border-l-[3px] border-azul pl-[0.85em]">
              <p className="font-mono font-bold text-azul" style={{ fontSize: "var(--fs-kpi-p)", lineHeight: 1, letterSpacing: "-0.04em" }}>
                {b2.titulo}
              </p>
              <p className="mt-[0.4em] text-corpo text-texto-2" style={{ lineHeight: 1.42 }}>
                {b2.texto}
              </p>
            </div>
          ) : null}
          {b3 ? <Bloco bloco={b3} tom="verde" grande /> : null}
        </div>
      </div>
    </Slide>
  );
}
