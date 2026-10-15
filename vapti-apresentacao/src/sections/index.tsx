import type { ComponentType, ReactNode } from "react";
import { secoes } from "../content/secoes";
import type { Secao } from "../content/tipos";
import "./secoes.css";
import { Secao00Capa } from "./Secao00Capa";
import { Secao01Problema } from "./Secao01Problema";
import { Secao02Prova } from "./Secao02Prova";
import { Secao03Produto } from "./Secao03Produto";
import { Secao04Gamificacao } from "./Secao04Gamificacao";
import { Secao05Estrutura } from "./Secao05Estrutura";
import { Secao06Preco } from "./Secao06Preco";
import { Secao07Numeros } from "./Secao07Numeros";
import { Secao08Eficiencia } from "./Secao08Eficiencia";
import { Secao09VantagensRiscos, partesSecao09 } from "./Secao09VantagensRiscos";
import { Secao10Crescimento } from "./Secao10Crescimento";
import { Secao11Piloto } from "./Secao11Piloto";
import { Secao12Decisoes } from "./Secao12Decisoes";
import { Secao13Fontes } from "./Secao13Fontes";
import { idDaParte, type PropsSecao } from "./Slide";

export { ContextoExibicao, useExibicao, type Exibicao } from "./contexto";

/** Quantas telas cada seção ocupa no palco de 1920×1080. */
const REGISTRO: Record<string, { Componente: ComponentType<PropsSecao>; partes: number }> = {
  "00": { Componente: Secao00Capa, partes: 1 },
  "01": { Componente: Secao01Problema, partes: 2 },
  "02": { Componente: Secao02Prova, partes: 2 },
  "03": { Componente: Secao03Produto, partes: 3 },
  "04": { Componente: Secao04Gamificacao, partes: 2 },
  "05": { Componente: Secao05Estrutura, partes: 3 },
  "06": { Componente: Secao06Preco, partes: 2 },
  "07": { Componente: Secao07Numeros, partes: 6 },
  "08": { Componente: Secao08Eficiencia, partes: 3 },
  "09": { Componente: Secao09VantagensRiscos, partes: partesSecao09 },
  "10": { Componente: Secao10Crescimento, partes: 3 },
  "11": { Componente: Secao11Piloto, partes: 1 },
  "12": { Componente: Secao12Decisoes, partes: 2 },
  "13": { Componente: Secao13Fontes, partes: 3 },
};

export interface SlideDef {
  /** Rota: "07", "07b"... */
  id: string;
  secao: Secao;
  parte: number;
  /** Índice da seção (0 a 13). */
  indiceSecao: number;
  render: () => ReactNode;
}

export const slides: SlideDef[] = secoes.flatMap((secao, indiceSecao) => {
  const r = REGISTRO[secao.id];
  if (!r) return [];
  const { Componente } = r;
  return Array.from({ length: r.partes }, (_, parte) => ({
    id: idDaParte(secao.id, parte),
    secao,
    parte,
    indiceSecao,
    render: () => <Componente parte={parte} />,
  }));
});

export const indicePorId = (id: string): number => slides.findIndex((s) => s.id === id);
