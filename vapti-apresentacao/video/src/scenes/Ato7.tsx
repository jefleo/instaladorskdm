/**
 * Ato 7 — Eficiência e riscos (F067–F074).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato7()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F067", "F068", "F069", "F070", "F071", "F072", "F073", "F074"];

export default function Ato7() {
  return <CenaProvisoria frases={frases} />;
}
