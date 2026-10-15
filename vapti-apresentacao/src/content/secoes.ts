/**
 * Texto de todas as seções da apresentação (modo apresentação, leitura e PDF).
 * Fonte: docs/BRIEFING.md, seções 4 e 5. Todo número vem de src/data/vapti.ts.
 */
import type { Secao } from "./tipos";
import {
  aviso,
  avisoCurto,
  captacao,
  caminhos,
  config,
  decisoes,
  eficiencia,
  equilibrioPorTaxa,
  estrutura,
  fase1,
  fases,
  fontes,
  gamificacao,
  niveis,
  piloto,
  preco,
  premissas,
  produto,
  projeto,
  regua,
  riscos,
  vantagens,
  zippi,
  type LinhaPreco,
} from "../data/vapti";

/* ------------------------------------------------------------------ */
/* Atalhos de texto                                                    */
/* ------------------------------------------------------------------ */

const R400 = projeto.saqueMedio.rotulo;

/** Taxa semanal sempre com a efetiva mensal e o custo em reais de R$ 400. */
export const taxaCompleta = (l: LinhaPreco) =>
  `${l.taxaSemanal.rotulo} por semana = ${l.efetivaSacado.rotulo} ao mês = ${l.juros.rotulo} de juros em ${R400}`;

const [tOuro, , tBase, tEntrada] = preco.tabela;
const BASE = taxaCompleta(tBase);
const [nEntrada, nBronze, nPrata, nOuro] = niveis;
const [f1, f2, f3] = fases;
const plano14 = preco.planoDiario[1];
const nEtapas = produto.jornada7.length;
const nPassos = estrutura.fluxo.length;
const nCaminhos = caminhos.opcoes.length;
const nDecisoes = decisoes.lista.length;
const [fidc24, fidc25, fidc26] = zippi.fidc;
/** Primeira letra minúscula, só quando a palavra não é sigla (preserva "R$", "FIDC", "Pix", "Meta"). */
const minusc = (t: string): string => (/^[A-ZÀ-Ý][a-zà-ÿ]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
const artigoBase: Record<string, string> = { Patrimônio: "o patrimônio", Lucro: "o lucro", Receita: "a receita" };
const valorZippi = `${zippi.valorEstimado.rotulo} (estimativa do Dealroom, terceiros)`;

/* ------------------------------------------------------------------ */
/* Seções                                                              */
/* ------------------------------------------------------------------ */

export const secoes: Secao[] = [
  /* 00 ---------------------------------------------------------------- */
  {
    id: "00",
    nome: "Capa",
    titulo: config.slogan,
    subtitulo: `${config.cliente} · ${config.data}`,
    blocos: [{ texto: `${config.apresentador} · ${config.papelApresentador}` }],
    visuais: ["V01"],
    legendas: { V01: `${config.marca} · ${config.versao}` },
    alts: { V01: `Marca ${config.marca} com a frase “${config.slogan}”.` },
    notas: {
      tempo: "0:20",
      fraseChave: `Vou mostrar o modelo, os números e os riscos. No fim, peço ${nDecisoes} decisões.`,
      topicos: [
        "Agradecer o tempo e o interesse dos sócios.",
        `${config.marca} vem de “vapt-vupt”: capital de giro na velocidade do Pix.`,
        `Roteiro: problema, prova, produto, estrutura, números, riscos e ${nDecisoes} decisões.`,
        "Avisar que toda projeção traz o selo e as premissas a um clique.",
      ],
    },
  },

  /* 01 ---------------------------------------------------------------- */
  {
    id: "01",
    nome: "O problema",
    titulo: `${R400} hoje, não em 30 dias`,
    subtitulo: "O autônomo ganha todo dia, de forma irregular. Quando falta, o crédito tradicional pede holerite.",
    blocos: [
      { titulo: "Caixa irregular", texto: "Motorista e barbeiro recebem pouco e todo dia. Um dia fraco abre um buraco no meio da semana." },
      { titulo: "Crédito que não chega", texto: "O crédito tradicional pede holerite. O autônomo não tem. Se está negativado, a porta fecha de vez." },
      { titulo: projeto.autonomosBrasil.rotulo.replace(/^m/, "M"), texto: `de trabalhadores autônomos no Brasil. Fonte: ${projeto.autonomosBrasil.fonte}.` },
      {
        titulo: "A resposta da Vapti",
        texto: `Ter sempre a quem recorrer. Saques de ${projeto.saqueMin.rotulo} a ${projeto.saqueMax.rotulo}, com ticket médio de ${projeto.ticketMedioMin.rotulo} a ${projeto.ticketMedioMax.rotulo}.`,
      },
    ],
    visuais: ["V02", "V03"],
    legendas: {
      V02: "Ilustrativo: entradas diárias de um motorista e de um barbeiro, com um buraco no meio da semana.",
      V03: `${projeto.autonomosBrasil.rotulo} de autônomos. Fonte: ${projeto.autonomosBrasil.fonte}.`,
    },
    alts: {
      V02: "Gráfico ilustrativo, sem dados reais: barras diárias pequenas e irregulares de um motorista e de um barbeiro; no meio da semana, dias quase sem entrada.",
      V03: `Contador que chega a ${projeto.autonomosBrasil.rotulo} de trabalhadores autônomos, sobre um mapa do Brasil feito de pontos. Fonte: ${projeto.autonomosBrasil.fonte}.`,
    },
    notas: {
      tempo: "1:00",
      fraseChave: `O autônomo não precisa de muito dinheiro. Precisa de ${R400} hoje, não em 30 dias.`,
      topicos: [
        "Contar o caso do motorista: o carro quebra na terça, o dinheiro entra na sexta.",
        "O gráfico é ilustrativo: mostra o padrão, não dados de clientes.",
        "O crédito tradicional pede holerite e histórico. O autônomo fica de fora.",
        `Mercado: ${projeto.autonomosBrasil.rotulo} de autônomos (IBGE, citado por Startups.com.br).`,
        `Nossa faixa: saques de ${projeto.saqueMin.rotulo} a ${projeto.saqueMax.rotulo}; ${projeto.saqueMax.rotulo} é teto e raro.`,
        "Pessoa física e MEI, negativados incluídos, no Brasil inteiro.",
      ],
      perguntas: [
        {
          pergunta: `Por que o ticket é tão baixo, ${R400}?`,
          resposta: "Porque é o valor que falta na semana. Ticket baixo limita a perda por cliente e deixa o limite crescer com o histórico.",
        },
        {
          pergunta: "Vão atender negativado?",
          resposta: "Sim, no nível Entrada, com limite inicial baixo. A análise olha a constância do recebimento pelo Open Finance, não só o bureau.",
        },
      ],
    },
  },

  /* 02 ---------------------------------------------------------------- */
  {
    id: "02",
    nome: "A prova",
    titulo: "A Zippi provou o mercado",
    subtitulo: "Público vizinho, mesmo caminho: originadora com instituição parceira, depois dívida e FIDC para a carteira.",
    blocos: [
      { titulo: "O começo", texto: caminhos.fatoDecisivo },
      { titulo: "A escala", texto: `${zippi.concedido.rotulo} concedidos. Cerca de ${zippi.autonomosApp.rotulo} autônomos no app. Fonte: Finsiders e App Store.` },
      { titulo: "O funding", texto: `FIDC de ${fidc24.valor.rotulo} em ${fidc24.ano}, ${fidc25.valor.rotulo} em ${fidc25.ano} e ${fidc26.valor.rotulo} em ${fidc26.ano}.` },
      { titulo: "A lição", texto: zippi.licao },
    ],
    visuais: ["V04", "V05", "V06"],
    legendas: {
      V04: "Zippi em cinza: referência de mercado, só como texto. Fontes: Dealroom, TI Inside, Finsiders, LatamList.",
      V05: "FIDC da Zippi por captação. Fontes: Finsiders e LatamList.",
      V06: "Valor estimado: estimativa do Dealroom (terceiros); a Zippi não divulga. Demais números: Finsiders e App Store.",
    },
    alts: {
      V04: `Linha do tempo da Zippi: ${zippi.timeline.map((t) => `${t.quando}, ${t.texto}`).join("; ")}.`,
      V05: `Três barras do FIDC da Zippi: ${zippi.fidc.map((f) => `${f.valor.rotulo} em ${f.ano}`).join("; ")}.`,
      V06: `Três cartões: ${zippi.concedido.rotulo} concedidos; ${valorZippi}; cerca de ${zippi.autonomosApp.rotulo} autônomos no app.`,
    },
    notas: {
      tempo: "1:30",
      fraseChave: `A Zippi já concedeu ${zippi.concedido.rotulo}. O mercado existe; a questão é como entrar.`,
      topicos: [
        "A Zippi nunca foi ESC: começou como Ltda originadora com instituição parceira.",
        `${zippi.timeline[0].quando}: ${zippi.timeline[0].texto}. Em ${zippi.timeline[1].quando}, crédito semanal via Pix.`,
        `2022: ${zippi.liberado2022.rotulo} liberados, ${zippi.crescimento2022.rotulo} o ano anterior, e debênture de ${zippi.debenture2022.rotulo}.`,
        `Abr/2024: ${zippi.acumuladoAbr2024.rotulo} acumulado. Depois, três FIDCs, até ${fidc26.valor.rotulo} em ${fidc26.ano}.`,
        `Lição: ${zippi.licao}`,
        `Valor: ${valorZippi}. A Zippi não divulga; é só ordem de grandeza.`,
        "Zippi sempre em cinza e só como texto: é referência, não parceira.",
      ],
      perguntas: [
        {
          pergunta: "Se a Zippi já está lá, onde a Vapti entra?",
          resposta: `${zippi.ondeNaoVale[2]} E a Zippi nasceu com venture capital; nós começamos com ${projeto.capitalInicial.rotulo} próprio.`,
        },
        {
          pergunta: `A Zippi vale ${zippi.valorEstimado.rotulo}?`,
          resposta: "A Zippi não divulga. É estimativa do Dealroom (terceiros), útil só como ordem de grandeza.",
        },
      ],
    },
  },

  /* 03 ---------------------------------------------------------------- */
  {
    id: "03",
    nome: "O produto",
    titulo: "Um limite que cresce com o cliente",
    subtitulo: "Limite rotativo, saque pelo celular e pagamento automático. Pagar em dia faz o limite crescer.",
    blocos: [
      {
        titulo: "Como funciona",
        texto: `Saque de ${projeto.saqueMin.rotulo} a ${projeto.saqueMax.rotulo}, liberado por Pix. Juros sobre o valor sacado, não sobre o limite.`,
      },
      {
        titulo: "Dois jeitos de pagar",
        texto: `${produto.parcelasSemanais.rotulo} parcelas semanais de ${preco.exemplo.parcela.rotulo}, a ${BASE}. Ou ${plano14.dias} parcelas diárias de ${plano14.parcela.rotulo}: ${plano14.juros.rotulo} de juros em ${R400} (${plano14.efetivaMes.rotulo} ao mês).`,
      },
      {
        titulo: "Pix Automático",
        texto: `O cliente autoriza uma vez. Se faltar saldo, até ${produto.pixRetentativas.rotulo} novas tentativas. Ele vê o valor ${produto.pixAvisoDias.rotulo} antes.`,
      },
      {
        titulo: "Parcela que cabe",
        texto: `A parcela não passa de ${produto.capacidadeMaxRenda.rotulo} da renda de um período fraco, nunca da média.`,
      },
    ],
    visuais: ["V07", "V08", "V09"],
    legendas: {
      V07: "Protótipo com dados fictícios. A instituição parceira aparece como credora.",
      V08: `Exemplo de ${R400}: ${BASE}.`,
      V09: `Pix Automático, do Banco Central, em operação desde ${produto.pixDesde}. Fonte: B3 Bora Investir.`,
    },
    alts: {
      V07: `Protótipo de celular: conversa com áudio e link; plataforma com barra de ${nEtapas} etapas (${produto.jornada7.join(", ")}); painel com limite, nível e próxima parcela. Dados fictícios.`,
      V08: `${R400} sacados viram ${produto.parcelasSemanais.rotulo} parcelas semanais de ${preco.exemplo.parcela.rotulo}: ${preco.exemplo.amortizacao.rotulo} do valor mais ${preco.exemplo.jurosParcela.rotulo} de juros. Taxa efetiva: ${preco.exemplo.efetivaMes.rotulo} ao mês. Alternativa: ${plano14.dias} parcelas diárias de ${plano14.parcela.rotulo}, ${plano14.juros.rotulo} de juros em ${R400}, ${plano14.efetivaMes.rotulo} ao mês.`,
      V09: `Pix Automático: autorização única e até ${produto.pixRetentativas.rotulo} novas tentativas se faltar saldo; a primeira e a segunda falham, a terceira passa.`,
    },
    notas: {
      tempo: "2:00",
      fraseChave: "O limite funciona como reserva de emergência, reposta com dias ou semanas de trabalho.",
      topicos: [
        "Mostrar o protótipo: conversa, link, barra de etapas até o Pix cair.",
        "A instituição parceira aparece como credora na proposta e no comprovante.",
        `Padrão: ${produto.parcelasSemanais.rotulo} parcelas semanais. Alternativa: plano diário de ${produto.planosDiarios.join(", ")} dias; recomendado ${produto.planoDiarioRecomendado}.`,
        `Limite volta quando o saldo zera. Nos níveis ${nPrata.nome} e ${nOuro.nome}, volta conforme o cliente paga.`,
        `Análise: Open Finance, ${produto.percentilPeriodoRuim.rotulo} dos últimos ${produto.janelaAnaliseDias.rotulo}. Bureau só no primeiro saque.`,
        `Travas: ${produto.travas.slice(0, 3).join(" ")}`,
        "Toda tela mostra o custo em reais e a taxa efetiva ao mês.",
      ],
      perguntas: [
        {
          pergunta: "E se o cliente cancelar o Pix Automático?",
          resposta: "Ele pode, até 23h59 da véspera. Tratamos como sinal de risco e gatilho de contato. O QR Pix fica como alternativa.",
        },
        {
          pergunta: "O que impede o cliente de se endividar em cadeia?",
          resposta: `As travas: ${minusc(produto.travas[0])} ${produto.travas[1]} ${produto.travas[3]}`,
        },
      ],
    },
  },

  /* 04 ---------------------------------------------------------------- */
  {
    id: "04",
    nome: "Gamificação",
    titulo: "Quem paga bem paga menos",
    subtitulo: "A taxa cai a cada nível. As regras ficam na tela, para todo cliente ver.",
    blocos: [
      {
        titulo: "Escada visível",
        texto: `${nEntrada.nome} → ${nBronze.nome} (${nBronze.ciclos} ciclos) → ${nPrata.nome} (${nPrata.ciclos}) → ${nOuro.nome} (${nOuro.ciclos}). A barra mostra quanto falta.`,
      },
      { titulo: `${nEntrada.nome}, a taxa mais alta`, texto: `${taxaCompleta(tEntrada)}.` },
      { titulo: `${nOuro.nome}, a mais baixa`, texto: `${taxaCompleta(tOuro)}. Mais a reserva de emergência pré-aprovada.` },
      {
        titulo: "O que acelera",
        texto: "Semanas em dia, ativar o Pix Automático e indicar quem paga em dia. Nenhuma dívida muda de dono.",
      },
    ],
    visuais: ["V10", "V11"],
    legendas: {
      V10: `Taxa sobre o valor sacado. Juros em reais de um saque de ${R400} em ${produto.parcelasSemanais.rotulo} semanas.`,
      V11: "Princípios do jogo justo: valem para todo cliente, em todo nível.",
    },
    alts: {
      V10: `Escada de ${niveis.length} níveis: ${niveis
        .map((nv) => `${nv.nome}, ${minusc(nv.comoChega)}, ${nv.taxaSemanal.rotulo} por semana, ${nv.efetivaMes.rotulo} ao mês, ${nv.jurosExemplo.rotulo} de juros em ${R400}, limite volta ${minusc(nv.limiteVolta)}`)
        .join("; ")}. ${nOuro.nome}: ${nOuro.extra}.`,
      V11: `Quatro princípios: ${gamificacao.principios.join(" ")}`,
    },
    notas: {
      tempo: "1:30",
      fraseChave: "Premiamos pagamento e organização, nunca volume de dívida.",
      topicos: [
        `Escada: ${niveis.map((nv) => `${nv.nome} ${nv.efetivaMes.rotulo} ao mês`).join(" · ")}.`,
        `Cenário-base das projeções: média de ${BASE}.`,
        `Sequência em dia com ${gamificacao.toleranciaPorTrimestre.rotulo} tolerância por trimestre.`,
        `Indicação: quem indica sobe mais rápido se os indicados pagarem em dia. Ninguém vê dados de ninguém.`,
        `Princípios: ${gamificacao.principios.join(" ")}`,
        gamificacao.zippiReferencia,
      ],
      perguntas: [
        {
          pergunta: "Baixar a taxa não derruba a margem?",
          resposta: `Por cliente, sim. Mas quem paga bem fica, e a projeção já usa a média de ${BASE}. Mesmo no ${nOuro.nome}, rendemos cerca de ${gamificacao.ouroAcimaZippi.rotulo} acima da Zippi.`,
        },
        {
          pergunta: "O cliente pode descer de nível?",
          resposta: "Atraso bloqueia novo saque, e sinal de dependência reduz o limite. A regra exata de descida ainda será definida. [A CONFIRMAR]",
        },
      ],
    },
  },

  /* 05 ---------------------------------------------------------------- */
  {
    id: "05",
    nome: "Estrutura",
    titulo: "Dentro da lei, sem teto",
    subtitulo: `A Vapti origina; uma instituição autorizada pelo Banco Central é a credora. Base: ${estrutura.normaCurta}, de ${estrutura.normaData}.`,
    blocos: [
      {
        titulo: `${nCaminhos} caminhos, um viável`,
        texto: `Empresa comum: juros limitados a ${caminhos.usuraAoAno.rotulo}. ESC: sem pessoa física, só a cidade, sem fundos. BaaS: nacional e sem teto.`,
      },
      { titulo: "Quem é quem", texto: "A parceira é a credora: emite a CCB e libera o Pix. A Vapti cuida do cliente, da análise e da cobrança." },
      { titulo: "O pagamento nunca cai na conta da Vapti", texto: "O cliente paga por Pix Automático na conta da parceira ou do fundo. Nunca na conta da Vapti." },
      { titulo: "De onde vem a receita", texto: "Dos juros das CCBs que a Vapti compra. A parceira aparece identificada no app, no contrato e no comprovante." },
    ],
    visuais: ["V12", "V13"],
    legendas: {
      V12: "Fontes: Migalhas (juros fora de instituição financeira) e Tributário nos Bastidores (LC 167/2019).",
      V13: `${estrutura.normaCurta} · ${estrutura.normaData}. Fontes: Demarest e Monitor Mercantil.`,
    },
    alts: {
      V12: `${nCaminhos} caminhos. ${caminhos.opcoes.map((o) => `${o.nome}: ${o.ok ? "viável" : "descartado"} — ${o.motivos.join("; ")}`).join(". ")}.`,
      V13: `Fluxo em ${nPassos} passos: ${estrutura.fluxo.map((p) => `${p.passo}. ${p.quem}: ${p.texto}`).join(" ")} Quem financia a carteira: ${estrutura.financiadores.map((f) => `fase ${f.fase}, ${minusc(f.quem)}`).join("; ")}.`,
    },
    notas: {
      tempo: "2:00",
      fraseChave: "Juros livres não vêm da ESC. Vêm de operar através de instituição autorizada.",
      topicos: [
        "Empresa comum: Lei de Usura, devolução em dobro e crime de usura. Inviável.",
        `ESC: só MEI e empresas, só a cidade, sem fundos, teto de ${caminhos.escTetoReceita.rotulo} por ano. Não escala nem recebe aporte.`,
        `BaaS: a Vapti é Ltda originadora, tomadora de serviço de uma instituição autorizada (${estrutura.normaCurta}).`,
        `Percorrer os ${nPassos} passos do fluxo. Destacar: o pagamento nunca entra na conta da Vapti.`,
        "Fase 1: a própria Vapti compra as CCBs. Fase 2: dívida estruturada. Fase 3: FIDC.",
        "A receita da Vapti vem dos juros das CCBs que compra, e da remuneração contratual com a parceira.",
        `Prazo até operar: ${estrutura.mesesAteOperarMin.rotulo} a ${estrutura.mesesAteOperarMax.rotulo} meses. Parceira a cotar: ${estrutura.parceiraCandidata} e outras.`,
      ],
      perguntas: [
        {
          pergunta: "Os juros se mantêm quando a CCB é cedida a uma Ltda?",
          resposta: "É a primeira pergunta ao advogado. Não afirmamos isso sem parecer, e nada é assinado antes dele.",
        },
        {
          pergunta: "E se a interpretação da regra mudar?",
          resposta: `É risco real: a regra é nova. Contratos anteriores têm até ${estrutura.prazoAdequacao} para se adequar. Mitigação: parecer jurídico antes de assinar.`,
        },
        {
          pergunta: "Por que não começar como ESC, que é mais simples?",
          resposta: "Porque não atende pessoa física, fica presa à cidade e não aceita fundos. Seria um laboratório que não escala.",
        },
      ],
    },
  },

  /* 06 ---------------------------------------------------------------- */
  {
    id: "06",
    nome: "Preço",
    titulo: "O dobro da referência, com transparência",
    subtitulo: `Cenário-base: ${BASE}. Custo em reais sempre na tela.`,
    blocos: [
      {
        titulo: "A conta",
        texto: `${R400} × ${preco.exemplo.taxa.rotulo} × ${produto.parcelasSemanais.rotulo} semanas = ${preco.exemplo.juros.rotulo} de juros. Efetiva: ${preco.exemplo.efetivaMes.rotulo} ao mês.`,
      },
      { titulo: "Sobre o sacado", texto: `Cobrar sobre o valor sacado rende ${preco.maisJurosSacadoVsSaldo.rotulo} mais juros do que cobrar sobre o saldo.` },
      {
        titulo: "Contra a referência",
        texto: `A Zippi cobra a partir de ${preco.zippiTaxaSemanal.rotulo} por semana sobre o valor usado, o que equivale a ${preco.zippiEfetivaMes.rotulo} ao mês. No cenário-base, a Vapti cobra cerca de ${preco.vezesZippiBase.rotulo} isso.`,
      },
      { titulo: "O limite do preço", texto: "O STJ revisa taxas muito acima do mercado. O dobro é defensável pelo risco do público; o triplo, não." },
    ],
    visuais: ["V14"],
    legendas: {
      V14: "Taxa efetiva ao mês. Zippi em cinza: referência estimada a partir do preço público (Startups.com.br).",
    },
    alts: {
      V14: `Conta do cenário-base: ${R400} vezes ${preco.exemplo.taxa.rotulo} vezes ${produto.parcelasSemanais.rotulo} semanas dá ${preco.exemplo.juros.rotulo}, ou ${preco.exemplo.efetivaMes.rotulo} ao mês. Barras de taxa efetiva ao mês: Zippi ${preco.zippiEfetivaMes.rotulo} em cinza; Vapti ${niveis.map((nv) => `${nv.nome} ${nv.efetivaMes.rotulo}`).join(", ")}.`,
    },
    notas: {
      tempo: "1:30",
      fraseChave: "Cobramos o dobro da referência e mostramos o custo em reais em toda tela.",
      topicos: [
        `Fazer a conta em voz alta: ${BASE}.`,
        `Sobre o sacado rende ${preco.maisJurosSacadoVsSaldo.rotulo} mais do que sobre o saldo.`,
        `Por nível: ${niveis.map((nv) => `${nv.nome} ${nv.efetivaMes.rotulo}`).join(" · ")} ao mês. Zippi, a partir de ${preco.zippiTaxaSemanal.rotulo} por semana: ${preco.zippiEfetivaMes.rotulo} ao mês.`,
        preco.cuidados[0],
        preco.cuidados[1],
        preco.cuidados[3],
      ],
      perguntas: [
        {
          pergunta: "Esse preço não espanta o bom pagador?",
          resposta: `Espantaria se fosse igual para todos. Por isso a taxa cai com o nível: no ${nOuro.nome}, ${taxaCompleta(tOuro)}.`,
        },
        {
          pergunta: "Um juiz pode revisar essa taxa?",
          resposta: "Pode, se ficar muito acima da média. Mitigação: taxa cai por nível, custo em reais na tela e perfil de risco documentado.",
        },
      ],
    },
  },

  /* 07 ---------------------------------------------------------------- */
  {
    id: "07",
    nome: "Números",
    titulo: "Quem decide é a perda",
    subtitulo: `Projeção da fase 1 com ${projeto.capitalInicial.rotulo}: a taxa importa, mas a perda manda.`,
    blocos: [
      {
        titulo: "Fase 1 · projeção",
        texto: `${fase1.capital.rotulo} de capital, ${fase1.carteira.rotulo} na rua, ${fase1.sacadoMes.rotulo} sacados por mês. Receita de ${fase1.receitaAno.rotulo} por ano.`,
      },
      {
        titulo: "Margem por mês · projeção",
        texto: `Com perda de ${premissas.perdaBase.rotulo}, ${fase1.margemMes.rotulo}. Com ${premissas.perdaEstresse.rotulo}, ${fase1.margemMes12.rotulo}. A diferença: ${fase1.quedaMargem8a12.rotulo} por mês.`,
      },
      {
        titulo: "Equilíbrio · projeção",
        texto: `A ${BASE}, a margem da fase 1 zera com perda de ${fase1.perdaEquilibrio.rotulo}.`,
      },
      { titulo: "Antes de quê", texto: "Margem antes de equipe, tecnologia e impostos. As premissas ficam a um clique." },
    ],
    visuais: ["V15", "V16", "V17"],
    legendas: {
      V15: `Projeção. Fase 1 a ${BASE}; perda de ${premissas.perdaBase.rotulo}.`,
      V16: `Projeção. Margem mensal da fase 1 conforme a perda sobe; zera em ${fase1.perdaEquilibrio.rotulo}.`,
      V17: `Projeção. Margem por mês com perda de ${premissas.perdaBase.rotulo}, a ${BASE}.`,
    },
    alts: {
      V15: `Projeção da fase 1: capital de ${fase1.capital.rotulo}, ${fase1.carteira.rotulo} na rua, ${fase1.sacadoMes.rotulo} sacados por mês, receita de ${fase1.receitaMes.rotulo} por mês (${fase1.receitaAno.rotulo} por ano), menos perda de ${fase1.perdaMes.rotulo} e custos de ${fase1.custoMes.rotulo}, igual a margem de ${fase1.margemMes.rotulo} por mês.`,
      V16: `Projeção: curva da margem mensal da fase 1 contra a perda sobre o sacado. Com perda de ${premissas.perdaBase.rotulo}, ${fase1.margemMes.rotulo}; com ${premissas.perdaEstresse.rotulo}, ${fase1.margemMes12.rotulo}; a curva cruza o zero em ${fase1.perdaEquilibrio.rotulo}.`,
      V17: `Projeção das três fases, perda de ${premissas.perdaBase.rotulo}: carteira de ${f1.carteira.rotulo}, ${f2.carteira.rotulo} e ${f3.carteira.rotulo}; margem por mês de ${f1.margem8.rotulo}, ${f2.margem8.rotulo} e ${f3.margem8.rotulo}.`,
    },
    notas: {
      tempo: "2:30",
      fraseChave: `Quem decide é a perda. Na projeção, acima de ${fase1.perdaEquilibrio.rotulo}, a margem da fase 1 some.`,
      topicos: [
        "Selo “Projeção” em tudo. Abrir o popover de premissas uma vez.",
        `Fase 1, projeção: ${fase1.sacadoMes.rotulo} sacados por mês, ${fase1.saquesMes.rotulo} saques e ${fase1.clientesComSaldo.rotulo} clientes com saldo.`,
        `Margem de ${fase1.margemMes.rotulo} com perda de ${premissas.perdaBase.rotulo}; ${fase1.margemMes12.rotulo} com ${premissas.perdaEstresse.rotulo}.`,
        "Mexer no simulador: subir a perda e mostrar a margem cair até zero.",
        `Equilíbrio por taxa: ${equilibrioPorTaxa.map((e, i) => `${taxaCompleta(preco.tabela[i])} → perda de equilíbrio de ${e.perda.rotulo}`).join(" · ")}.`,
        `Fases, projeção: carteira ${f1.carteira.rotulo} → ${f2.carteira.rotulo} → ${f3.carteira.rotulo}; margem ${f1.margem8.rotulo} → ${f2.margem8.rotulo} → ${f3.margem8.rotulo} por mês.`,
        `Custo por saque: ${premissas.custoPorSaque.rotulo} (${premissas.custoOperacao.rotulo} de operação + ${premissas.custoParceira.rotulo} da parceira, estimativa). Funding sênior a ${premissas.fundingMes.rotulo}.`,
      ],
      perguntas: [
        {
          pergunta: "Que perda vocês esperam?",
          resposta: `Ainda não sabemos, e não vamos chutar. O piloto mede. Critério de parada: ${minusc(piloto.parada[0])}.`,
        },
        {
          pergunta: `${fase1.margemMes.rotulo} por mês é lucro?`,
          resposta: "Não. É margem antes de equipe, tecnologia e impostos, numa projeção com premissas declaradas.",
        },
      ],
    },
  },

  /* 08 ---------------------------------------------------------------- */
  {
    id: "08",
    nome: "Eficiência",
    titulo: "Cada centavo desenhado",
    subtitulo: "Bureau, mensagem e cobrança desenhados para baixar o custo de cada saque.",
    blocos: [
      {
        titulo: "Bureau em camadas",
        texto: `Cadastro público, antifraude, Open Finance e só então bureau. Por aprovado: de ${eficiencia.custoAprovadoSemFunil.rotulo} para ${eficiencia.custoAprovadoComFunil.rotulo} (estimativa).`,
      },
      {
        titulo: "Quem volta sai barato",
        texto: `Recontratar dispensa bureau. Na carteira madura, ${eficiencia.bureauMaduroMin.rotulo} a ${eficiencia.bureauMaduroMax.rotulo} por saque (estimativa).`,
      },
      {
        titulo: "Mensagem enxuta",
        texto: `De ${eficiencia.msgsAntes.rotulo} mensagens cobradas (${eficiencia.custoMsgAntes.rotulo}) para ${eficiencia.msgsDepoisFaixa} (cerca de ${eficiencia.custoMsgDepois.rotulo}) por saque, na API oficial.`,
      },
      { titulo: "Como medimos", texto: "Safra mensal, roll rate, perda esperada, recontratação e custo por saque. Padrão de banco desde o primeiro dia." },
    ],
    visuais: ["V18"],
    legendas: {
      V18: "Estimativas. Fontes: Serasa Experian (preço de balcão) e Nosso Meio (cobrança na API do WhatsApp).",
    },
    alts: {
      V18: `WhatsApp: de ${eficiencia.msgsAntes.rotulo} mensagens (${eficiencia.custoMsgAntes.rotulo}) para ${eficiencia.msgsDepoisFaixa} (cerca de ${eficiencia.custoMsgDepois.rotulo}) por saque. Bureau: ${eficiencia.serasaBalcaoMin.rotulo} no balcão, ${eficiencia.custoAprovadoComFunil.rotulo} por aprovado com o funil, ${eficiencia.bureauMaduroMin.rotulo} a ${eficiencia.bureauMaduroMax.rotulo} por saque na carteira madura.`,
    },
    notas: {
      tempo: "1:00",
      fraseChave: "O motor barato de originação é o que vale múltiplo lá na frente.",
      topicos: [
        `Bureau: balcão a partir de ${eficiencia.serasaBalcaoMin.rotulo}; por API, ${eficiencia.apiMin.rotulo} a ${eficiencia.apiMax.rotulo}. Funil em camadas corta pela metade.`,
        `WhatsApp: desde 01/10/2026 a Meta cobra também respostas, ${eficiencia.whatsMsg.rotulo} por mensagem. Jornada redesenhada.`,
        `Fornecedores oficiais a cotar: ${eficiencia.fornecedoresWhats.join(", ")}. Verificação na Meta: ${eficiencia.verificacaoMetaSemanas}.`,
        "Pix Automático: grátis para quem paga; o custo de quem recebe depende da instituição.",
        "Painel “Como medimos”: safra, roll rate, PD × LGD × EAD, recontratação, custo por saque.",
      ],
      perguntas: [
        {
          pergunta: "E se a Meta mudar o preço de novo?",
          resposta: "Já mudou uma vez. A plataforma própria carrega a jornada; o WhatsApp fica só nas pontas.",
        },
        {
          pergunta: "Pode usar IA no atendimento?",
          resposta: eficiencia.iaPermitida,
        },
      ],
    },
  },

  /* 09 ---------------------------------------------------------------- */
  {
    id: "09",
    nome: "Vantagens e riscos",
    titulo: "O que ganhamos e o que pode dar errado",
    subtitulo: `${vantagens.length} vantagens e ${riscos.length} riscos, cada risco com sua mitigação. Mesmo peso para os dois lados.`,
    blocos: [
      { titulo: "Ganhamos alcance", texto: `${vantagens[0]} ${vantagens[1]}` },
      { titulo: "Ganhamos um ativo", texto: `${vantagens[6]} ${vantagens[3]}` },
      { titulo: "Pode dar errado: a perda", texto: `${riscos[0].risco}. Mitigação: ${minusc(riscos[0].mitigacao)}.` },
      { titulo: "Pode dar errado: a parceira", texto: `${riscos[1].risco}. Mitigação: ${minusc(riscos[1].mitigacao)}.` },
    ],
    visuais: ["V19"],
    legendas: {
      V19: "Vantagens e riscos lado a lado, com o mesmo peso. Cada risco tem sua mitigação.",
    },
    alts: {
      V19: `Duas colunas de mesmo tamanho. Vantagens: ${vantagens.join(" ")} Riscos e mitigação: ${riscos.map((r) => `${r.risco} — ${r.mitigacao}`).join(". ")}.`,
    },
    notas: {
      tempo: "1:30",
      fraseChave: "Honestidade é parte da tese: cada risco já tem mitigação.",
      topicos: [
        "Ler as vantagens sem pressa, uma por linha.",
        `Maior risco: ${minusc(riscos[0].risco)}.`,
        `${riscos[4].risco}. Mitigação: ${minusc(riscos[4].mitigacao)}.`,
        `${riscos[6].risco}. Mitigação: ${minusc(riscos[6].mitigacao)}.`,
        `${riscos[3].risco}. Mitigação: ${minusc(riscos[3].mitigacao)}.`,
        `${riscos[9].risco}. Mitigação: ${minusc(riscos[9].mitigacao)}.`,
      ],
      perguntas: [
        {
          pergunta: "Qual risco tira o sono?",
          resposta: `A perda. Acima de ${fase1.perdaEquilibrio.rotulo}, a margem da fase 1 zera. Por isso o piloto tem critério de parada definido antes.`,
        },
        {
          pergunta: "E se a parceira encerrar o contrato?",
          resposta: riscos[1].mitigacao + ".",
        },
      ],
    },
  },

  /* 10 ---------------------------------------------------------------- */
  {
    id: "10",
    nome: "Crescimento",
    titulo: "Três anos até o primeiro fundo",
    subtitulo: "Projeção: o ano 1 gera histórico, o ano 2 traz dívida e o ano 3, o FIDC.",
    blocos: [
      { titulo: "Ano 1 · projeção: gerar histórico", texto: `${regua[1].vapti}. Capital externo: ${minusc(regua[1].capital)}.` },
      { titulo: "Anos 2 e 3 · projeção", texto: `${regua[2].capital}. Depois, ${regua[3].capital}.` },
      { titulo: "O que a gestora olha", texto: `${captacao.gestoraOlha[0]}, ${minusc(captacao.gestoraOlha[1])} e ${minusc(captacao.gestoraOlha[2].split(" (")[0])}.` },
      { titulo: "O que se vende", texto: `${captacao.oQueSeVende.motor} Janela: ${minusc(captacao.janela.anos)}.` },
    ],
    visuais: ["V20", "V21"],
    legendas: {
      V20: `Projeção. Vapti em verde: hipóteses de ordem de grandeza. Zippi em cinza: fatos (Dealroom, Exame, Finsiders, LatamList).`,
      V21: `${captacao.oQueSeVende.carteira} Janela de venda: ${minusc(captacao.janela.anos)}.`,
    },
    alts: {
      V20: `Projeção em duas trilhas por ano. Zippi, fatos: ${regua.map((r) => r.zippi).join("; ")}. Vapti, hipóteses: ${regua.map((r) => `ano ${r.ano}, ${r.vapti}, capital: ${r.capital}`).join("; ")}.`,
      V21: `Dois blocos. Carteira: ${captacao.oQueSeVende.carteira} Motor de originação: ${captacao.oQueSeVende.motor} Janela de venda: ${minusc(captacao.janela.anos)}, com ${captacao.janela.condicoes.map(minusc).join(", ")}.`,
    },
    notas: {
      tempo: "2:00",
      fraseChave: "Equity financia a empresa; dívida financia a carteira. O ano 1 é para gerar histórico.",
      topicos: [
        "Projeção: a coluna da Vapti são hipóteses de ordem de grandeza.",
        `Trilha Zippi: lançou em 2021, primeiro FIDC em 2024. Trilha Vapti, projeção: FIDC no ano 3.`,
        `Gestora de FIDC olha: ${captacao.gestoraOlha.map(minusc).join("; ")}.`,
        `Valuation: ${captacao.valuation.map((v) => `${v.multiplo} ${artigoBase[v.base] ?? v.base} (${minusc(v.quando)})`).join("; ")}.`,
        captacao.alertaMultiplo,
        `Janela de venda: ${minusc(captacao.janela.anos)}, com ${captacao.janela.condicoes.map(minusc).join(", ")}. ${captacao.janela.nota}`,
        captacao.novaCarteira,
      ],
      perguntas: [
        {
          pergunta: "Quanto a Vapti pode valer na saída?",
          resposta: `Depende do lucro e do crescimento: de ${captacao.valuation[1].multiplo} o lucro, se pequena e lucrativa. Crédito para autônomo não tem múltiplo de software. Referência: Zippi, ${valorZippi}.`,
        },
        {
          pergunta: "Por que não captar já?",
          resposta: `Sem ${minusc(captacao.gestoraOlha[0])}, ninguém compra a carteira. Por isso o ano 1 usa só o capital próprio.`,
        },
      ],
    },
  },

  /* 11 ---------------------------------------------------------------- */
  {
    id: "11",
    nome: "Piloto",
    titulo: `${piloto.dias.rotulo} para medir antes de crescer`,
    subtitulo: `${piloto.segmento}, ${piloto.praca}, até ${piloto.carteiraMax.rotulo} de carteira.`,
    blocos: [
      { titulo: "Metas", texto: `${piloto.metas[0]}. ${piloto.metas[1]}. ${piloto.metas[3]}.` },
      { titulo: "Critérios de parada", texto: `Definidos antes: ${minusc(piloto.parada[0])}; ${minusc(piloto.parada[1])}; ${minusc(piloto.parada[3])}.` },
      { titulo: "Para escalar", texto: `${piloto.escala.join(", ")}. ${piloto.escalaNota}` },
      { titulo: "Por que assim", texto: "O piloto transforma a maior dúvida, a perda, em dado medido antes de colocar mais capital." },
    ],
    visuais: ["V22"],
    legendas: {
      V22: "Semáforo: verde é meta, vermelho é parada. Critérios definidos antes de começar.",
    },
    alts: {
      V22: `Semáforo do piloto de ${piloto.dias.rotulo}. Metas: ${piloto.metas.join("; ")}. Critérios de parada: ${piloto.parada.join("; ")}. Para escalar, os três juntos: ${piloto.escala.join("; ")}.`,
    },
    notas: {
      tempo: "1:00",
      fraseChave: "Paramos se der errado, e os critérios estão escritos antes de começar.",
      topicos: [
        `Escopo: ${minusc(piloto.segmento)}, ${piloto.praca}, até ${piloto.carteiraMax.rotulo}.`,
        `Metas operacionais: ${minusc(piloto.metas[4])}; ${minusc(piloto.metas[5])}; ${minusc(piloto.metas[6])}.`,
        `Custo: ${minusc(piloto.metas[2])}.`,
        `Parada inclui: ${minusc(piloto.parada[2])}.`,
        `Escala: ${piloto.escalaNota}`,
      ],
      perguntas: [
        {
          pergunta: `Por que só ${piloto.carteiraMax.rotulo} no piloto?`,
          resposta: "Para errar barato. O resto do capital espera os dados de atraso, recontratação e custo.",
        },
      ],
    },
  },

  /* 12 ---------------------------------------------------------------- */
  {
    id: "12",
    nome: "Decisões",
    titulo: "Cinco decisões para começar",
    subtitulo: `${nDecisoes} decisões hoje. Depois, advogado, contador e cotações correm em paralelo.`,
    blocos: [
      { titulo: "Para o advogado", texto: "Tomadora com cessão; juros mantidos após a cessão a uma Ltda; o nome; multa e mora; roteiros de cobrança." },
      { titulo: "Para o contador", texto: "Lucro presumido ou real; tributação dos juros de CCB adquirida; o IOF recolhido pela parceira no custo." },
      { titulo: "Para a parceira", texto: `${decisoes.pendenciasProduto[0]} ${decisoes.pendenciasProduto[1]}` },
      {
        titulo: "Próximas 4 semanas",
        texto: `Iniciar contratos e verificação na Meta (${eficiencia.verificacaoMetaSemanas}). Cotar parceiras e fornecedores. Cronograma: ${decisoes.proximas4Semanas}.`,
      },
    ],
    visuais: ["V23"],
    legendas: {
      V23: `As ${nDecisoes} decisões pedidas hoje.`,
    },
    alts: {
      V23: `${nDecisoes} decisões: ${decisoes.lista.map((d, i) => `${i + 1}. ${d.texto}`).join(" ")}`,
    },
    notas: {
      tempo: "1:00",
      fraseChave: `Com estas ${nDecisoes} decisões, começamos já os contratos e as cotações.`,
      topicos: [
        ...decisoes.lista.map((d, i) => `${i + 1}. ${d.texto}`),
        `Prazo até operar: ${estrutura.mesesAteOperarMin.rotulo} a ${estrutura.mesesAteOperarMax.rotulo} meses. Por isso começar já.`,
      ],
      perguntas: [
        {
          pergunta: "Precisa integralizar tudo de uma vez?",
          resposta: "O plano prevê o aporte de uma vez. O calendário de integralização é uma das decisões de hoje.",
        },
        {
          pergunta: "Quando começa a operar?",
          resposta: `Em ${estrutura.mesesAteOperarMin.rotulo} a ${estrutura.mesesAteOperarMax.rotulo} meses: escolher parceira, contrato e integração. O cronograma semanal ainda será fechado. [A CONFIRMAR]`,
        },
      ],
    },
  },

  /* 13 ---------------------------------------------------------------- */
  {
    id: "13",
    nome: "Fontes e aviso",
    titulo: "Cada número tem origem declarada",
    subtitulo: `${fontes.length} fontes públicas, consultadas em outubro de 2026.`,
    blocos: [
      { titulo: "Aviso", texto: aviso },
      { titulo: "Como ler", texto: "Fato tem fonte. Projeção tem selo e premissas. Estimativa de terceiros vem identificada." },
    ],
    visuais: ["V24"],
    legendas: { V24: avisoCurto },
    alts: { V24: `Marca ${config.marca} com a pergunta “Vamos?” e o aviso: ${avisoCurto}` },
    notas: {
      tempo: "—",
      fraseChave: "Vamos?",
      topicos: [
        "Deixar esta tela aberta durante as perguntas.",
        "Lembrar que o PDF e o resumo de uma página ficam com os sócios.",
        "Reforçar: projeções são hipóteses com premissas declaradas.",
      ],
    },
  },
];
