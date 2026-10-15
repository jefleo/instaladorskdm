/**
 * Ato 9 — A decisão (F085–F091).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato9()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F085", "F086", "F087", "F088", "F089", "F090", "F091"];

export default function Ato9() {
  return <CenaProvisoria frases={frases} />;
}
