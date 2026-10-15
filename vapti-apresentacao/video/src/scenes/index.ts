/**
 * Registro das cenas: um componente por ato (A1…A9) e as frases que cada um cobre.
 * O Film desenha o ato ativo e, no crossfade de 0,7 s das fronteiras, também o vizinho.
 */
import type { ComponentType } from "react";
import Ato1, { frases as frases1 } from "./Ato1";
import Ato2, { frases as frases2 } from "./Ato2";
import Ato3, { frases as frases3 } from "./Ato3";
import Ato4, { frases as frases4 } from "./Ato4";
import Ato5, { frases as frases5 } from "./Ato5";
import Ato6, { frases as frases6 } from "./Ato6";
import Ato7, { frases as frases7 } from "./Ato7";
import Ato8, { frases as frases8 } from "./Ato8";
import Ato9, { frases as frases9 } from "./Ato9";

export interface Cena {
  Componente: ComponentType;
  frases: string[];
}

export const cenas: Record<string, Cena> = {
  A1: { Componente: Ato1, frases: frases1 },
  A2: { Componente: Ato2, frases: frases2 },
  A3: { Componente: Ato3, frases: frases3 },
  A4: { Componente: Ato4, frases: frases4 },
  A5: { Componente: Ato5, frases: frases5 },
  A6: { Componente: Ato6, frases: frases6 },
  A7: { Componente: Ato7, frases: frases7 },
  A8: { Componente: Ato8, frases: frases8 },
  A9: { Componente: Ato9, frases: frases9 },
};
