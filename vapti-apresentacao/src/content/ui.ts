/**
 * Microtextos de interface: selos, popover de premissas, atalhos, modos,
 * simulador e protótipo de celular.
 * Todo número vem de src/data/vapti.ts. Os dados do protótipo são fictícios.
 */
import {
  atraso,
  avisoCurto,
  config,
  fases,
  niveis,
  preco,
  premissas,
  produto,
  projeto,
  type LinhaPreco,
} from "../data/vapti";

const R400 = projeto.saqueMedio.rotulo;

/** Taxa semanal sempre com a efetiva mensal e o custo em reais de R$ 400. */
export const rotuloTaxa = (l: LinhaPreco) =>
  `${l.taxaSemanal.rotulo} por semana = ${l.efetivaSacado.rotulo} ao mês = ${l.juros.rotulo} de juros em ${R400}`;

/* ------------------------------------------------------------------ */
/* Selos e premissas                                                   */
/* ------------------------------------------------------------------ */

export const selos = {
  projecao: "Projeção",
  ilustrativo: "Ilustrativo",
  prototipo: "Protótipo",
  estimativa: "Estimativa de terceiros",
  fato: "Fato",
} as const;

export const popoverPremissas = {
  titulo: "Premissas desta projeção",
  abrir: "Ver premissas",
  fechar: "Fechar",
  lista: premissas.lista,
  nota: avisoCurto,
} as const;

/* ------------------------------------------------------------------ */
/* Atalhos e modos                                                     */
/* ------------------------------------------------------------------ */

export const atalhos = {
  titulo: "Atalhos de teclado",
  abrirAjuda: "Ver atalhos",
  itens: [
    { teclas: ["→", "Espaço"], acao: "Avançar" },
    { teclas: ["←"], acao: "Voltar" },
    { teclas: ["N"], acao: "Mostrar ou esconder as notas do apresentador" },
    { teclas: ["F"], acao: "Tela cheia" },
    { teclas: ["G"], acao: "Grade com todas as seções" },
    { teclas: ["Esc"], acao: "Sair da tela cheia, da grade ou das notas" },
  ],
  passador: "O passador de slides também avança e volta.",
} as const;

export const modos = {
  apresentacao: "Modo apresentação",
  leitura: "Modo leitura",
  apresentar: "Apresentar",
  ler: "Ler com rolagem",
  sair: "Sair da apresentação",
  telaCheia: "Tela cheia",
  sairTelaCheia: "Sair da tela cheia",
  grade: "Todas as seções",
  imprimir: "Imprimir ou salvar em PDF",
  proxima: "Próxima seção",
  anterior: "Seção anterior",
  irPara: "Ir para a seção",
  pularConteudo: "Pular para o conteúdo",
  progresso: (atual: number, total: number) => `Seção ${atual} de ${total}`,
  notas: {
    titulo: "Notas do apresentador",
    abrir: "Abrir notas",
    fechar: "Fechar notas",
    outraJanela: "Abrir notas em outra janela",
    tempo: "Tempo previsto",
    fraseChave: "Frase-chave",
    topicos: "O que falar",
    perguntas: "Perguntas prováveis",
    resposta: "Resposta",
    cronometro: "Tempo decorrido",
    proxima: "A seguir",
  },
  rodape: `${config.marca} · ${config.versao}`,
  fonte: "Fonte",
  fontes: "Fontes",
  tabelaAcessivel: "Dados do gráfico em tabela",
} as const;

/* ------------------------------------------------------------------ */
/* Simulador                                                           */
/* ------------------------------------------------------------------ */

