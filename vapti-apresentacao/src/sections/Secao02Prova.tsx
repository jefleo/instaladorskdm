import { BarrasFidc, LinhaTempoZippi } from "../components/viz";
import { NumerosZippi } from "./visuais/NumerosZippi";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 02 — A prova: linha do tempo (V04), FIDC (V05) e números da Zippi (V06). Zippi sempre em cinza. */
export function Secao02Prova({ parte }: PropsSecao) {
  const secao = secaoPorId("02");
  const [b0, b1, b2, b3] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <Figura secao={secao} visual="V04" proprio>
          <LinhaTempoZippi />
        </Figura>
        {b0 ? <Bloco bloco={b0} tom="cinza" className="mt-auto max-w-[72ch]" /> : null}
      </Slide>
    );
  }
  return (
    <Slide
      secao={secao}
      parte={parte}
      destaque={
        b3 ? (
          <>
            <span className="block font-mono text-apoio uppercase text-verde" style={{ letterSpacing: "0.1em" }}>
              {b3.titulo}
            </span>
            <span className="mt-[0.2em] block font-titulo font-bold text-texto" style={{ fontSize: "var(--fs-h3)", lineHeight: 1.12 }}>
              {b3.texto}
            </span>
          </>
        ) : null
      }
    >
      <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1fr) minmax(0, 1.15fr)" }}>
        <div className="coluna">
          {b1 ? <Bloco bloco={b1} tom="cinza" /> : null}
          <Figura secao={secao} visual="V06">
            <NumerosZippi />
          </Figura>
        </div>
        <div className="coluna">
          {b2 ? <Bloco bloco={b2} tom="cinza" /> : null}
          <Figura secao={secao} visual="V05" proprio>
            <BarrasFidc />
          </Figura>
        </div>
      </div>
    </Slide>
  );
}
