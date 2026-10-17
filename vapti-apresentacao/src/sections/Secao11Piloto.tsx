import { PilotoSemaforo } from "./visuais/Piloto";
import { Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 12 — Piloto de 90 dias em semáforo (V22). */
export function Secao11Piloto({ parte }: PropsSecao) {
  const secao = secaoPorId("12");
  return (
    <Slide secao={secao} parte={parte}>
      <Figura secao={secao} visual="V22" semLegenda>
        <PilotoSemaforo secao={secao} />
      </Figura>
    </Slide>
  );
}
