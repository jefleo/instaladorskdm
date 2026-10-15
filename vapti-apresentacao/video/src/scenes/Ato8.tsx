/**
 * Ato 8 — Crescimento e saída (F075–F084).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato8()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F075", "F076", "F077", "F078", "F079", "F080", "F081", "F082", "F083", "F084"];

export default function Ato8() {
  return <CenaProvisoria frases={frases} />;
}
