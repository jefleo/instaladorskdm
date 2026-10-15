/**
 * Texto do resumo A4 de uma página.
 * Fonte: docs/BRIEFING.md, seções 4 e 7. Todo número vem de src/data/vapti.ts.
 */
import { aviso, config, decisoes, numerosChave, projeto, riscos } from "../data/vapti";

export interface NumeroResumo {
  rotulo: string;
  valor: string;
  /** "projeção" leva o selo; os demais não. */
  tipo: string;
}

export const resumo = {
  titulo: `${config.marca} · ${config.slogan}`,
  subtitulo: `${config.cliente} · ${config.data}`,
  tese: `Capital de giro de ciclo curto para ${projeto.autonomosBrasil.rotulo} de autônomos, por meio de instituição autorizada, com custo em reais na tela e risco medido antes de crescer.`,
  numerosTitulo: "Fase 1 em números · projeção, cenário-base",
  numeros: numerosChave.map(
    (k): NumeroResumo => ({
      rotulo: k.rotulo,
      valor: "extra" in k ? `${k.num.rotulo} · ${k.extra.rotulo}` : k.num.rotulo,
      tipo: k.num.tipo,
    }),
  ),
  numerosNota: "Projeções com premissas declaradas. Margem antes de equipe, tecnologia e impostos.",
  estruturaTitulo: "Estrutura",
  estrutura:
    "O cliente pede pela Vapti → a instituição parceira, credora, emite a CCB e libera o Pix → a CCB é cedida a quem financia a carteira → o cliente paga por Pix Automático na conta da parceira ou do fundo.",
  decisoesTitulo: `${decisoes.lista.length} decisões para hoje`,
  decisoes: decisoes.lista.map((d) => d.texto),
  riscosTitulo: "Riscos principais",
  riscos: [riscos[0], riscos[1], riscos[6]].map((r) => `${r.risco}. Mitigação: ${r.mitigacao.toLowerCase()}.`),
  aviso,
} as const;
