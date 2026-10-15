/**
 * Ato 2 — A prova (F010–F021).
 * PROVISÓRIO: mostra só o id e a fala da frase ativa. O agente de cena substitui este arquivo,
 * mantendo `export default function Ato2()` e `export const frases`.
 */
import { CenaProvisoria } from "../kit";

export const frases: string[] = ["F010", "F011", "F012", "F013", "F014", "F015", "F016", "F017", "F018", "F019", "F020", "F021"];

export default function Ato2() {
  return <CenaProvisoria frases={frases} />;
}