export const simulador = {
  titulo: "Simulador",
  subtitulo: "Projeção. Mexa nos controles e veja a margem mudar.",
  controles: {
    capital: "Capital",
    taxaSemanal: "Taxa semanal",
    taxaEfetiva: "Taxa efetiva ao mês",
    jurosExemplo: `Juros em ${R400}`,
    perda: "Perda sobre o valor sacado",
    fase: "Fase",
  },
  /** Rótulo de cada opção de taxa: semanal + efetiva mensal + custo em reais. */
  opcoesTaxa: preco.tabela.map(rotuloTaxa),
  fases: fases.map((f) => ({ fase: f.fase, rotulo: `Fase ${f.fase} · ${f.periodo}`, financiamento: f.financiamento })),
  resultados: {
    carteira: "Carteira na rua",
    sacadoMes: "Sacado por mês",
    receita: "Receita por mês",
    receitaAno: "Receita por ano",
    perda: "Perda por mês",
    custo: "Custo por mês",
    funding: "Funding por mês",
    margem: "Margem por mês",
    clientes: "Clientes com saldo",
    saques: "Saques por mês",
    equilibrio: "Perda de equilíbrio",
  },
  margemNota: "Antes de equipe, tecnologia e impostos.",
  estados: {
    abaixoEquilibrio: "Abaixo do equilíbrio",
    noEquilibrio: "No equilíbrio",
    acimaEquilibrio: "Acima do equilíbrio",
  },
  estadosAjuda: {
    abaixoEquilibrio: "Com esta perda, a margem fica negativa.",
    noEquilibrio: "Com esta perda, a margem fica perto de zero.",
    acimaEquilibrio: "Com esta perda, a margem fica positiva.",
  },
  cenarioBase: `Cenário-base: ${projeto.capitalInicial.rotulo}, ${rotuloTaxa(preco.tabela[2])}, perda de ${premissas.perdaBase.rotulo}.`,
  restaurar: "Voltar ao cenário-base",
  aviso: avisoCurto,
} as const;

/* ------------------------------------------------------------------ */
/* Protótipo de celular (dados fictícios)                              */
/* ------------------------------------------------------------------ */

const [nEntrada, nBronze, nPrata, nOuro] = niveis;

/** Cliente fictício do protótipo: nível Bronze, 3 ciclos quitados. */
const ficticio = {
  nome: "Carlos",
  ciclosQuitados: 3,
  semanasEmDia: 6,
  limiteInicial: "R$ 200",
  limiteAtual: "R$ 500",
  vencimentos: ["23/10", "30/10", "06/11", "13/11"],
  pagamentoParcial: "R$ 60",
};

const ex = preco.exemplo;
const credora = "Instituição Parceira S.A. (credora)";

