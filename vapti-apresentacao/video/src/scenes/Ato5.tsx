/**
 * Ato 5 — Estrutura (F042–F052).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato5()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F042", "F043", "F044", "F045", "F046", "F047", "F048", "F049", "F050", "F051", "F052"];

export default function Ato5() {
  return <CenaProvisoria frases={frases} />;
}
