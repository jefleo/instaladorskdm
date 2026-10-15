/**
 * Ato 1 — O problema (F001–F009).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato1()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F001", "F002", "F003", "F004", "F005", "F006", "F007", "F008", "F009"];

export default function Ato1() {
  return <CenaProvisoria frases={frases} />;
}
