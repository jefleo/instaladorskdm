/**
 * Vapti — única fonte de números do app.
 * Origem: docs/BRIEFING.md, seção 4 (fonte da verdade).
 *
 * Cada número tem: valor (para cálculo), rotulo (como aparece na tela, formato brasileiro),
 * unidade, tipo (fato | projeção | premissa | estimativa) e fonte.
 * Nenhum componente deve digitar número: importe daqui.
 */

export type Tipo = "fato" | "projeção" | "premissa" | "estimativa";
export type Unidade = "R$" | "US$" | "%" | "un" | "x" | "dias" | "semanas" | "meses" | "anos" | "horas";

export interface Num {
  valor: number;
  rotulo: string;
  unidade: Unidade;
  tipo: Tipo;
  fonte: string;
}

const n = (valor: number, rotulo: string, unidade: Unidade, tipo: Tipo, fonte: string): Num => ({
  valor,
  rotulo,
  unidade,
  tipo,
  fonte,
});

const B = (secao: string) => `Briefing ${secao}`;

/* ------------------------------------------------------------------ */
/* Configuração da apresentação                                        */
/* ------------------------------------------------------------------ */

export const config = {
  marca: "Vapti",
  slogan: "Capital de giro na velocidade do Pix",
  /** Capa genérica (padrão da seção 11 do briefing, sem resposta do usuário). */
  cliente: "Apresentação para os sócios investidores",
  apresentador: "[A CONFIRMAR]",
  papelApresentador: "Coordenador do projeto",
  data: "16 de outubro de 2026",
  versao: "Documento de trabalho · outubro de 2026",
} as const;

/* ------------------------------------------------------------------ */
/* 4.1 O projeto                                                       */
/* ------------------------------------------------------------------ */

export const projeto = {
  capitalInicial: n(1_000_000, "R$ 1 mi", "R$", "premissa", B("4.1")),
  saqueMin: n(100, "R$ 100", "R$", "fato", B("4.1")),
  saqueMax: n(1_000, "R$ 1.000", "R$", "fato", B("4.1")),
  ticketMedioMin: n(350, "R$ 350", "R$", "premissa", B("4.1")),
  ticketMedioMax: n(450, "R$ 450", "R$", "premissa", B("4.1")),
  saqueMedio: n(400, "R$ 400", "R$", "premissa", B("4.1 e 4.8")),
  autonomosBrasil: n(24_000_000, "mais de 24 milhões", "un", "fato", "IBGE, citado por Startups.com.br"),
  praca: "Grande Natal (RN)",
  publico: ["Motoristas de aplicativo", "Barbeiros", "Prestadores de serviço"],
  canais: ["Mensagem pela API oficial do WhatsApp", "Plataforma web própria", "Pix para liberar e para receber"],
} as const;

/* ------------------------------------------------------------------ */
/* 4.2 Estrutura BaaS                                                  */
/* ------------------------------------------------------------------ */