export const prototipo = {
  selo: selos.prototipo,
  aviso: "Dados fictícios. Nenhum campo coleta dado real.",
  ficticio,

  conversa: {
    titulo: "Conversa",
    baloes: [
      { de: "cliente", tipo: "audio", duracao: "0:12", transcricao: `Oi, preciso de ${R400} pra fechar a semana.` },
      { de: "assistente", tipo: "texto", texto: `Oi, ${ficticio.nome}! Dá pra ver agora mesmo.` },
      { de: "assistente", tipo: "texto", texto: "Toque no link para seguir na plataforma Vapti. Leva poucos minutos." },
      { de: "assistente", tipo: "link", texto: "Abrir plataforma Vapti" },
    ],
  },

  etapas: {
    progresso: (atual: number, total: number) => `Etapa ${atual} de ${total}`,
    lista: [
      { nome: produto.jornada7[0], texto: "Nome e celular. Neste protótipo, nada de senha, cartão ou documento.", botao: "Continuar" },
      {
        nome: produto.jornada7[1],
        texto: `Você autoriza a leitura dos seus recebimentos dos últimos ${produto.janelaAnaliseDias.rotulo}. Consentimento simulado.`,
        botao: "Autorizar",
      },
      {
        nome: produto.jornada7[2],
        texto: `Medimos a constância do que você recebe. A parcela não passa de ${produto.capacidadeMaxRenda.rotulo} de uma semana fraca.`,
        botao: "Ver proposta",
      },
      { nome: produto.jornada7[3], texto: "Confira tudo antes de aceitar.", botao: "Continuar" },
      { nome: produto.jornada7[4], texto: `Li e aceito o contrato com a ${credora}.`, botao: "Aceitar" },
      {
        nome: produto.jornada7[5],
        texto: `Autorize uma vez. Você vê o valor ${produto.pixAvisoDias.rotulo} antes e pode cancelar até a véspera.`,
        botao: "Autorizar Pix Automático",
      },
      { nome: produto.jornada7[6], texto: `${R400} na sua conta. Pix enviado pela ${credora}.`, botao: "Ver meu painel" },
    ],
  },

  proposta: {
    titulo: "Sua proposta",
    credoraRotulo: "Credora",
    credora,
    credoraNota: "Quem empresta é a instituição parceira, autorizada pelo Banco Central. A Vapti cuida do seu atendimento.",
    recebeRotulo: "Você recebe",
    recebe: ex.sacado.rotulo,
    parcelasRotulo: "Você paga",
    parcelas: `${produto.parcelasSemanais.rotulo} × ${ex.parcela.rotulo}`,
    parcelaDetalhe: `${ex.amortizacao.rotulo} do valor + ${ex.jurosParcela.rotulo} de juros por semana`,
    vencimentosRotulo: "Vencimentos (fictícios)",
    vencimentos: ficticio.vencimentos,
    taxaRotulo: "Taxa",
    taxa: `${ex.taxa.rotulo} por semana sobre o valor sacado`,
    efetivaRotulo: "Taxa efetiva ao mês",
    efetiva: ex.efetivaMes.rotulo,
    jurosRotulo: "Juros em reais",
    juros: ex.juros.rotulo,
    custoTotalRotulo: "Custo total em reais",
    custoTotal: ex.total.rotulo,
    nivel: `Nível ${nBronze.nome}`,
    botao: "Aceitar proposta",
    voltar: "Voltar",
  },

  painel: {
    titulo: `Olá, ${ficticio.nome}`,
    saldoRotulo: "Saldo devedor",
    saldo: ex.total.rotulo,
    limiteRotulo: "Limite",
    proximaParcelaRotulo: "Próxima parcela",
    proximaParcela: `${ex.parcela.rotulo} em ${ficticio.vencimentos[0]}`,
    pagamento: "Pix Automático ativo",
    nivelRotulo: "Seu nível",
    nivel: nBronze.nome,
    faltam: `Faltam ${nPrata.ciclos - ficticio.ciclosQuitados} ciclos para ${nPrata.nome}`,
    sequencia: `${ficticio.semanasEmDia} semanas em dia`,
    tolerancia: "1 tolerância disponível neste trimestre",
    linhaTempo: {
      titulo: "Sua linha do tempo",
      limiteInicial: `Limite inicial: ${ficticio.limiteInicial}`,
      limiteAtual: `Limite atual: ${ficticio.limiteAtual}`,
      semanas: `${ficticio.semanasEmDia} semanas em dia`,
    },
    verNiveis: "Ver níveis",
  },

  niveis: {
    titulo: "Níveis",
    subtitulo: "Quanto mais em dia, menor a taxa. As regras são as mesmas para todos.",
    lista: niveis.map((nv) => ({
      id: nv.id,
      nome: nv.nome,
      comoChega: nv.comoChega,
      taxa: `${nv.taxaSemanal.rotulo} por semana`,
      efetiva: `${nv.efetivaMes.rotulo} ao mês`,
      jurosExemplo: `${nv.jurosExemplo.rotulo} de juros em ${R400}`,
      limiteVolta: `Limite volta: ${nv.limiteVolta.toLowerCase()}`,
      extra: nv.extra,
    })),
    atual: "Você está aqui",
    subida: {
      titulo: "Como subir",
      itens: [
        `${nBronze.nome}: ${nBronze.comoChega.toLowerCase()}.`,
        `${nPrata.nome}: ${nPrata.comoChega.toLowerCase()}.`,
        `${nOuro.nome}: ${nOuro.comoChega.toLowerCase()}.`,
        "Ativar o Pix Automático acelera o progresso.",
        "Indicar quem paga em dia acelera o progresso.",
      ],
    },
    descida: {
      titulo: "O que reduz",
      itens: [
        "Parcela em atraso bloqueia novo saque até ficar em dia.",
        "Sinal de dependência reduz o limite e traz uma oferta de reparcelamento.",
        "Regra de descida de nível: [A CONFIRMAR]",
      ],
    },
    entradaNota: `${nEntrada.nome}: ${nEntrada.comoChega.toLowerCase()}.`,
  },

  atraso: {
    titulo: "Tudo bem, acontece.",
    lembrete: `Sua parcela de ${ex.parcela.rotulo} venceu ontem. Você tem ${atraso.toleranciaDias} de tolerância.`,
    bloqueio: "Novos saques voltam assim que a parcela estiver em dia.",
    encargos: `Se passar da tolerância: multa de até ${atraso.multaMax.rotulo} da parcela e juros de mora de até ${atraso.moraMaxMes.rotulo}.`,
    opcoesTitulo: "Como prefere resolver?",
    pagarTudo: `Pagar ${ex.parcela.rotulo} agora`,
    pagarParte: "Pagar uma parte agora",
    pagarParteExemplo: `Ex.: ${ficticio.pagamentoParcial} hoje, o resto depois`,
    pagarParteOk: `Recebemos ${ficticio.pagamentoParcial}. Obrigado!`,
    reparcelar: "Ver proposta de reparcelamento",
    reparcelarNota: `A partir do ${atraso.diaReparcelamento.rotulo} de atraso, a oferta de reparcelamento aparece automaticamente.`,
    falar: "Falar com uma pessoa",
    horario: "Lembretes só das 8h às 20h, nunca aos domingos e feriados, no máximo 1 por dia.",
  },
} as const;
