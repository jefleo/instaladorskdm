/**
 * Texto da seção 11 — Plano de ação: aquisição barata, régua de cobrança e Pix Automático.
 * Fontes: Briefing 4.4, 4.6, 4.7, 4.8, 4.9 e 4.13; Pix Automático pelo Adendo 15/10 (docs/ADENDO-15-10.md).
 * Todo número vem de src/data/vapti.ts. Onde falta número, "[A CONFIRMAR] no piloto".
 */
import { atraso, eficiencia, gamificacao, piloto, preco, produto, projeto, reguaCobranca, rollRateFaixas } from "../data/vapti";
import { prototipo } from "./ui";

const pn = piloto.num;
const rc = reguaCobranca;
const nome = prototipo.ficticio.nome;
const parcelaEx = preco.exemplo.parcela.rotulo;
const minusc = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

export type IdAba = "aquisicao" | "cobranca" | "pix";

export const planoAcao = {
  rotuloAbas: "Frentes do plano de ação",
  dicaTeclas: "Teclas 1, 2 e 3 trocam a aba.",
  abas: [
    { id: "aquisicao" as IdAba, tecla: "1", nome: "Aquisição barata", resumo: "Do canal mais barato ao mais caro" },
    { id: "cobranca" as IdAba, tecla: "2", nome: "Cobrança e follow-up", resumo: `A régua de ${rc.programacaoDe.rotulo} a ${rc.acompanhamentoAte.rotulo}` },
    { id: "pix" as IdAba, tecla: "3", nome: "Pix Automático", resumo: "O que custa e onde cabe" },
  ],

  /** Tela de abertura (apresentação e PDF): as três frentes e as metas que cada uma move. */
  visao: {
    abrir: (nomeAba: string) => `Abrir: ${nomeAba}`,
    metasRotulo: "Metas do piloto que move",
    metas: {
      aquisicao: [`Custo direto do 1º saque abaixo de ${pn.custoPrimeiroSaque.rotulo}`, piloto.metas[3]],
      cobranca: [piloto.metas[0], piloto.metas[1]],
      pix: [piloto.metas[0], piloto.metas[5]],
    } as Record<IdAba, string[]>,
  },

  aquisicao: {
    titulo: "Do canal mais barato ao mais caro",
    nota: "Ordem esperada de custo. O custo real de cada canal é medido no piloto.",
    instrucao: "Clique em um canal para ver como fazer e o que medir.",
    comoFazer: "Como fazer",
    oQueMedir: "O que medir",
    canais: [
      {
        titulo: "Recontratação da base",
        porque: "O canal mais barato: dispensa bureau.",
        etiqueta: "Dispensa bureau",
        como: "Quem quitou em dia vê o limite de volta no painel e saca de novo, sem nova consulta ao bureau. A taxa cai com o nível.",
        medir: `Recontratação de adimplentes por safra: meta acima de ${pn.recontratacaoMeta.rotulo}; parada abaixo de ${pn.recontratacaoParada.rotulo}. Custo da recontratação abaixo de ${pn.custoRecontratacao.rotulo}.`,
      },
      {
        titulo: "Indicação que acelera o nível",
        porque: "Já é mecânica da gamificação.",
        etiqueta: "Gamificação",
        como: `Código de indicação no painel. ${gamificacao.mecanicas[4].texto}`,
        medir: "Indicados aprovados e em dia, por quem indica. Custo por indicado: [A CONFIRMAR] no piloto.",
      },
      {
        titulo: "Pontos parceiros com QR",
        porque: "O público passa por ali todo dia.",
        etiqueta: projeto.praca,
        como: `QR e código de indicação em postos de combustível, borracharias e lava-jatos (motoristas), em distribuidores de produtos para barbearia e em associações e cooperativas de motoristas na ${projeto.praca.split(" (")[0]}.`,
        medir: "Cadastros e 1º saques por ponto, pelo código. Contrapartida ao ponto e custo por 1º saque: [A CONFIRMAR] no piloto.",
      },
      {
        titulo: "Anúncio que abre conversa",
        porque: `${eficiencia.whatsJanelaAnuncio.rotulo} sem cobrança de resposta.`,
        etiqueta: "Click-to-WhatsApp",
        como: `Anúncio Click-to-WhatsApp segmentado na praça. A conversa aberta pelo anúncio tem ${eficiencia.whatsJanelaAnuncio.rotulo} sem cobrança de resposta; a jornada segue na plataforma.`,
        medir: "Custo por conversa e por 1º saque. Orçamento e conversão: [A CONFIRMAR] no piloto.",
      },
      {
        titulo: "Funil antes do bureau",
        porque: "Barra o custo antes da consulta paga.",
        etiqueta: "Vale para todo canal",
        como: `${eficiencia.funil.join(" → ")}. Quem não passa nas camadas grátis não gera consulta paga.`,
        medir: `Custo de bureau por aprovado: de ${eficiencia.custoAprovadoSemFunil.rotulo} para ${eficiencia.custoAprovadoComFunil.rotulo} (estimativa do briefing).`,
      },
    ],
    guia: {
      rotulo: "Métrica-guia",
      valor: pn.custoPrimeiroSaque.rotulo,
      texto: "Custo direto do 1º saque, meta do piloto (abaixo de)",
      nota: "Custo de aquisição, conversão e orçamento por canal: [A CONFIRMAR] no piloto.",
    },
  },

  cobranca: {
    titulo: `A régua de cobrança, de ${rc.programacaoDe.rotulo} a ${rc.acompanhamentoAte.rotulo}`,
    instrucao: "Clique em um marco para ver o que acontece, por qual canal e com qual tom.",
    eixo: "Dias em relação ao vencimento",
    oQue: "O que acontece",
    canal: "Canal",
    tom: "Tom",
    exemplo: "Exemplo fictício de mensagem (roteiro revisado por advogado)",
    marcos: [
      {
        id: "programada",
        quando: `${rc.programacaoDe.rotulo} a ${rc.programacaoAte.rotulo}`,
        titulo: "Cobrança programada",
        oque: `Semanal: a cobrança vai ao banco do cliente de ${produto.pixAvisoDias.rotulo} antes, e ele vê o valor no app do banco. Diário: lembrete com o QR Pix da parcela.`,
        canal: "Pix Automático (semanal) · mensagem com QR Pix (diário)",
        tom: "Informativo e curto.",
        exemploTexto: `“Oi, ${nome}! Sua parcela de ${parcelaEx} vence sexta. Já está programada.”`,
        faixa: 0,
        alerta: false,
      },
      {
        id: "vencimento",
        quando: rc.vencimento.rotulo,
        titulo: "Vencimento",
        oque: `O Pix Automático debita. Se faltar saldo, até ${produto.pixRetentativas.rotulo} novas tentativas (${produto.pixRetentativasCalendario}). Cancelar a autorização é sinal de risco e gatilho de contato.`,
        canal: "Pix Automático · comprovante na plataforma",
        tom: "Confirmação, sem cobrança.",
        exemploTexto: `“Recebemos sua parcela de ${parcelaEx}. Obrigado, ${nome}!”`,
        faixa: 0,
        alerta: false,
      },
      {
        id: "tolerancia",
        quando: `${rc.toleranciaDe.rotulo} a ${rc.toleranciaAte.rotulo}`,
        titulo: "Tolerância com lembrete",
        oque: `${atraso.toleranciaDias.charAt(0).toUpperCase()}${atraso.toleranciaDias.slice(1)} de tolerância, com lembrete. Novo saque fica bloqueado até ficar em dia. Pagamento parcial é aceito.`,
        canal: "Mensagem pela API oficial · plataforma",
        tom: "Acolhedor: pergunta se aconteceu algo.",
        exemploTexto: `“${nome}, a parcela de ontem não entrou. Aconteceu algo? Dá para pagar uma parte hoje.”`,
        faixa: 1,
        alerta: true,
      },
      {
        id: "encargos",
        quando: rc.encargos.rotulo,
        titulo: "Encargo como sinal",
        oque: `Passada a tolerância: multa de até ${atraso.multaMax.rotulo} da parcela e mora de até ${atraso.moraMaxMes.rotulo}. Numa parcela de ${atraso.multaExemploParcela.rotulo}, a multa é de ${atraso.multaExemploValor.rotulo}. É sinal, não receita.`,
        canal: "Plataforma, com o valor atualizado na tela",
        tom: "Transparente, sem ameaça.",
        exemploTexto: "“O valor atualizado está no seu painel. Prefere pagar tudo ou uma parte?”",
        faixa: 1,
        alerta: true,
      },
      {
        id: "reparcelamento",
        quando: rc.reparcelamento.rotulo,
        titulo: "Reparcelamento automático",
        oque: `No ${atraso.diaReparcelamento.rotulo} de atraso, a oferta de reparcelamento aparece sozinha. Condições: [A CONFIRMAR].`,
        canal: "Plataforma · mensagem pela API oficial",
        tom: "Solução, não pressão.",
        exemploTexto: "“Montamos uma proposta para reorganizar o que falta. Quer ver?”",
        faixa: 1,
        alerta: true,
      },
      {
        id: "acompanhamento",
        quando: `${rc.acompanhamentoDe.rotulo} a ${rc.acompanhamentoAte.rotulo}`,
        titulo: "Acompanhamento por faixa",
        oque: `Atendimento humano, caso a caso, medido por roll rate. Atraso acima de 30 dias: meta abaixo de ${pn.atraso30Meta.rotulo}; parada acima de ${pn.atraso30Parada.rotulo} em qualquer safra.`,
        canal: "Atendimento humano · mensagem pela API oficial",
        tom: "Humano e individual.",
        exemploTexto: `“Oi, ${nome}, aqui é do atendimento. Vamos achar juntos um jeito de resolver?”`,
        faixa: 2,
        alerta: true,
      },
    ],
    regrasTitulo: "Regras fixas, em todo marco",
    regras: atraso.regrasCobranca,
    rollTitulo: "Como medimos: roll rate",
    rollFaixas: rollRateFaixas,
    rollAtual: "faixa deste marco",
  },

  pix: {
    titulo: "Pix Automático: o que custa e onde cabe",
    ondeCabe: "Onde cabe",
    cabe: "Cabe",
    naoCabe: "Não cabe",
    planos: [
      {
        nome: `Plano semanal · ${produto.parcelasSemanais.rotulo} parcelas`,
        cabe: true,
        texto: "A periodicidade semanal existe no Pix Automático. O cliente autoriza uma vez, na contratação.",
      },
      {
        nome: `Plano diário · ${produto.planosDiarios.join(", ").replace(/, (\d+)$/, " ou $1")} dias`,
        cabe: false,
        texto: `Não existe periodicidade diária. Pagamento: ${produto.planoDiarioArranjo}.`,
      },
    ],
    periodicidadesRotulo: "Periodicidades do Pix Automático",
    periodicidades: produto.pixPeriodicidades,
    minima: `A mais curta é a ${produto.pixPeriodicidadeMinima}.`,
    programacao: {
      titulo: "Como funciona a programação",
      texto: `A instrução de cobrança vai ao banco do cliente entre ${produto.pixAvisoMinDias.valor} e ${produto.pixAvisoMaxDias.rotulo} corridos antes do vencimento. No semanal, cada parcela é programada assim.`,
      janela: "Janela de envio da cobrança",
      vencimento: "Vencimento",
      de: rc.programacaoDe.rotulo,
      ate: rc.programacaoAte.rotulo,
      d0: rc.vencimento.rotulo,
      retentativas: `Se faltar saldo: até ${produto.pixRetentativas.rotulo} novas tentativas. ${produto.pixRetentativasCalendario}.`,
    },
    quemPaga: {
      titulo: "Quem paga o quê",
      linhas: [
        { quem: "Cliente (quem paga)", oque: produto.pixTarifaPagador + "." },
        { quem: "Parceira ou fundo (quem recebe)", oque: `Tarifa da instituição. ${produto.pixTarifaValor}.` },
      ],
    },
    perguntas: {
      titulo: "O que perguntar à parceira",
      itens: [
        "O rotativo semanal com Pix Automático cabe no catálogo de vocês?",
        "Qual a tarifa por cobrança do Pix Automático para quem recebe?",
        `Com quantos dias de antecedência a cobrança é enviada, entre ${produto.pixAvisoMinDias.valor} e ${produto.pixAvisoMaxDias.valor}?`,
        `Qual o calendário das até ${produto.pixRetentativas.rotulo} novas tentativas?`,
        "Como cobrar o plano diário: QR Pix ou Pix Cobrança por parcela?",
      ],
    },
    fonte: "Fontes: IN BCB nº 513/2024; Jovem Pan; Finsiders.",
  },
} as const;

/** Texto corrido de uma aba (tabela acessível e leitores de tela). */
export const resumoMarco = (m: (typeof planoAcao.cobranca.marcos)[number]) =>
  `${m.quando}, ${minusc(m.titulo)}: ${m.oque} Canal: ${m.canal}. Tom: ${minusc(m.tom)}`;
