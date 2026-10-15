import { Eficiencia } from "../components/viz";
import { ComoMedimos } from "./visuais/Medidas";
import { Bloco, Cabecalho, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 08 — Eficiência (V18), o custo por saque e o painel "Como medimos". */
export function Secao08Eficiencia({ parte }: PropsSecao) {
  const secao = secaoPorId("08");
  const [b0, b1, b2, b3] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte} cabecalho="nenhum">
        <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 620px) minmax(0, 1fr)", ["--vao" as string]: "var(--esp-8)" }}>
          <div className="coluna">
            <Cabecalho secao={secao} parte={parte} />
          </div>
          <div className="coluna">
            <Figura secao={secao} visual="V18" proprio>
              <Eficiencia />
            </Figura>
          </div>
        </div>
      </Slide>
    );
  }
  if (parte === 1) {
    return (
      <Slide secao={secao} parte={parte}>
        <div className="grade-3" style={{ ["--vao" as string]: "var(--esp-7)" }}>
          {b0 ? <Bloco bloco={b0} tom="azul" grande /> : null}
          {b1 ? <Bloco bloco={b1} tom="verde" grande /> : null}
          {b2 ? <Bloco bloco={b2} tom="azul" grande /> : null}
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
