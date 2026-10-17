import { VantagensRiscos, type FaixaLista } from "./visuais/VantagensRiscos";
import { Slide, secaoPorId, type PropsSecao } from "./Slide";

/*
 * 09 — Vantagens e riscos (V19). As 8 vantagens e os 11 riscos com mitigação
 * em quatro telas, sempre lado a lado e com o mesmo peso visual.
 */
const FAIXAS: FaixaLista[] = [
  { vantagens: [0, 2], riscos: [0, 3] },
  { vantagens: [2, 4], riscos: [3, 6] },
  { vantagens: [4, 6], riscos: [6, 9] },
  { vantagens: [6, 8], riscos: [9, 11] },
];

export const partesSecao09 = FAIXAS.length;

export function Secao09VantagensRiscos({ parte }: PropsSecao) {
  const secao = secaoPorId("09");
  return (
    <Slide secao={secao} parte={parte}>
      <VantagensRiscos faixa={FAIXAS[parte] ?? FAIXAS[0]} />
    </Slide>
  );
}
