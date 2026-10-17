import { BarrasFidc, LinhaTempoZippi } from "../components/viz";
import { NumerosZippi } from "./visuais/NumerosZippi";
import { useExibicao } from "./contexto";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 02 — A prova: linha do tempo (V04), números (V06) e FIDC (V05). Zippi sempre em cinza, só texto. */
export function Secao02Prova({ parte }: PropsSecao) {
  const secao = secaoPorId("02");
  const [b0, , b2, b3] = secao.blocos;
  const exibicao = useExibicao();
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <Figura secao={secao} visual="V04" proprio>
          <LinhaTempoZippi interativo={exibicao === "palco" || exibicao === "leitura"} />
        </Figura>
        <Figura secao={secao} visual="V06">
          <NumerosZippi horizontal />
        </Figura>
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
      <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1fr) minmax(0, 1.25fr)" }}>
        <div className="coluna" style={{ gap: "var(--esp-7)" }}>
          {b0 ? <Bloco bloco={b0} tom="cinza" grande /> : null}
          {b2 ? <Bloco bloco={b2} tom="cinza" grande /> : null}
        </div>
        <div className="coluna">
          <Figura secao={secao} visual="V05" proprio>
            <BarrasFidc />
          </Figura>
        </div>
      </div>
    </Slide>
  );
}
