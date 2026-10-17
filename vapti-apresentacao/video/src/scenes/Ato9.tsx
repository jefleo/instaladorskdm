/**
 * Ato 9 — A decisão (F085–F091). Firme e caloroso; resolução no "Vamos?".
 * F085–F088 (V23, V22): a lista de cinco decisões se marca no verbo de cada frase;
 * semáforo do piloto no item 4; "R$ 1 mi" acende em verde no item 5.
 * F089–F091: trilhas desfocadas ao fundo, a marca Vapti cresce e "Vamos?" entra na
 * posição do card final — o Film assume com o card (V24) logo depois.
 */
import { Decisoes } from "./atos7a9/Decisoes";
import { Fecho } from "./atos7a9/Fecho";

export const frases: string[] = ["F085", "F086", "F087", "F088", "F089", "F090", "F091"];

export default function Ato9() {
  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
      <Decisoes />
      <Fecho />
    </div>
  );
}
