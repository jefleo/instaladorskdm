import { Eficiencia } from "../components/viz";
import { ComoMedimos } from "./visuais/Medidas";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 08 — Eficiência (V18) e o painel "Como medimos". */
export function Secao08Eficiencia({ parte }: PropsSecao) {
  const secao = secaoPorId("08");
  const [b0, b1, b2, b3] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1.5fr) minmax(0, 1fr)" }}>
          <div className="coluna">
            <Figura secao={secao} visual="V18" proprio>
              <Eficiencia />
            </Figura>
          </div>
          <div className="flex flex-col gap-[var(--esp-6)]">
            {b0 ? <Bloco bloco={b0} tom="azul" /> : null}
            {b1 ? <Bloco bloco={b1} tom="verde" /> : null}
            {b2 ? <Bloco bloco={b2} tom="azul" /> : null}
          </div>
        </div>
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
            <span className="block font-titulo font-bold text-texto" style={{ fontSize: "var(--fs-h3)", lineHeight: 1.1 }}>
              {b3.titulo}
            </span>
            <span className="mt-[0.3em] block">{b3.texto}</span>
          </>
        ) : null
      }
    >
      <ComoMedimos />
    </Slide>
  );
}
