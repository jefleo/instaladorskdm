import { Capa } from "./visuais/Capa";
import { Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 00 — Capa (V01). */
export function Secao00Capa({ parte }: PropsSecao) {
  const secao = secaoPorId("00");
  return (
    <Slide secao={secao} parte={parte} cabecalho="nenhum">
      <Capa secao={secao} />
    </Slide>
  );
}
