import { CincoDecisoes, PerguntasEspecialistas } from "./visuais/Decisoes";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 12 — Decisões (V23), perguntas ao advogado e ao contador, próximas 4 semanas. */
export function Secao12Decisoes({ parte }: PropsSecao) {
  const secao = secaoPorId("12");
  const b3 = secao.blocos[3];
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <Figura secao={secao} visual="V23" semLegenda>
          <CincoDecisoes rotulo={secao.legendas.V23} />
        </Figura>
      </Slide>
    );
  }
  return (
    <Slide secao={secao} parte={parte}>
      <PerguntasEspecialistas secao={secao} />
      {b3 ? <Bloco bloco={b3} tom="verde" className="mt-auto" /> : null}
    </Slide>
  );
}
