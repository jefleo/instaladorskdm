/**
 * Ato 8 — Crescimento e saída (F075–F084). Visão de futuro; o ritmo cresce até a F084.
 * F075–F082 (V20): a câmera sobe ao horizonte e desce às duas trilhas; Zippi em cinza (fatos),
 * Vapti em verde (projeção, com selo colado a cada marco e a ressalva de ordem de grandeza).
 * F083–F084 (V21): a carteira desbota, o motor de três engrenagens gira, se duplica e
 * uma segunda carteira nasce ao lado.
 */
import { MotorCena } from "./atos7a9/Motor";
import { Regua } from "./atos7a9/Regua";

export const frases: string[] = ["F075", "F076", "F077", "F078", "F079", "F080", "F081", "F082", "F083", "F084"];

export default function Ato8() {
  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
      <Regua />
      <MotorCena />
    </div>
  );
}
