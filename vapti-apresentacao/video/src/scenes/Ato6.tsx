/**
 * Ato 6 — Números (F053–F066).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato6()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F053", "F054", "F055", "F056", "F057", "F058", "F059", "F060", "F061", "F062", "F063", "F064", "F065", "F066"];

export default function Ato6() {
  return <CenaProvisoria frases={frases} />;
}
