/** Contrato do texto das seções (preenchido em src/content/secoes.ts pelo roteirista). */

export type VisualId =
  | "V01" | "V02" | "V03" | "V04" | "V05" | "V06" | "V07" | "V08" | "V09" | "V10" | "V11" | "V12"
  | "V13" | "V14" | "V15" | "V16" | "V17" | "V18" | "V19" | "V20" | "V21" | "V22" | "V23" | "V24";

export interface Bloco {
  titulo?: string;
  texto: string;
}

export interface Notas {
  /** Tempo previsto da seção, ex.: "1:30". */
  tempo: string;
  /** Frase-chave: a frase que o apresentador não pode esquecer. */
  fraseChave: string;
  /** O que falar, em tópicos curtos, na ordem. */
  topicos: string[];
  /** Perguntas prováveis do investidor e a resposta curta. */
  perguntas?: { pergunta: string; resposta: string }[];
}

export interface Secao {
  /** "00" a "14" — também é a rota (#/03). */
  id: string;
  /** Nome curto da seção, ex.: "O problema". */
  nome: string;
  /** Título-conclusão, até 9 palavras. */
  titulo: string;
  /** Subtítulo, até 20 palavras. */
  subtitulo: string;
  /** Até 4 blocos curtos. */
  blocos: Bloco[];
  visuais: VisualId[];
  /** Legenda de cada visual da seção. */
  legendas: Partial<Record<VisualId, string>>;
  /** Texto alternativo de cada visual. */
  alts: Partial<Record<VisualId, string>>;
  notas: Notas;
}