export const estrutura = {
  norma: "Resolução Conjunta CMN/BCB nº 16",
  normaCurta: "Resolução Conjunta nº 16",
  normaData: "28/11/2025",
  prazoAdequacao: "31/12/2026",
  custoParceiraPorSaque: n(5, "R$ 5", "R$", "estimativa", B("4.2 — até haver cotação")),
  mesesAteOperarMin: n(2, "2", "meses", "estimativa", B("4.2")),
  mesesAteOperarMax: n(4, "4", "meses", "estimativa", B("4.2")),
  parceiraCandidata: "QI Tech",
  fluxo: [
    { passo: 1, quem: "Cliente → Vapti", texto: "O cliente pede o saque pela mensagem ou pela plataforma. A Vapti faz cadastro, Open Finance e decisão de crédito com o motor dela." },
    { passo: 2, quem: "Instituição parceira", texto: "A parceira formaliza: emite a CCB em nome próprio e libera o Pix da conta dela." },
    { passo: 3, quem: "Cessão da CCB", texto: "No mesmo dia, a CCB é cedida a quem financia a carteira, que paga o valor à parceira." },
    { passo: 4, quem: "Pagamento", texto: "O cliente paga por Pix Automático na conta da parceira ou do fundo. Nunca na conta da Vapti." },
    { passo: 5, quem: "Vapti", texto: "A Vapti faz a régua de cobrança e o atendimento." },
  ],
  financiadores: [
    { fase: 1, quem: "A própria Vapti" },
    { fase: 2, quem: "Veículo com dívida estruturada" },
    { fase: 3, quem: "FIDC" },
  ],
  regras: [
    "A parceira é a credora, responde ao cliente e aparece identificada no app, no contrato e nos comprovantes.",
    "A Vapti não cobra tarifa nem remuneração em nome próprio pelos produtos da parceira.",
    "A receita da Vapti vem dos juros das CCBs que ela compra (e da remuneração contratual com a parceira).",
    "A Vapti não recebe pagamentos em conta própria.",
    "A Vapti não pode ser correspondente da mesma parceira, nem subcontratar o serviço.",
    "Prevenção à lavagem de dinheiro e conhecimento do cliente são da parceira; a Vapti faz tarefas acessórias.",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 4.3 Caminhos descartados                                            */
/* ------------------------------------------------------------------ */

export const caminhos = {
  usuraAoAno: n(0.12, "12% ao ano", "%", "fato", "Lei de Usura — Briefing 4.3"),
  escTetoReceita: n(4_800_000, "R$ 4,8 mi", "R$", "fato", "LC 167/2019 — Briefing 4.3"),
  opcoes: [
    {
      nome: "Empresa comum",
      ok: false,
      motivos: [
        "Juros limitados a 12% ao ano (Lei de Usura)",
        "Excesso é nulo, com devolução em dobro (MP 2.172-32/2001)",
        "Crime de usura (Lei 1.521/51)",
        "Crime de operar como instituição financeira sem autorização (Lei 7.492/86)",
      ],
    },
    {
      nome: "ESC — Empresa Simples de Crédito",
      ok: false,
      motivos: [
        "Só MEI, ME e EPP — nunca pessoa física",
        "Só o município-sede e os vizinhos",
        "Carteira limitada ao capital, sem fundos",
        "Teto de receita de R$ 4,8 mi por ano",
      ],
    },
    {
      nome: "BaaS — tomadora com instituição parceira",
      ok: true,
      motivos: [
        "Pessoa física, MEI e negativado, no Brasil inteiro",
        "Juros livres via instituição autorizada",
        "Dívida estruturada e FIDC compram a carteira",
        "Sem teto de receita",
      ],
    },
  ],
  fatoDecisivo: "A Zippi nunca foi ESC. Começou como originadora (Ltda) apoiada em instituição parceira, emprestando para pessoa física no Brasil inteiro.",
  correcao: "Juros livres não vêm da ESC. Vêm de operar através de instituição autorizada: a Lei de Usura não se aplica a instituições financeiras.",
} as const;

/* ------------------------------------------------------------------ */
/* 4.4 Produto                                                         */
/* ------------------------------------------------------------------ */

export const produto = {
  parcelasSemanais: n(4, "4", "semanas", "fato", B("4.4")),
  amortizacaoSemanal: n(0.25, "25%", "%", "fato", B("4.4")),
  planosDiarios: [7, 14, 20] as const,
  planoDiarioRecomendado: 14,
  pixRetentativas: n(3, "3", "un", "fato", B("4.4")),
  pixAvisoDias: n(10, "10 dias", "dias", "fato", B("4.4")),
  pixDesde: "junho de 2025",
  capacidadeMaxRenda: n(0.15, "15%", "%", "premissa", B("4.4")),
  percentilPeriodoRuim: n(20, "percentil 20", "un", "premissa", B("4.4")),
  janelaAnaliseDias: n(90, "90 dias", "dias", "premissa", B("4.4")),
  travas: [
    "Um saque ativo por vez no padrão.",
    "Nada de sacar para pagar saque.",
    "Cliente em atraso não saca.",
    "Saques repetidos em intervalo curto reduzem o limite e disparam oferta de reparcelamento.",
  ],
  jornada7: ["Dados", "Open Finance", "Análise", "Proposta", "Aceite", "Pix Automático", "Pix recebido"],
} as const;

/* ------------------------------------------------------------------ */
/* 4.5 Preço                                                           */
/* ------------------------------------------------------------------ */

export interface LinhaPreco {
  taxaSemanal: Num;
  juros: Num;
  parcela: Num;
  efetivaSacado: Num;
  efetivaSaldo: Num;
}

const lp = (t: number, tr: string, j: number, p: number, es: number, esr: string, ed: number, edr: string): LinhaPreco => ({
  taxaSemanal: n(t, tr, "%", "premissa", B("4.5")),
  juros: n(j, `R$ ${j}`, "R$", "premissa", B("4.5")),
  parcela: n(p, `R$ ${p}`, "R$", "premissa", B("4.5")),
  efetivaSacado: n(es, esr, "%", "premissa", B("4.5 — TIR convertida para 30 dias")),
  efetivaSaldo: n(ed, edr, "%", "premissa", B("4.5")),
});

export const preco = {
  base: projeto.saqueMedio,
  tabela: [
    lp(0.04, "4,0%", 64, 116, 0.295, "29,5%", 0.183, "18,3%"),
    lp(0.045, "4,5%", 72, 118, 0.335, "33,5%", 0.208, "20,8%"),
    lp(0.05, "5,0%", 80, 120, 0.375, "37,5%", 0.233, "23,3%"),
    lp(0.06, "6,0%", 96, 124, 0.458, "45,8%", 0.284, "28,4%"),
  ] as LinhaPreco[],
  zippiTaxaSemanal: n(0.04, "4%", "%", "fato", "Startups.com.br — a partir de 4% por semana sobre o valor usado"),
  zippiEfetivaMes: n(0.183, "18,3%", "%", "estimativa", B("4.5 — 4% por semana sobre o saldo, convertido a 30 dias")),
  maisJurosSacadoVsSaldo: n(0.6, "60%", "%", "premissa", B("4.5")),
  vezesZippiBase: n(2, "2 vezes", "x", "estimativa", B("4.5 — a 5% por semana")),
  /** Exemplo do cenário-base: R$ 400 × 5% × 4 semanas. */
  exemplo: {
    sacado: projeto.saqueMedio,
    taxa: n(0.05, "5%", "%", "premissa", B("4.5")),
    juros: n(80, "R$ 80", "R$", "premissa", B("4.5")),
    total: n(480, "R$ 480", "R$", "premissa", B("4.5")),
    parcela: n(120, "R$ 120", "R$", "premissa", B("4.5")),
    amortizacao: n(100, "R$ 100", "R$", "premissa", B("4.5")),
    jurosParcela: n(20, "R$ 20", "R$", "premissa", B("4.5")),
    efetivaMes: n(0.375, "37,5%", "%", "premissa", B("4.5")),
  },
  planoDiario: [
    { dias: 7, juros: n(20, "R$ 20,00", "R$", "premissa", B("4.5")), parcela: n(60, "R$ 60,00", "R$", "premissa", B("4.5")), efetivaMes: n(0.445, "44,5%", "%", "premissa", B("4.5")) },
    { dias: 14, juros: n(40, "R$ 40,00", "R$", "premissa", B("4.5")), parcela: n(31.43, "R$ 31,43", "R$", "premissa", B("4.5")), efetivaMes: n(0.472, "47,2%", "%", "premissa", B("4.5")) },
    { dias: 20, juros: n(57.14, "R$ 57,14", "R$", "premissa", B("4.5")), parcela: n(22.86, "R$ 22,86", "R$", "premissa", B("4.5")), efetivaMes: n(0.476, "47,6%", "%", "premissa", B("4.5")) },
  ],
  cuidados: [
    "Custo total em reais e taxa efetiva mensal sempre visíveis: é exigência legal e é proteção.",
    "Juros livres não são juros sem teto: o STJ revisa taxas muito acima da média de mercado.",
    "Cobrar o dobro da referência é defensável pelo risco do público negativado; o triplo, não.",
    "Seleção adversa: se for caro para todos, quem tem opção vai embora. Por isso a taxa cai com o nível.",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 4.6 Gamificação                                                     */
/* ------------------------------------------------------------------ */

export interface Nivel {
  id: "entrada" | "bronze" | "prata" | "ouro";
  nome: string;
  comoChega: string;
  ciclos: number;
  taxaSemanal: Num;
  efetivaMes: Num;
  /** Juros de um saque de R$ 400 em 4 semanas. */
  jurosExemplo: Num;
  limiteVolta: string;
  extra?: string;
}

export const niveis: Nivel[] = [
  { id: "entrada", nome: "Entrada", comoChega: "Primeiro saque, negativado incluso", ciclos: 0, taxaSemanal: preco.tabela[3].taxaSemanal, efetivaMes: preco.tabela[3].efetivaSacado, jurosExemplo: preco.tabela[3].juros, limiteVolta: "Ao zerar" },
  { id: "bronze", nome: "Bronze", comoChega: "2 ciclos quitados sem atraso", ciclos: 2, taxaSemanal: preco.tabela[2].taxaSemanal, efetivaMes: preco.tabela[2].efetivaSacado, jurosExemplo: preco.tabela[2].juros, limiteVolta: "Ao zerar" },
  { id: "prata", nome: "Prata", comoChega: "5 ciclos sem atraso", ciclos: 5, taxaSemanal: preco.tabela[1].taxaSemanal, efetivaMes: preco.tabela[1].efetivaSacado, jurosExemplo: preco.tabela[1].juros, limiteVolta: "Conforme paga" },
  { id: "ouro", nome: "Ouro", comoChega: "10 ciclos sem atraso", ciclos: 10, taxaSemanal: preco.tabela[0].taxaSemanal, efetivaMes: preco.tabela[0].efetivaSacado, jurosExemplo: preco.tabela[0].juros, limiteVolta: "Conforme paga", extra: "Reserva de emergência pré-aprovada, liberada em segundos" },
];

export const gamificacao = {
  taxaMediaCarteira: n(0.05, "5% por semana", "%", "premissa", B("4.6 — cenário-base das projeções")),
  ouroAcimaZippi: n(0.6, "60%", "%", "estimativa", B("4.6 — 29,5% contra 18,3% ao mês")),
  toleranciaPorTrimestre: n(1, "1", "un", "premissa", B("4.6")),
  mecanicas: [
    { titulo: "Escada de níveis", texto: "Barra de progresso visível: “faltam 2 ciclos para Prata”." },
    { titulo: "Contratação em 7 etapas", texto: "Uma barra mostra cada passo até o Pix cair." },
    { titulo: "Sequência em dia", texto: "Semanas em dia contam. 1 tolerância por trimestre: um dia de atraso sem perder a sequência." },
    { titulo: "Pix Automático acelera", texto: "Quem ativa o débito automático sobe de nível mais rápido." },
    { titulo: "Indicação", texto: "Quem indica sobe mais rápido se os indicados pagarem em dia. Nenhuma dívida muda de dono; ninguém vê dados de ninguém." },
    { titulo: "Reserva no Ouro", texto: "Valor pré-aprovado, liberado em segundos." },
    { titulo: "Linha do tempo do crédito", texto: "Limite inicial, limite atual e semanas em dia, sempre à vista." },
  ],
  principios: [
    "Premia pagamento e organização, nunca volume de dívida.",
    "Regras sempre visíveis.",
    "Nada aleatório: nenhum benefício depende de sorte.",
    "Sinal de dependência reduz o limite em vez de vender mais.",
  ],
  zippiReferencia: "A própria Zippi mantém uma frente de gamificação de pagamentos e débito automático, segundo vaga publicada por ela.",
} as const;

/* ------------------------------------------------------------------ */
/* 4.7 Atraso, multa e mora                                            */
/* ------------------------------------------------------------------ */

export const atraso = {
  multaMax: n(0.02, "2%", "%", "fato", "CDC, art. 52, §1º"),
  moraMaxMes: n(0.01, "1% ao mês", "%", "fato", "Súmula 379 do STJ"),
  multaExemploParcela: n(100, "R$ 100", "R$", "premissa", B("4.7")),
  multaExemploValor: n(2, "R$ 2", "R$", "premissa", B("4.7")),
  diaReparcelamento: n(7, "7º dia", "dias", "premissa", B("4.7")),
  toleranciaDias: "1 a 2 dias",
  alavancas: ["Bloquear novo saque", "Tolerância de 1 a 2 dias com lembrete", "Aceitar pagamento parcial", "Oferta automática de reparcelamento no 7º dia de atraso"],
  regrasCobranca: ["Das 8h às 20h", "Nada em domingos e feriados", "No máximo 1 mensagem de cobrança por dia por contrato", "Nunca contatar terceiros", "Roteiro revisado por advogado"],
} as const;

/* ------------------------------------------------------------------ */
/* 4.8 Modelo financeiro — premissas e valores de teste                */
/* ------------------------------------------------------------------ */

export const premissas = {
  saqueMedio: projeto.saqueMedio,
  pctNaRua: n(0.85, "85%", "%", "premissa", B("4.8")),
  saldoMedio: n(0.625, "62,5%", "%", "premissa", B("4.8 — 4 semanas, amortização de 25% por semana")),
  semanasPorMes: n(52 / 12, "52/12", "semanas", "premissa", B("4.8")),
  semanasPorSaque: n(4, "4", "semanas", "premissa", B("4.8")),
  custoOperacao: n(8, "R$ 8", "R$", "premissa", B("4.8")),
  custoParceira: estrutura.custoParceiraPorSaque,
  custoPorSaque: n(13, "R$ 13", "R$", "premissa", B("4.8 — R$ 8 de operação + R$ 5 da parceira")),
  fundingMes: n(0.02, "2% ao mês", "%", "premissa", B("4.8")),
  taxaBase: n(0.05, "5% por semana", "%", "premissa", B("4.8")),
  perdaBase: n(0.08, "8%", "%", "premissa", B("4.8")),
  perdaEstresse: n(0.12, "12%", "%", "premissa", B("4.8")),
  /** Conversão da TIR para taxa mensal: 30 dias corridos. */
  diasPorMes: n(30, "30 dias", "dias", "premissa", B("4.8 — TIR convertida para 30 dias")),
  diasPorSemana: n(7, "7 dias", "dias", "premissa", B("4.5 — parcelas semanais")),
  mesesPorAno: n(12, "12", "meses", "premissa", B("4.8 — receita/ano = receita/mês × 12")),
  /** Premissas derivadas da Tabela B (proporções entre as fases). */
  multCarteiraFase2: n(4, "4x a carteira da fase 1", "x", "premissa", B("4.8, Tabela B — derivado: R$ 3,4 mi ÷ R$ 0,85 mi")),
  multCarteiraFase3: n(15, "15x a carteira da fase 1", "x", "premissa", B("4.8, Tabela B — derivado: R$ 12,75 mi ÷ R$ 0,85 mi")),
  seniorFase2: n(0.75, "75% da carteira", "%", "premissa", B("4.8, Tabela B — sênior de R$ 2,55 mi sobre R$ 3,4 mi")),
  seniorFase3: n(0.8, "80% da carteira", "%", "premissa", B("4.8, Tabela B — sênior de R$ 10,2 mi sobre R$ 12,75 mi")),
  lista: [
    "Saque médio de R$ 400.",
    "85% do capital na rua.",
    "Saldo médio de cada saque igual a 62,5% do valor (4 semanas, 25% por semana).",
    "52/12 semanas por mês.",
    "Custo direto de R$ 13 por saque: R$ 8 de operação + R$ 5 da parceira (estimativa).",
    "Perda medida sobre o valor sacado.",
    "Funding sênior a 2% ao mês.",
    "Margem antes de equipe, tecnologia e impostos.",
    "Fase 2: carteira de R$ 3,4 mi; dívida sênior de R$ 2,55 mi; o capital da Vapti vira 25% subordinado.",
    "Fase 3: FIDC com carteira de R$ 12,75 mi; sênior de R$ 10,2 mi; subordinada de R$ 2,55 mi (20%).",
    "Régua de crescimento: hipóteses de ordem de grandeza, não promessas.",
  ],
} as const;

const P = (secao: string) => `Projeção — ${B(secao)}`;

export interface LinhaTabelaA {
  capital: Num;
  carteira: Num;
  sacadoMes: Num;
  receitaMes4: Num;
  receitaMes5: Num;
  receitaMes6: Num;
  receitaAno5: Num;
  margem8: Num;
  margem12: Num;
  clientesComSaldo: Num;
  saquesMes: Num;
}

const pa = (v: number, r: string, u: Unidade = "R$"): Num => n(v, r, u, "projeção", P("4.8, Tabela A"));

/** Tabela A — variação de capital, fase 1 (valores de teste do briefing). */
export const tabelaA: LinhaTabelaA[] = [
  { capital: n(150_000, "R$ 150 mil", "R$", "premissa", B("4.8")), carteira: pa(127_500, "R$ 127,5 mil"), sacadoMes: pa(221_000, "R$ 221,0 mil"), receitaMes4: pa(35_400, "R$ 35,4 mil"), receitaMes5: pa(44_200, "R$ 44,2 mil"), receitaMes6: pa(53_000, "R$ 53,0 mil"), receitaAno5: pa(530_400, "R$ 530,4 mil"), margem8: pa(19_300, "R$ 19,3 mil"), margem12: pa(10_500, "R$ 10,5 mil"), clientesComSaldo: pa(510, "510", "un"), saquesMes: pa(552, "552", "un") },
  { capital: n(250_000, "R$ 250 mil", "R$", "premissa", B("4.8")), carteira: pa(212_500, "R$ 212,5 mil"), sacadoMes: pa(368_300, "R$ 368,3 mil"), receitaMes4: pa(58_900, "R$ 58,9 mil"), receitaMes5: pa(73_700, "R$ 73,7 mil"), receitaMes6: pa(88_400, "R$ 88,4 mil"), receitaAno5: pa(884_000, "R$ 884,0 mil"), margem8: pa(32_200, "R$ 32,2 mil"), margem12: pa(17_500, "R$ 17,5 mil"), clientesComSaldo: pa(850, "850", "un"), saquesMes: pa(921, "921", "un") },
  { capital: n(500_000, "R$ 500 mil", "R$", "premissa", B("4.8")), carteira: pa(425_000, "R$ 425,0 mil"), sacadoMes: pa(736_700, "R$ 736,7 mil"), receitaMes4: pa(117_900, "R$ 117,9 mil"), receitaMes5: pa(147_300, "R$ 147,3 mil"), receitaMes6: pa(176_800, "R$ 176,8 mil"), receitaAno5: pa(1_770_000, "R$ 1,77 mi"), margem8: pa(64_500, "R$ 64,5 mil"), margem12: pa(35_000, "R$ 35,0 mil"), clientesComSaldo: pa(1_700, "1.700", "un"), saquesMes: pa(1_842, "1.842", "un") },
  { capital: n(1_000_000, "R$ 1 mi", "R$", "premissa", B("4.8")), carteira: pa(850_000, "R$ 850,0 mil"), sacadoMes: pa(1_470_000, "R$ 1,47 mi"), receitaMes4: pa(235_700, "R$ 235,7 mil"), receitaMes5: pa(294_700, "R$ 294,7 mil"), receitaMes6: pa(353_600, "R$ 353,6 mil"), receitaAno5: pa(3_540_000, "R$ 3,54 mi"), margem8: pa(128_900, "R$ 128,9 mil"), margem12: pa(70_000, "R$ 70,0 mil"), clientesComSaldo: pa(3_400, "3.400", "un"), saquesMes: pa(3_683, "3.683", "un") },
];

export interface Fase {
  fase: 1 | 2 | 3;
  periodo: string;
  financiamento: string;
  capitalProprio: Num;
  dividaSenior: Num;
  carteira: Num;
  sacadoMes: Num;
  receitaAno: Num;
  perdaMes8: Num;
  custoMes: Num;
  fundingMes: Num;
  margem8: Num;
  margem12: Num;
  perdaEquilibrio: Num;
}

const pb = (v: number, r: string, u: Unidade = "R$"): Num => n(v, r, u, "projeção", P("4.8, Tabela B"));

/** Tabela B — as três fases, a 5% por semana. */
export const fases: Fase[] = [
  {
    fase: 1,
    periodo: "Meses 0–12",
    financiamento: "R$ 1 mi próprio compra todas as CCBs",
    capitalProprio: pb(850_000, "R$ 0,85 mi"),
    dividaSenior: pb(0, "—"),
    carteira: pb(850_000, "R$ 0,85 mi"),
    sacadoMes: pb(1_470_000, "R$ 1,47 mi"),
    receitaAno: pb(3_540_000, "R$ 3,54 mi"),
    perdaMes8: pb(117_900, "R$ 117,9 mil"),
    custoMes: pb(47_900, "R$ 47,9 mil"),
    fundingMes: pb(0, "—"),
    margem8: pb(128_900, "R$ 128,9 mil"),
    margem12: pb(70_000, "R$ 70,0 mil"),
    perdaEquilibrio: pb(0.1675, "16,75%", "%"),
  },
  {
    fase: 2,
    periodo: "Meses 12–24",
    financiamento: "Dívida estruturada (debênture ou linha com a parceira). O capital da Vapti vira 25% subordinado.",
    capitalProprio: pb(850_000, "R$ 0,85 mi"),
    dividaSenior: pb(2_550_000, "R$ 2,55 mi"),
    carteira: pb(3_400_000, "R$ 3,4 mi"),
    sacadoMes: pb(5_890_000, "R$ 5,89 mi"),
    receitaAno: pb(14_140_000, "R$ 14,14 mi"),
    perdaMes8: pb(471_500, "R$ 471,5 mil"),
    custoMes: pb(191_500, "R$ 191,5 mil"),
    fundingMes: pb(51_000, "R$ 51,0 mil"),
    margem8: pb(464_700, "R$ 464,7 mil"),
    margem12: pb(228_900, "R$ 228,9 mil"),
    perdaEquilibrio: pb(0.159, "15,9%", "%"),
  },
  {
    fase: 3,
    periodo: "Ano 3",
    financiamento: "FIDC: subordinada de R$ 2,55 mi (capital, lucro retido e aporte) a 20%; sênior de R$ 10,2 mi.",
    capitalProprio: pb(2_550_000, "R$ 2,55 mi"),
    dividaSenior: pb(10_200_000, "R$ 10,2 mi"),
    carteira: pb(12_750_000, "R$ 12,75 mi"),
    sacadoMes: pb(22_100_000, "R$ 22,1 mi"),
    receitaAno: pb(53_040_000, "R$ 53,04 mi"),
    perdaMes8: pb(1_770_000, "R$ 1,77 mi"),
    custoMes: pb(718_300, "R$ 718,3 mil"),
    fundingMes: pb(204_000, "R$ 204,0 mil"),
    margem8: pb(1_730_000, "R$ 1,73 mi"),
    margem12: pb(845_800, "R$ 845,8 mil"),
    perdaEquilibrio: pb(0.158, "15,8%", "%"),
  },
];

/** Fase 1 em números (V15) — cenário-base, R$ 1 mi, 5% por semana, perda de 8%. */
export const fase1 = {
  capital: projeto.capitalInicial,
  carteira: fases[0].carteira,
  sacadoMes: fases[0].sacadoMes,
  receitaMes: tabelaA[3].receitaMes5,
  receitaAno: fases[0].receitaAno,
  perdaMes: fases[0].perdaMes8,
  custoMes: fases[0].custoMes,
  margemMes: fases[0].margem8,
  margemMes12: fases[0].margem12,
  clientesComSaldo: tabelaA[3].clientesComSaldo,
  saquesMes: tabelaA[3].saquesMes,
  perdaEquilibrio: fases[0].perdaEquilibrio,
  quedaMargem8a12: pb(59_000, "R$ 59 mil"),
};

/** Perda de equilíbrio da fase 1 por taxa semanal. */
export const equilibrioPorTaxa = [
  { taxa: preco.tabela[0].taxaSemanal, perda: pb(0.1275, "12,75%", "%") },
  { taxa: preco.tabela[1].taxaSemanal, perda: pb(0.1475, "14,75%", "%") },
  { taxa: preco.tabela[2].taxaSemanal, perda: pb(0.1675, "16,75%", "%") },
  { taxa: preco.tabela[3].taxaSemanal, perda: pb(0.2075, "20,75%", "%") },
];

export const comoMedimos = [
  { titulo: "Safra mensal", texto: "Cada coorte de entrada acompanhada mês a mês." },
  { titulo: "Roll rate", texto: "Em dia → 1–7 dias → 8–30 → 31–60 → mais de 60." },
  { titulo: "Perda esperada", texto: "PD × LGD × EAD, com provisão por safra." },
  { titulo: "Recontratação", texto: "Quantos voltam, por coorte." },
  { titulo: "Custo por saque", texto: "Custo total, saque a saque." },
] as const;

export const rollRateFaixas = ["Em dia", "1–7 dias", "8–30", "31–60", "Mais de 60"] as const;

/* ------------------------------------------------------------------ */
/* 4.9 Custos e eficiência                                             */
/* ------------------------------------------------------------------ */

export const eficiencia = {
  serasaBalcaoMin: n(15.99, "R$ 15,99", "R$", "fato", "Serasa Experian — preço de balcão"),
  serasaBalcaoMax: n(59.99, "R$ 59,99", "R$", "fato", "Serasa Experian — preço de balcão"),
  boaVista: n(13, "R$ 13", "R$", "fato", B("4.9 — CNPJ com score")),
  apiMin: n(1, "R$ 1", "R$", "estimativa", B("4.9 — por API, em volume")),
  apiMax: n(5, "R$ 5", "R$", "estimativa", B("4.9 — por API, em volume")),
  custoAprovadoSemFunil: n(16.67, "R$ 16,67", "R$", "estimativa", B("4.9 — consulta a R$ 5, 30% de aprovação")),
  custoAprovadoComFunil: n(8.33, "R$ 8,33", "R$", "estimativa", B("4.9 — consulta a R$ 5, 30% de aprovação")),
  aprovacao: n(0.3, "30%", "%", "premissa", B("4.9")),
  bureauMaduroMin: n(2, "R$ 2", "R$", "estimativa", B("4.9")),
  bureauMaduroMax: n(3, "R$ 3", "R$", "estimativa", B("4.9")),
  funil: ["Cadastro público (grátis)", "Antifraude", "Open Finance", "Bureau"],
  whatsMsg: n(0.035, "R$ 0,035", "R$", "fato", "Nosso Meio — cobrança de respostas na API (desde 01/10/2026)"),
  whatsFranquia: n(1_000, "1.000", "un", "fato", B("4.9 — mensagens de serviço por mês")),
  whatsJanelaAnuncio: n(72, "72 horas", "horas", "fato", B("4.9 — Click-to-WhatsApp")),
  msgsAntes: n(30, "30", "un", "estimativa", B("4.9")),
  /** Ponto médio derivado da faixa "4 a 6" do briefing — para gráfico; na tela, exibir `msgsDepoisFaixa`. */
  msgsDepois: n(5, "4 a 6", "un", "estimativa", B("4.9 — 4 a 6 mensagens cobradas por saque")),
  msgsDepoisFaixa: "4 a 6",
  custoMsgAntes: n(1.05, "R$ 1,05", "R$", "estimativa", B("4.9")),
  custoMsgDepois: n(0.2, "R$ 0,20", "R$", "estimativa", B("4.9")),
  verificacaoMetaSemanas: "2 a 6 semanas",
  fornecedoresWhats: ["Blip", "Zenvia", "Infobip", "Sinch", "Twilio"],
  iaPermitida: "Usar IA para atender os próprios clientes é permitido na API oficial; a restrição de 15/01/2026 mira assistentes de IA de uso geral.",
  pixAutomatico: "Sem tarifa para quem paga; quem recebe paga conforme a instituição.",
} as const;

/* ------------------------------------------------------------------ */
/* 4.10 Zippi — a referência (sempre em cinza, só texto)               */
/* ------------------------------------------------------------------ */

export const zippi = {
  nome: "Zippi",
  fundacao: 2019,
  fundadores: "André Bernardes, Ludmila Pontremolez e Bruno Lucas (ex-ITA e MIT)",
  concedido: n(7_600_000_000, "R$ 7,6 bi", "R$", "fato", "Finsiders — FIDC de R$ 220 milhões"),
  valorEstimado: n(80_000_000, "≈ US$ 80 mi", "US$", "estimativa", "Dealroom — estimativa de terceiros"),
  equityAte2022: n(22_000_000, "~US$ 22 mi", "US$", "fato", "Exame / Startups — três rodadas até 2022"),
  autonomosApp: n(250_000, "250 mil", "un", "fato", "App Store — Zippi"),
  clientesAtivos2025: n(100_000, "mais de 100 mil", "un", "fato", "LatamList"),
  limiteMax: n(5_000, "R$ 5.000", "R$", "fato", "App Store — Zippi"),
  projecao2026: n(10_000_000_000, "R$ 10 bi", "R$", "fato", "Finsiders — projeção da própria Zippi para 2026"),
  serieA: n(16_000_000, "US$ 16 mi", "US$", "fato", "Exame — Série A liderada pela Tiger Global"),
  seed: n(125_000, "US$ 125 mil", "US$", "fato", "Dealroom"),
  seedValuation: n(2_000_000, "US$ 2 mi", "US$", "fato", "Dealroom"),
  liberado2022: n(275_000_000, "R$ 275 mi", "R$", "fato", "Finsiders — Zippi cresce 9 vezes"),
  transacoes2022: n(500_000, "500 mil", "un", "fato", "Finsiders"),
  ticket2022: n(550, "~R$ 550", "R$", "fato", "Finsiders"),
  crescimento2022: n(9, "9 vezes", "x", "fato", "Finsiders"),
  debenture2022: n(30_000_000, "R$ 30 mi", "R$", "fato", "Finsiders — estruturada pela Empírica"),
  acumuladoAbr2024: n(1_000_000_000, "R$ 1 bi", "R$", "fato", "Finsiders — R$ 1 bilhão em transações"),
  altaAbr2024: n(2.1, "210%", "%", "fato", "Finsiders"),
  emprestimos2021: n(160_000, "160 mil", "un", "fato", "Preqin"),
  fidc: [
    { ano: "2024", valor: n(66_000_000, "R$ 66 mi", "R$", "fato", "Finsiders") },
    { ano: "2025", valor: n(80_000_000, "R$ 80 mi", "R$", "fato", "LatamList") },
    { ano: "fev/2026", valor: n(220_000_000, "R$ 220 mi", "R$", "fato", "Finsiders — terceira captação") },
  ],
  timeline: [
    { quando: "set/2019", texto: "Seed do Y Combinator: US$ 125 mil" },
    { quando: "out/2021", texto: "Lança o cartão de crédito semanal" },
    { quando: "2022", texto: "R$ 275 mi liberados (operação 9x maior que no ano anterior)" },
    { quando: "abr/2024", texto: "R$ 1 bi acumulado em transações" },
    { quando: "2024", texto: "Primeiro FIDC: R$ 66 mi" },
    { quando: "2025", texto: "FIDC de R$ 80 mi; crescimento acima de 100%" },
    { quando: "fev/2026", texto: "FIDC de R$ 220 mi" },
  ],
  licao: "Equity financia a empresa; dívida financia a carteira.",
  modelo: "Análise, esteira e cobrança feitas dentro de casa; Pix e liquidação via fornecedores de BaaS.",
  ondeNaoVale: [
    "A Zippi nasceu no circuito de venture capital, com fundadores do MIT e do ITA.",
    "A Vapti começa com R$ 1 milhão próprio.",
    "A Vapti cobra cerca de 2 vezes mais: o argumento é atender quem a Zippi recusa.",
  ],
} as const;

/* ------------------------------------------------------------------ */
/* 4.11 Régua de crescimento, aportes e saída                          */
/* ------------------------------------------------------------------ */

export const regua = [
  { ano: "0", zippi: "2019–2021: seed no Y Combinator; produto lançado em out/2021", vapti: "Estrutura, parceira, piloto de 90 dias", capital: "Só o R$ 1 mi" },
  { ano: "1", zippi: "2022: Série A de US$ 16 mi; R$ 275 mi liberados; debênture de R$ 30 mi", vapti: "Fase 1: carteira de R$ 0,85 mi, ~3.400 clientes com saldo, 12 meses de safra", capital: "Nenhum: é o ano de gerar histórico" },
  { ano: "2", zippi: "2023: rumo a R$ 1 bi acumulado (abr/2024)", vapti: "Fase 2: dívida estruturada, carteira de R$ 3,4 mi", capital: "Dívida de R$ 3 a 10 mi; anjo ou seed se crescer mais de 3x" },
  { ano: "3", zippi: "2024: primeiro FIDC, R$ 66 mi", vapti: "Fase 3: FIDC, carteira de R$ 12,75 mi", capital: "FIDC de R$ 10 a 30 mi" },
  { ano: "4–5", zippi: "2025: FIDC de R$ 80 mi; crescimento acima de 100%; mais de 100 mil clientes ativos", vapti: "Rodada Série A, se os números sustentarem", capital: "Equity de R$ 15 a 40 mi" },
  { ano: "6+", zippi: "2026: FIDC de R$ 220 mi; R$ 7,6 bi concedidos", vapti: "Janela de venda ou nova carteira", capital: "—" },
] as const;

/** Trilhas da V20 (Vapti em verde = projeção; Zippi em cinza = fato). */
export const trilhas = {
  zippi: [
    { marco: "2021", texto: "Lançamento" },
    { marco: "2024", texto: "Primeiro FIDC" },
    { marco: "2025", texto: "FIDC de R$ 80 mi" },
    { marco: "2026", texto: "FIDC de R$ 220 mi" },
  ],
  vapti: [
    { marco: "Ano 1", texto: "Histórico: carteira de R$ 0,85 mi" },
    { marco: "Ano 2", texto: "Dívida de R$ 3 a 10 mi" },
    { marco: "Ano 3", texto: "FIDC de R$ 10 a 30 mi" },
    { marco: "Anos 4–5", texto: "Rodada de R$ 15 a 40 mi" },
    { marco: "Anos 4–6", texto: "Janela de venda" },
  ],
} as const;

export const captacao = {
  ressalva: "A coluna da Vapti são hipóteses de ordem de grandeza, não promessas.",
  gestoraOlha: [
    "12 a 18 meses de safras fechadas",
    "Perda estável e previsível",
    "Carteira acima de R$ 5 mi (abaixo disso, estruturar não compensa)",
    "Trilha auditável de ponta a ponta",
    "Originação acima de R$ 2 mi por mês, sustentada",
  ],
  valuation: [
    { base: "Patrimônio", multiplo: "0,8x a 2x", quando: "Operação estável" },
    { base: "Lucro", multiplo: "4x a 8x", quando: "Pequena e lucrativa" },
    { base: "Receita", multiplo: "2x a 6x", quando: "Só com crescimento alto" },
  ],
  oQueSeVende: {
    carteira: "A carteira vale o valor de face.",
    motor: "O motor de originação vale múltiplo: canal barato, modelo de risco e base que recontrata.",
  },
  janela: {
    anos: "Anos 4 a 6",
    condicoes: ["Carteira acima de R$ 30 mi", "FIDC rodando", "Crescimento acima de 50% ao ano"],
    nota: "Antes disso não há comprador; depois, o preço volta a ser múltiplo de lucro.",
  },
  alertaMultiplo: "Crédito para autônomo é operação pesada e de risco: não conte com múltiplos de empresa de software.",
  novaCarteira: "“Montar mais carteiras” significa abrir uma nova originadora em outro nicho, levando o motor de crédito e o time.",
} as const;

/* ------------------------------------------------------------------ */
/* 4.12 Vantagens e desvantagens                                       */
/* ------------------------------------------------------------------ */

export const vantagens = [
  "Nacional desde o primeiro dia; pessoa física, MEI e negativado.",
  "Sem teto de receita; dívida estruturada a partir do ano 2 e FIDC a partir do ano 3.",
  "Juros livres via instituição autorizada; multa e mora viáveis.",
  "Modelo validado: a Zippi já concedeu R$ 7,6 bilhões.",
  "Pix Automático reduz atraso e custo de cobrança.",
  "Jornada enxuta: cerca de R$ 0,20 de WhatsApp por saque; bureau de R$ 2 a R$ 3 por saque na carteira madura.",
  "O motor de crédito próprio é o ativo que se vende.",
  "Preço com prêmio de risco: mesmo no nível Ouro, cerca de 60% acima da Zippi.",
] as const;

export const riscos = [
  { risco: "Perda acima de 16,75% zera a margem da fase 1", mitigacao: "Piloto de 90 dias com critério de parada; Open Finance; escada de limite" },
  { risco: "Dependência da parceira (preço, encerramento)", mitigacao: "Contrato com aviso prévio; integração desenhada para trocar de parceira; cotar 3" },
  { risco: "Custo por CCB cobrado pela parceira", mitigacao: "Negociar por volume; cotação antes do piloto" },
  { risco: "2 a 4 meses até operar", mitigacao: "Começar já os contratos e a verificação na Meta" },
  { risco: "Taxa de cerca de 2x a Zippi: revisão judicial e seleção adversa", mitigacao: "Taxa cai por nível; custo em reais na tela; perfil de risco documentado" },
  { risco: "CDC integral para pessoa física", mitigacao: "Roteiros revisados; cobrança dentro das regras; registro de tudo" },
  { risco: "Regra de BaaS nova, interpretação em consolidação", mitigacao: "Parecer jurídico antes de assinar" },
  { risco: "Fraude no cadastro digital", mitigacao: "Biometria, antifraude, Open Finance; limite inicial baixo" },
  { risco: "Dependência do WhatsApp e da Meta", mitigacao: "A plataforma própria carrega a jornada; o WhatsApp fica nas pontas" },
  { risco: "Capital próprio limitado no ano 1", mitigacao: "Fase 2 com dívida assim que houver 12 meses de safra" },
] as const;

/* ------------------------------------------------------------------ */
/* 4.13 Piloto de 90 dias                                              */
/* ------------------------------------------------------------------ */

export const piloto = {
  dias: n(90, "90 dias", "dias", "premissa", B("4.13")),
  carteiraMax: n(150_000, "R$ 150 mil", "R$", "premissa", B("4.13")),
  segmento: "Motoristas de aplicativo (sugestão)",
  praca: projeto.praca,
  metas: [
    "Mais de 80% das parcelas pagas no vencimento",
    "Atraso acima de 30 dias abaixo de 10%",
    "Custo direto do 1º saque abaixo de R$ 20; da recontratação, abaixo de R$ 8",
    "Recontratação de adimplentes acima de 50%",
    "Mais de 85% dos saques sem atendimento humano",
    "Mais de 95% dos Pix conciliados automaticamente",
    "Reclamações abaixo de 3%",
  ],
  parada: [
    "Atraso acima de 30 dias passa de 20% em qualquer safra",
    "Custo por saque acima de R$ 35",
    "Qualquer reclamação formal de cobrança abusiva",
    "Recontratação abaixo de 30%",
  ],
  escala: ["Atraso abaixo de 10%", "Recontratação acima de 50%", "Custo dentro da meta"],
  escalaNota: "Os três juntos. Aí aumenta o capital e abre o segundo segmento.",
} as const;

/* ------------------------------------------------------------------ */
/* 4.14 O pedido ao cliente                                            */
/* ------------------------------------------------------------------ */

export const decisoes = {
  lista: [
    { titulo: "Estrutura BaaS", texto: "Aprovar a estrutura BaaS, sem ESC." },
    { titulo: "Advogado e contador", texto: "Autorizar a contratação de advogado e contador." },
    { titulo: "Cotar parceiras", texto: "Autorizar a cotação de 3 parceiras de BaaS de crédito (começando pela QI Tech) e de 3 fornecedores de WhatsApp." },
    { titulo: "Piloto de 90 dias", texto: "Aprovar o piloto de 90 dias com os critérios de parada." },
    { titulo: "Aporte de R$ 1 mi", texto: "Confirmar o aporte de R$ 1 milhão e o calendário de integralização." },
  ],
  advogado: [
    "A estrutura de tomadora com cessão.",
    "Se os juros contratados pela parceira se mantêm quando a CCB é cedida a uma Ltda.",
    "O nome.",
    "As cláusulas de multa e mora.",
    "Os roteiros de cobrança.",
  ],
  contador: [
    "Ltda no lucro presumido ou no lucro real.",
    "Tributação da receita de juros de CCB adquirida.",
    "Como o IOF recolhido pela parceira entra no custo.",
  ],
  pendenciasProduto: [
    "Confirmar com a parceira se o rotativo semanal com Pix Automático cabe no catálogo dela.",
    "Acesso ao Open Finance via parceira.",
  ],
  /** Próximas 4 semanas — o briefing não traz cronograma detalhado. */
  proximas4Semanas: "[A CONFIRMAR] cronograma semana a semana",
} as const;

/* ------------------------------------------------------------------ */
/* 4.16 Fontes e 4.17 Aviso                                            */
/* ------------------------------------------------------------------ */

export const fontes = [
  { titulo: "Finsiders — Zippi cresce 9 vezes", url: "https://finsidersbrasil.com.br/reportagem-exclusiva-fintechs/zippi-fintech-para-autonomos-cresce-9-vezes-e-planeja-dobrar-volume-de-credito-neste-ano/" },
  { titulo: "Startups — Zippi cresce 9 vezes e preço de 4%", url: "https://startups.com.br/negocios/fintech/fintech-zippi-cresce-9-vezes-e-planeja-dobrar-volume-de-credito/" },
  { titulo: "Finsiders — FIDC de R$ 220 milhões", url: "https://finsidersbrasil.com.br/credito-digital/zippi-levanta-r-220-milhoes-via-fidc-e-projeta-movimentar-r-10-bi-em-2026/" },
  { titulo: "Finsiders — R$ 1 bilhão em transações", url: "https://finsidersbrasil.com.br/giro-noticias/zippi-dobra-meta-de-transacoes-de-credito-em-um-ano-para-r-1-bi/" },
  { titulo: "TI Inside — cartão de crédito semanal (2021)", url: "https://tiinside.com.br/14/10/2021/1o-cartao-de-credito-semanal-do-mundo-e-lancado-pela-fintech-zippi/" },
  { titulo: "Exame — Série A de US$ 16 milhões", url: "https://exame.com/negocios/fintech-dos-autonomos-zippi-capta-us-16-milhoes-com-tiger-global/" },
  { titulo: "Startups — Série A e mercado de 24 milhões de autônomos", url: "https://startups.com.br/negocios/zippi-fecha-serie-a-de-us-16-mi-com-tiger-global-e-y-combinator/" },
  { titulo: "Dealroom — rodadas e valor estimado da Zippi", url: "https://app.dealroom.co/companies/zippi" },
  { titulo: "LatamList — FIDC de 2025 e mais de 100 mil clientes ativos", url: "https://latamlist.com/zippi-secures-15-9m-to-expand-credit-access-for-brazilian-small-businesses/" },
  { titulo: "Regulamento do FIDC da Zippi (Anbima)", url: "https://data-api.prd.anbima.com.br/web-bff/v2/fundos/F0000739480/documentos/7c3658a9-4ad5-4ddf-85a1-a57153d9a1a7.pdf" },
  { titulo: "Zippi — vaga citando gamificação de pagamentos", url: "https://jobs.lever.co/zippi/faf2b8cd-b2a9-4a32-8ce8-cf6df5bb7e08" },
  { titulo: "App Store — Zippi (250 mil autônomos, limite até R$ 5.000)", url: "https://apps.apple.com/br/app/zippi/id1525763736" },
  { titulo: "Demarest — Resolução Conjunta 16/2025 (BaaS)", url: "https://www.demarest.com.br/bc-e-cmn-regulamentam-banking-as-a-service/" },
  { titulo: "Monitor Mercantil — BaaS e correspondente bancário", url: "https://monitormercantil.com.br/o-novo-marco-regulatorio-do-baas-e-a-revisao-das-estruturas-vigentes-de-correspondente-bancario/" },
  { titulo: "QI Tech — Lending as a Service", url: "https://qitech.com.br/en/laas" },
  { titulo: "Tributário nos Bastidores — regras da ESC (LC 167/2019)", url: "https://tributarionosbastidores.com.br/2019/06/empresa-simples-de-credito-esc-principais-regras-e-sua-tributacao/" },
  { titulo: "Migalhas — juros para quem não é instituição financeira", url: "https://www.migalhas.com.br/depeso/341795/como-emprestar-dinheiro-a-juros-no-brasil" },
  { titulo: "B3 Bora Investir — lançamento do Pix Automático", url: "https://borainvestir.b3.com.br/noticias/banco-central-lanca-hoje-o-pix-automatico-saiba-como-vai-funcionar/" },
  { titulo: "Nosso Meio — cobrança de respostas na API do WhatsApp", url: "https://nossomeio.com.br/whatsapp-business-cobra-respostas-de-empresas-na-api-business/" },
  { titulo: "TechCrunch — política de IA na API do WhatsApp", url: "https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/" },
  { titulo: "Serasa Experian — preços de consulta", url: "https://www.serasaexperian.com.br/solucoes/consulta-de-cnpj-serasa-experian" },
  { titulo: "Zenvia — soluções para o setor financeiro", url: "https://zenvia.com/segmentos/financeiro/" },
] as const;

export const aviso =
  "Documento de trabalho para discussão. Projeções são hipóteses com premissas declaradas, não promessa de resultado. A estrutura jurídica e tributária depende de parecer de advogado e contador. Dados de terceiros conforme as fontes citadas, consultadas em outubro de 2026.";

export const avisoCurto =
  "Projeções são hipóteses com premissas declaradas, não promessa de resultado. Estrutura sujeita a parecer jurídico e contábil.";

/** Números-chave do resumo A4 (seção 7 do briefing). */
export const numerosChave = [
  { rotulo: "Capital inicial", num: projeto.capitalInicial },
  { rotulo: "Sacado por mês", num: fases[0].sacadoMes },
  { rotulo: "Receita por ano", num: fases[0].receitaAno },
  { rotulo: "Margem por mês (perda de 8%)", num: fases[0].margem8 },
  { rotulo: "Perda de equilíbrio", num: fases[0].perdaEquilibrio },
  { rotulo: "Taxa efetiva ao mês: base · Ouro (R$ 80 · R$ 64 de juros em R$ 400)", num: preco.exemplo.efetivaMes, extra: preco.tabela[0].efetivaSacado },
] as const;
