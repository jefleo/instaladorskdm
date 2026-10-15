/**
 * Microtextos de interface: selos, popover de premissas, atalhos, modos,
 * simulador e protótipo de celular.
 * Todo número vem de src/data/vapti.ts. Os dados do protótipo são fictícios.
 */
import {
  atraso,
  avisoCurto,
  config,
  estrutura,
  fases,
  fontes,
  niveis,
  preco,
  premissas,
  produto,
  projeto,
  zippi,
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
    { teclas: ["→", "Espaço", "PageDown"], acao: "Avançar" },
    { teclas: ["←", "PageUp"], acao: "Voltar" },
    { teclas: ["Home", "End"], acao: "Primeira e última tela" },
    { teclas: ["N"], acao: "Mostrar ou esconder as notas do apresentador" },
    { teclas: ["F"], acao: "Tela cheia" },
    { teclas: ["G"], acao: "Grade com todas as seções" },
    { teclas: ["Esc"], acao: "Sair da tela cheia, da grade ou das notas" },
    { teclas: ["?"], acao: "Mostrar ou esconder esta ajuda" },
  ],
  passador: "O passador de slides também avança e volta.",
  slider: "Com o foco num controle do simulador, as setas mexem no controle, não trocam a tela.",
  fechar: "Fechar",
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
    agora: "Agora",
    fim: "Fim da apresentação",
    zerar: "Zerar",
    pausar: "Pausar",
    continuar: "Continuar",
    hora: "Hora",
    semConexao: "Sem conexão com a apresentação. Use as setas aqui ou reabra pela tecla N.",
  },
  rodape: `${config.marca} · ${config.versao}`,
  fonte: "Fonte",
  fontes: "Fontes",
  tabelaAcessivel: "Dados do gráfico em tabela",
  ajuda: "Atalhos",
  resumo: "Resumo de uma página",
  slide: (id: string, atual: number, total: number) => `${id} · ${atual} de ${total}`,
  slideAtual: (titulo: string, atual: number, total: number) => `Tela ${atual} de ${total}: ${titulo}`,
  irParaSlide: (id: string, titulo: string) => `Ir para ${id}: ${titulo}`,
  continua: "continua",
  controles: "Controles da apresentação",
  topo: "Voltar ao topo",
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
  /* Acréscimos do protótipo navegável (fictícios) */
  hora: "9:41",
  celular: "(84) 9••••-••42",
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
    contato: config.marca,
    contatoStatus: "Atendimento",
    hoje: "Hoje",
    digitando: "digitando…",
    audioRotulo: "Mensagem de voz",
    ouvir: "Ouvir áudio",
    pausar: "Pausar áudio",
    transcricao: "Transcrição",
    campo: "Mensagem",
    linkTitulo: "Plataforma Vapti",
    linkTexto: "Seu limite, sua proposta e seu painel.",
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
    voltar: "Voltar",
    dados: {
      titulo: "Seus dados",
      nome: "Nome",
      celular: "Celular",
      nota: "Pré-preenchido com dados fictícios. Somente leitura.",
    },
    openFinance: {
      titulo: "Conectar sua conta",
      contaRotulo: "Conta",
      conta: "Sua conta principal (fictícia)",
      leituraRotulo: "O que será lido",
      leitura: `Recebimentos dos últimos ${produto.janelaAnaliseDias.rotulo}`,
      finalidadeRotulo: "Para quê",
      finalidade: "Medir a constância do que você recebe",
      botao: "Autorizar (simulação)",
    },
    analise: {
      passos: [
        `Lendo ${produto.janelaAnaliseDias.rotulo} de recebimentos`,
        "Medindo a constância",
        `Parcela de até ${produto.capacidadeMaxRenda.rotulo} de uma semana fraca`,
      ],
      grafico: "Recebimentos por semana (fictícios)",
      semanaFraca: "Semana fraca",
      andamento: "Analisando…",
      pronto: "Análise concluída",
    },
    aceite: {
      resumo: "Resumo do que você assina",
      contrato: "Contrato de crédito (CCB) emitido pela credora.",
    },
    pix: {
      valorRotulo: "Débito por semana",
      datasRotulo: "Datas",
      recebedorRotulo: "Quem recebe",
      recebedor: credora,
      aviso: `Você vê o valor ${produto.pixAvisoDias.rotulo} antes de cada débito.`,
      cancelar: "Pode cancelar a autorização até 23h59 da véspera.",
      retentativas: `Se faltar saldo, até ${produto.pixRetentativas.rotulo} novas tentativas.`,
      acelera: "Ativar o Pix Automático acelera o seu progresso de nível.",
      alternativa: "Prefiro pagar por QR Pix",
    },
    recebido: {
      deRotulo: "De",
      de: credora,
      paraRotulo: "Para",
      para: ficticio.nome,
      valorRotulo: "Valor",
    },
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
    custoTotalRotulo: "Total a pagar",
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
    limiteVolta: `Limite volta: ${nBronze.limiteVolta.toLowerCase()}`,
    progresso: `${ficticio.ciclosQuitados} de ${nPrata.ciclos} ciclos`,
    proximoNivel: `Na ${nPrata.nome}: ${nPrata.taxaSemanal.rotulo} por semana = ${nPrata.efetivaMes.rotulo} ao mês = ${nPrata.jurosExemplo.rotulo} de juros em ${R400}`,
    sequenciaTitulo: "Semanas em dia",
    linhaInicio: "Início",
    linhaHoje: "Hoje",
    limiteInicialRotulo: "Limite inicial",
    limiteAtualRotulo: "Limite atual",
    ciclo: (n: number) => `Ciclo ${n}`,
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
    voltar: "Voltar ao painel",
  },

  atraso: {
    titulo: "Lembrete da sua parcela",
    lembrete: `Sua parcela de ${ex.parcela.rotulo} venceu ontem. Você tem ${atraso.toleranciaDias} de tolerância.`,
    bloqueio: "Novos saques voltam assim que a parcela estiver em dia.",
    encargos: `Se passar da tolerância: multa de até ${atraso.multaMax.rotulo} da parcela e juros de mora de até ${atraso.moraMaxMes.rotulo}.`,
    opcoesTitulo: "Como prefere resolver?",
    pagarTudo: `Pagar ${ex.parcela.rotulo} agora`,
    pagarParte: "Pagar uma parte agora",
    pagarParteExemplo: `Ex.: ${ficticio.pagamentoParcial} hoje, o resto depois`,
    pagarParteOk: `Pagamento de ${ficticio.pagamentoParcial} recebido pela ${credora}.`,
    reparcelar: "Ver proposta de reparcelamento",
    reparcelarNota: `A partir do ${atraso.diaReparcelamento.rotulo} de atraso, a oferta de reparcelamento aparece automaticamente.`,
    falar: "Falar com uma pessoa",
    horario: "Lembretes só das 8h às 20h, nunca aos domingos e feriados, no máximo 1 por dia.",
    vencida: "Venceu ontem",
    encargosTitulo: "Encargos, sem surpresa",
    multaExemplo: `Numa parcela de ${atraso.multaExemploParcela.rotulo}, a multa é de ${atraso.multaExemploValor.rotulo}.`,
    terceiros: "Falamos só com você. Nunca com terceiros.",
    pagoOk: "Pagamento simulado. Sua parcela está em dia.",
    reparcelarCondicoes: "Condições do reparcelamento: [A CONFIRMAR]",
    falarOk: "Simulação: uma pessoa do atendimento continua com você pela conversa.",
    linha: [
      { quando: "Ontem", oque: "Lembrete" },
      { quando: atraso.toleranciaDias, oque: "Tolerância" },
      { quando: atraso.diaReparcelamento.rotulo, oque: "Reparcelamento" },
    ],
    voltar: "Voltar ao painel",
  },

  navegacao: {
    rotulo: "Telas do protótipo",
    regiao: "Protótipo de celular com dados fictícios",
    telas: { conversa: "Conversa", jornada: "Contratação", painel: "Painel", niveis: "Níveis", atraso: "Atraso" },
    reiniciar: "Reiniciar",
  },

  escada: {
    rotulo: "Escada de níveis",
    instrucao: "Toque em um nível para ver os detalhes.",
    sobreSacado: "Taxa semanal sobre o valor sacado",
    porSemana: "por semana",
    aoMes: "ao mês",
    jurosEm: `de juros em ${R400}`,
    comoChega: "Como chega",
    limiteVolta: "Limite volta",
    reserva: "Reserva de emergência",
    requisito: (ciclos: number) => (ciclos === 0 ? "Primeiro saque" : `${ciclos} ciclos sem atraso`),
    exemplo: `Exemplo: ${ficticio.nome}, nível ${nBronze.nome}, ${ficticio.ciclosQuitados} ciclos quitados`,
    faltam: `Faltam ${nPrata.ciclos - ficticio.ciclosQuitados} ciclos para ${nPrata.nome}`,
    eixo: "Ciclos sem atraso",
    voceEsta: "Você está aqui",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Rótulos dos visuais do site (seções, leitura, impressão)            */
/* ------------------------------------------------------------------ */

const fonteDealroom = zippi.valorEstimado.fonte.split(" — ")[0];

export const rotulos = {
  capa: {
    para: "Para",
    data: "Data",
    apresenta: "Apresenta",
  },
  zippiHoje: {
    titulo: `${zippi.nome} hoje`,
    concedido: "Crédito concedido",
    valor: "Valor estimado",
    autonomos: "Autônomos no app",
    etiquetaValor: `${selos.estimativa} · ${fonteDealroom}`,
    fonte: (f: string) => `Fonte: ${f.split(" — ")[0]}`,
    licao: "A lição",
  },
  caminhos: {
    descartado: "Descartado",
    viavel: "Viável",
  },
  estrutura: {
    regras: `Regras da ${estrutura.normaCurta} (${estrutura.normaData})`,
  },
  principios: {
    titulo: "Princípios do jogo justo",
  },
  vantagensRiscos: {
    vantagens: "Vantagens",
    riscos: "Riscos",
    riscosMitigacao: "Riscos e mitigação",
    mitigacao: "Mitigação",
    faixa: (de: number, ate: number, total: number) => `${de} a ${ate} de ${total}`,
  },
  comoMedimos: {
    titulo: "Como medimos",
    faixas: "Faixas de atraso acompanhadas",
  },
  crescimento: {
    valuation: "Quanto uma operação assim pode valer",
    base: "Múltiplo de",
    quando: "Quando",
    carteira: "A carteira",
    motor: "O motor de originação",
    janela: "Janela de venda",
    condicoes: "Condições",
  },
  piloto: {
    operacionais: "Metas operacionais",
    escopo: "Escopo",
  },
  decisoes: {
    titulo: "O que pedimos hoje",
  },
  fechamento: {
    pergunta: "Vamos?",
  },
  fontes: {
    titulo: "Fontes",
    total: `${fontes.length} fontes`,
    novaAba: "(abre em nova aba)",
    comoLer: "Como ler",
  },
  tabelaFases: {
    legenda: `As três fases. Projeção a ${rotuloTaxa(preco.tabela[2])}.`,
    metrica: "Projeção",
    fase: (n: number) => `Fase ${n}`,
    financiamento: "Como se financia",
    linhas: [
      { chave: "capitalProprio", rotulo: "Capital próprio" },
      { chave: "dividaSenior", rotulo: "Dívida sênior" },
      { chave: "carteira", rotulo: "Carteira na rua" },
      { chave: "sacadoMes", rotulo: "Sacado por mês" },
      { chave: "receitaAno", rotulo: "Receita por ano" },
      { chave: "perdaMes8", rotulo: `Perda por mês (${premissas.perdaBase.rotulo})` },
      { chave: "custoMes", rotulo: "Custo por mês" },
      { chave: "fundingMes", rotulo: "Funding por mês" },
      { chave: "margem8", rotulo: `Margem por mês, perda de ${premissas.perdaBase.rotulo}` },
      { chave: "margem12", rotulo: `Margem por mês, perda de ${premissas.perdaEstresse.rotulo}` },
      { chave: "perdaEquilibrio", rotulo: "Perda de equilíbrio" },
    ],
    destaque: "margem8",
  },
  leitura: {
    rodape: avisoCurto,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Gráficos, diagramas e simulador (dev-dataviz)                       */
/* Valores formatados chegam por parâmetro; números só de vapti.ts.    */
/* ------------------------------------------------------------------ */

export const viz = {
  estimativa: "Estimativa",
  fonte: (f: string) => `Fonte: ${f}.`,

  caixa: {
    titulo: "Quanto entra em cada dia de uma semana comum",
    pessoas: ["Motorista de aplicativo", "Barbeiro"],
    dias: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
    diasExtenso: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
    eixoY: "Entrada do dia · escala qualitativa, sem valores",
    mais: "mais",
    menos: "menos",
    eixoX: "Dia da semana",
    buraco: "Buraco no meio da semana",
    /** Leitura qualitativa de cada barra, da menor para a maior. */
    niveis: ["quase nada", "fraca", "média", "boa"],
    tabela: "Ilustrativo, sem dados reais: entrada de cada dia",
    dia: "Dia",
  },

  mapa: {
    rotulo: "Trabalhadores autônomos no Brasil",
    fonte: `Fonte: ${projeto.autonomosBrasil.fonte}.`,
    praca: `${projeto.praca}: praça de partida sugerida`,
    nacional: "Atuação nacional desde o início.",
    mapaAlt: "Mapa do Brasil desenhado com pontos.",
  },

  linhaZippi: {
    titulo: `${zippi.nome} · marcos públicos`,
    quando: "Quando",
    marco: "Marco",
  },

  fidc: {
    titulo: `FIDC da ${zippi.nome} por captação`,
    eixoY: "Captação (R$ milhões)",
    eixoX: "Data da captação",
    captacao: "Captação",
    valor: "Valor",
  },

  planos: {
    titulo: `Um saque de ${R400}, dois jeitos de pagar`,
    recebe: `Recebe ${R400}`,
    saque: "Saque",
    semanal: `Padrão: ${produto.parcelasSemanais.rotulo} parcelas semanais`,
    semanalCurto: "Semanal",
    diario: (dias: number) => `Alternativa: plano diário de ${dias} dias`,
    diarioCurto: "Diário",
    recomendado: "Recomendado",
    outrosPrazos: (prazos: string) => `Também em ${prazos} dias.`,
    parcelas: (n: string | number, valor: string) => `${n} × ${valor}`,
    composicao: `${preco.exemplo.amortizacao.rotulo} do valor + ${preco.exemplo.jurosParcela.rotulo} de juros por semana`,
    valorSerie: "do valor",
    jurosSerie: "de juros",
    juros: (v: string) => `${v} de juros no total`,
    efetiva: (v: string) => `${v} ao mês`,
    taxa: `${preco.exemplo.taxa.rotulo} por semana sobre o valor sacado`,
    eixoX: "Dias corridos desde o saque",
    eixoY: "Parcela (R$)",
    tabela: `Parcelas de um saque de ${R400}`,
    plano: "Plano",
    parcela: "Parcela",
    quantas: "Parcelas",
    totalJuros: "Juros no total",
    efetivaCol: "Efetiva ao mês",
  },

  pix: {
    titulo: "Pix Automático: autoriza uma vez, cobra no vencimento",
    passos: [
      { titulo: "Autorização única", texto: "O cliente autoriza uma vez, na contratação." },
      { titulo: `Aviso ${produto.pixAvisoDias.rotulo} antes`, texto: "O cliente vê o valor antes de cada cobrança." },
      { titulo: "Vencimento", texto: "A cobrança cai na conta da parceira ou do fundo." },
      { titulo: `Até ${produto.pixRetentativas.rotulo} novas tentativas`, texto: "Se faltar saldo, o Pix tenta de novo." },
    ],
    tentativa: (n: number) => `Tentativa ${n}`,
    falhou: "Sem saldo",
    passou: "Pago",
    cancelamento: {
      titulo: "Cancelou até 23h59 da véspera?",
      texto: "Vira sinal de risco e gatilho de contato.",
    },
    alternativa: "QR Pix como alternativa.",
  },

  fluxo: {
    titulo: "Como o contrato e o dinheiro circulam",
    passos: [
      { quem: "Cliente", papel: "Pede o saque", texto: "Pela mensagem ou pela plataforma." },
      {
        quem: config.marca,
        papel: "Cliente, análise e cobrança",
        texto: "Cadastro, Open Finance e decisão de crédito com o motor próprio. Depois, cobrança e atendimento.",
      },
      { quem: "Instituição parceira", papel: "Credora", texto: "Emite a CCB em nome próprio e libera o Pix da conta dela." },
      { quem: "Quem financia a carteira", papel: "Cessão da CCB", texto: "Recebe a CCB no mesmo dia e paga o valor à parceira." },
      { quem: "Pagamento", papel: "Pix Automático", texto: "O cliente paga na conta da parceira ou do fundo." },
    ],
    nunca: `Nunca na conta da ${config.marca}.`,
    fase: (n: number) => `Fase ${n}`,
    norma: `${estrutura.normaCurta} · ${estrutura.normaData}`,
  },

  precoComp: {
    titulo: "Taxa efetiva ao mês, por nível",
    vezes: "×",
    igual: "=",
    seta: "→",
    porSemana: "por semana",
    semanas: `${produto.parcelasSemanais.rotulo} semanas`,
    deJuros: "de juros",
    aoMes: "ao mês",
    eixoX: "Taxa efetiva ao mês (%)",
    porSemanaDe: (t: string) => `${t} por semana`,
    zippiTaxa: `a partir de ${preco.zippiTaxaSemanal.rotulo} por semana, sobre o valor usado`,
    nivel: (nome: string) => `${config.marca} · ${nome}`,
    colunaJuros: `Juros em ${R400}`,
    zippiNota: `${zippi.nome}: estimativa de juros sobre o saldo, no mesmo plano de ${produto.parcelasSemanais.rotulo} semanas.`,
    tabela: "Taxa efetiva ao mês por nível",
    quem: "Quem",
    taxaSemanal: "Taxa semanal",
    efetiva: "Efetiva ao mês",
  },

  cascata: {
    titulo: "Fase 1 em números",
    capital: "Capital",
    naRua: (pct: string) => `Na rua (${pct} do capital)`,
    sacado: "Sacado por mês",
    receitaConta: (taxa: string) => `Receita = sacado × ${taxa} × ${produto.parcelasSemanais.rotulo} semanas`,
    receita: "Receita por mês",
    perda: (p: string) => `Perda (${p} do sacado)`,
    custos: (c: string) => `Custos (${c} por saque)`,
    margem: "Margem por mês",
    porAno: (v: string) => `${v} por ano`,
    eixoX: "R$ mil por mês",
    tabela: "Fase 1 em números, por mês",
    item: "Item",
    valor: "Valor",
  },

  curva: {
    titulo: "Margem por mês da fase 1, conforme a perda",
    eixoX: "Perda sobre o valor sacado (%)",
    eixoY: "Margem por mês (R$ mil)",
    equilibrio: (v: string) => `Equilíbrio: ${v}`,
    perdaDe: (v: string) => `Perda de ${v}`,
    negativa: "Margem negativa",
    tabela: "Margem por mês da fase 1 por perda",
    perda: "Perda",
    margem: "Margem por mês",
  },

  fases: {
    titulo: `As três fases, com perda de ${premissas.perdaBase.rotulo}`,
    fase: (n: number, periodo: string) => `Fase ${n} · ${periodo}`,
    financiamento: "Como é financiada",
    carteira: "Carteira na rua",
    margem: `Margem por mês (perda de ${premissas.perdaBase.rotulo})`,
    equilibrio: "Perda de equilíbrio",
    escala: "Em cada linha, as barras estão na mesma escala.",
    tabela: "As três fases",
  },

  eficiencia: {
    whatsTitulo: "WhatsApp por saque",
    comum: "Jornada comum",
    redesenhada: "Jornada redesenhada",
    mensagens: (n: string) => `${n} mensagens`,
    faixa: (f: string) => `${f} mensagens cobradas`,
    porSaque: "por saque",
    cadaQuadrado: "Cada quadrado é uma mensagem cobrada.",
    bureauTitulo: "Bureau de crédito",
    funilTitulo: "Funil em camadas: o bureau pago fica por último",
    gratis: "grátis",
    pago: "pago",
    balcao: "Consulta no balcão (Serasa)",
    aprovado: "Por cliente aprovado, com o funil",
    maduro: "Por saque, na carteira madura",
    eixoX: "Custo de bureau (R$)",
    faixaValor: (a: string, b: string) => `${a} a ${b}`,
    tabela: "Custos de mensagens e de bureau",
    item: "Item",
    valor: "Valor",
  },

  regua: {
    titulo: "Duas trilhas, contadas do lançamento",
    eixo: "Anos desde o lançamento",
    ano: (a: string) => (/[–+]/.test(a) ? `Anos ${a}` : `Ano ${a}`),
    zippi: zippi.nome,
    zippiTipo: "Fatos",
    vapti: config.marca,
    vaptiTipo: "Hipóteses de ordem de grandeza",
    tabela: "Régua de crescimento em duas trilhas",
    quando: "Quando",
  },

  simulador: {
    taxaDetalhe: (efetiva: string, juros: string) => `= ${efetiva} ao mês · ${juros} de juros em ${R400}`,
    porSemana: "por semana",
    perdaDetalhe: "sobre o valor sacado",
    capitalFase: (capital: string) => `Capital da fase 1: ${capital}`,
    equilibrioBarra: "Perda escolhida × perda de equilíbrio",
    perdaEscolhida: "Perda escolhida",
    resultados: "Resultado por mês",
    faixas: "Mínimo e máximo",
  },

  tabelaCapital: {
    legenda: "Tabela A · variação de capital, fase 1 (projeção)",
    capital: "Capital",
    carteira: "Carteira",
    sacado: "Sacado/mês",
    receita: "Receita/mês",
    receitaAno: "Receita/ano",
    margem: "Margem/mês",
    a: (t: string) => `a ${t}`,
    perda: (p: string) => `perda ${p}`,
    clientes: "Clientes com saldo",
    saques: "Saques/mês",
    unidade: "Valores em R$, exceto clientes e saques. Margem antes de equipe, tecnologia e impostos.",
  },
} as const;

/**
 * Faixas dos controles do simulador (Briefing 4.8 e papel do dev-dataviz):
 * capital de R$ 150 mil a R$ 1 mi, passo de R$ 50 mil; taxa de 4% a 6% por semana,
 * passo de 0,5 p.p.; perda de 4% a 20%, passo de 0,5 p.p.
 */
export const faixasSimulador = {
  capital: { min: 150_000, max: projeto.capitalInicial.valor, passo: 50_000 },
  taxa: { min: preco.tabela[0].taxaSemanal.valor, max: preco.tabela[3].taxaSemanal.valor, passo: 0.005 },
  perda: { min: 0.04, max: 0.2, passo: 0.005 },
} as const;
