/**
 * Ato 4 — Gamificação (F032–F041).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato4()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F032", "F033", "F034", "F035", "F036", "F037", "F038", "F039", "F040", "F041"];

export default function Ato4() {
  return <CenaProvisoria frases={frases} />;
}
