import { VantagensRiscos, type FaixaLista } from "./visuais/VantagensRiscos";
import { Slide, secaoPorId, type PropsSecao } from "./Slide";

/*
 * 09 — Vantagens e riscos (V19). As 8 vantagens e os 10 riscos com mitigação
 * em três telas, sempre lado a lado e com o mesmo peso visual.
 */
const FAIXAS: FaixaLista[] = [
  { vantagens: [0, 3], riscos: [0, 3] },
  { vantagens: [3, 6], riscos: [3, 6] },
  { vantagens: [6, 8], riscos: [6, 10] },
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
