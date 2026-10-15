/**
 * Ato 3 — O produto (F022–F031).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato3()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F022", "F023", "F024", "F025", "F026", "F027", "F028", "F029", "F030", "F031"];

export default function Ato3() {
  return <CenaProvisoria frases={frases} />;
}
