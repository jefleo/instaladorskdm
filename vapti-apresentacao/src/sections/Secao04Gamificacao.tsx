import { EscadaNiveis } from "../components/prototipo";
import { PrincipiosJogo } from "./visuais/Estrutura";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 04 — Gamificação: escada de níveis (V10) e princípios do jogo justo (V11). */
export function Secao04Gamificacao({ parte }: PropsSecao) {
  const secao = secaoPorId("04");
  const [b0, b1, b2, b3] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <Figura secao={secao} visual="V10">
          <EscadaNiveis />
        </Figura>
      </Slide>
    );
  }
  return (
    <Slide
      secao={secao}
      parte={parte}
      destaque={b3 ? <Bloco bloco={b3} tom="verde" estilo="simples" /> : null}
    >
      <Figura secao={secao} visual="V11">
        <PrincipiosJogo />
      </Figura>
      <div className="grade-3 mt-auto" style={{ ["--vao" as string]: "var(--esp-7)" }}>
        {b0 ? <Bloco bloco={b0} tom="neutro" /> : null}
        {b1 ? <Bloco bloco={b1} tom="coral" /> : null}
        {b2 ? <Bloco bloco={b2} tom="verde" /> : null}
      </div>
    </Slide>
  );
}
