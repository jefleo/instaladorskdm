# Vapti — Prompt-mestre para o Claude Code

Versão 1.0 · 15/10/2026

## Para você (esta parte não precisa ir para o Claude Code)

**O que isto faz.** Transforma o Claude Code num time de 9 subagentes que monta a apresentação da Vapti para amanhã: um site-apresentação interativo que abre offline com duplo clique, um PDF para deixar com o cliente, um resumo de uma página e, se sobrar tempo, o kit de visuais para a IA que vai editar seu vídeo.

**Como usar**
1. Crie uma pasta vazia no computador, por exemplo `vapti-apresentacao`, e dentro dela uma pasta `docs`.
2. Salve este arquivo como `docs/BRIEFING.md` e o roteiro do vídeo como `docs/ROTEIRO_VIDEO.md`. Se a Vapti já tiver logo ou cores, coloque os arquivos em `assets/marca/`.
3. Abra o Claude Code nessa pasta. (Na versão web do Claude Code, que trabalha com repositórios do GitHub, crie antes um repositório vazio com esses arquivos e abra ele.)
4. Instale as skills oficiais, uma vez só, digitando dentro do Claude Code:

```
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
/plugin install document-skills@anthropic-agent-skills
```

   Opcional, só se quiser animações prontas para o vídeo: no terminal, `npx skills add remotion-dev/skills`.

5. Digite: **Leia docs/BRIEFING.md e execute o prompt a partir de "INÍCIO DO PROMPT".**
   Sem como salvar arquivos? Copie tudo de "INÍCIO DO PROMPT" até "FIM DO PROMPT" e cole direto.
6. Ele mostra o plano e faz até 3 perguntas (marca, formato da reunião, como o cliente aparece na capa). Responda e deixe rodar. Conte de 1 a 3 horas.

**Bom saber**
- Nove agentes consomem bastante cota. Cada fase termina com um commit, então se o limite acabar no meio, é só pedir para ele continuar de onde parou.
- Ele não publica nada na internet nem cria contas sem perguntar.
- Antes da reunião, abra o arquivo `entregas/COMO-APRESENTAR.md` que ele vai gerar e ensaie uma vez com o modo apresentação.

---

▼▼▼ INÍCIO DO PROMPT ▼▼▼

# Missão

Você é o orquestrador — coordenador técnico e editorial — de um time de subagentes. Sua missão é produzir, até amanhã, a apresentação do projeto Vapti para o cliente que vai aportar o capital inicial.

A apresentação precisa impressionar, com visual de fintech de primeira linha. E precisa, acima de tudo, estar certa: cada número sai da seção 4 deste briefing, que é a fonte da verdade.

- **Quem assiste:** o cliente, empresário que vai aportar R$ 1 milhão com seus sócios. Ele decide amanhã se o projeto segue.
- **O que ele precisa entender:** o modelo, as vantagens e as desvantagens, a gamificação, os números e o caminho de crescimento até receber aportes externos e vender a operação.
- **Quem apresenta:** [NOME DO APRESENTADOR], coordenador do projeto.

# 1. Regras inegociáveis

1. **Fonte da verdade é a seção 4.** Não invente número, data, nome, fonte ou citação. Faltou algo, escreva `[A CONFIRMAR]` e liste no relatório final.
2. **Todo número projetado leva o selo "Projeção"**, com as premissas acessíveis a um clique (nota ou tooltip). Nada de "retorno garantido".
3. **Toda taxa semanal aparece com a taxa efetiva mensal e o custo em reais** de um exemplo de R$ 400.
4. **Nada da seção 4.15 aparece em lugar nenhum:** texto, nota, comentário de código, nome de variável, metadado.
5. **Português do Brasil**, frases curtas, um número por frase sempre que possível, formato brasileiro (R$ 1,47 mi; 37,5%).
6. **Funciona offline:** nenhuma CDN, fontes e bibliotecas empacotadas, abre com duplo clique.
7. **Não faça deploy, não crie contas, não envie nada** e não instale nada fora do projeto sem me perguntar.
8. **Git:** um commit ao fim de cada fase, com mensagem em português.
9. **Nada é "pronto" sem a verificação da fase** (seção 10).
10. **Desvantagens e riscos têm o mesmo peso visual das vantagens.** Honestidade é parte da tese.

# 2. Formato decidido, e por quê

**Site-apresentação em um único arquivo HTML, que funciona offline**, com:
- **Modo apresentação:** tela cheia, uma seção por vez; setas, espaço ou passador de slides avançam; `N` abre as notas do apresentador; `F` tela cheia; `G` grade de todas as seções; `Esc` sai.
- **Modo leitura:** rolagem contínua, para mandar ao cliente depois.
- **Simulador ao vivo:** o cliente mexe em capital, taxa e perda e vê a margem mudar.
- **Protótipo de celular clicável:** a jornada do cliente final e os níveis de gamificação.
- **Exportações:** PDF 16:9 (para deixar com o cliente) e resumo de uma página em PDF A4.

**Por que este formato.** Um deck estático não mostra o produto. Uma landing page fala com o cliente final, não com quem vai investir. O site-apresentação faz as duas coisas: conta a tese com o controle de um deck e prova o produto como um app. O PDF é o plano B se o computador falhar.

# 3. Entregáveis e prioridades

**P0 — obrigatório para amanhã**
- `entregas/vapti-apresentacao.html` — arquivo único, offline.
- `entregas/vapti-apresentacao.pdf` — 16:9, uma seção por página, modo claro.
- `entregas/vapti-resumo.pdf` — A4, uma página.
- `entregas/COMO-APRESENTAR.md` — ordem, tempo por seção, frase-chave de cada seção, atalhos, checklist de 5 minutos antes da reunião, plano B.

**P1**
- `entregas/qa/` — capturas em 1920×1080, 1440×900, 1280×720 e 390×844, mais `qa.md`.
- `entregas/RELATORIO.md` — o que foi feito, pendências `[A CONFIRMAR]`, decisões tomadas sem me consultar.

**P2 — se sobrar tempo**
- `entregas/kit-video/` — visuais para a IA editora do vídeo (seção 8, agente `kit-video`).

**P3** — deploy, só se eu pedir.

# 4. CONTEXTO — FONTE DA VERDADE

## 4.1 O projeto
- **Nome:** Vapti — nome de trabalho; antes se chamou Eleve Crédito e Vapti Crédito. Use só "Vapti": as regras de BaaS desaconselham nome que lembre instituição financeira (evitar "banco", "financeira" e, por precaução, "crédito" no nome).
- **O que é:** capital de giro de ciclo curto para autônomos e microempreendedores — motoristas de aplicativo, barbeiros, prestadores de serviço. Pessoa física e MEI, negativados incluídos, atuação nacional.
- **Promessa:** ter sempre a quem recorrer quando falta aquele valor. Um limite que cresce com o relacionamento e funciona como reserva de emergência, reposta com dias ou semanas de trabalho.
- **Valores:** saques de R$ 100 a R$ 1.000; ticket médio de R$ 350 a R$ 450 (as projeções usam R$ 400); R$ 1.000 é teto e raro.
- **Canais:** mensagem (API oficial do WhatsApp) e plataforma web própria; Pix para liberar e para receber.
- **Capital inicial:** R$ 1 milhão, do cliente e seus sócios, aportado de uma vez.
- **Praça de partida sugerida:** Grande Natal (RN), sede. Atuação nacional desde o início.
- **Mercado:** mais de 24 milhões de trabalhadores autônomos no Brasil (IBGE, citado por Startups.com.br).

## 4.2 Estrutura decidida em 15/10/2026: sem ESC, modelo BaaS
- A Vapti é uma **Ltda originadora** que atua como **tomadora de BaaS de crédito** (Resolução Conjunta CMN/BCB nº 16, de 28/11/2025; contratos anteriores têm até 31/12/2026 para se adequar).
- Uma **instituição autorizada pelo Banco Central** — a parceira — é a credora: emite a CCB em nome próprio e libera o Pix.

**Como o contrato e o dinheiro circulam**
1. O cliente pede o saque pela mensagem ou pela plataforma da Vapti. A Vapti faz cadastro, Open Finance e decisão de crédito com o motor dela.
2. A parceira formaliza: emite a CCB e libera o Pix da conta dela.
3. No mesmo dia, a CCB é cedida a quem financia a carteira — a própria Vapti na fase 1; um veículo com dívida estruturada na fase 2; um FIDC na fase 3 —, que paga o valor à parceira.
4. O cliente paga por Pix Automático na conta da parceira ou do fundo. **Nunca na conta da Vapti.**
5. A Vapti faz a régua de cobrança e o atendimento.

**Regras da Resolução Conjunta 16/2025 que moldam o modelo**
- A parceira é a credora, responde ao cliente e aparece identificada no app, no contrato e nos comprovantes.
- A tomadora não cobra tarifa nem remuneração em nome próprio pelos produtos da parceira. **A receita da Vapti vem dos juros das CCBs que ela compra** (e da remuneração contratual com a parceira), nunca de uma "taxa Vapti".
- A tomadora não recebe pagamentos em conta própria.
- A tomadora não pode ser correspondente da mesma parceira, nem subcontratar o serviço.
- Prevenção à lavagem de dinheiro e conhecimento do cliente são responsabilidade da parceira; a Vapti faz tarefas acessórias.

**Parceiras e prazo**
- A cotar: QI Tech (Lending as a Service: onboarding, antifraude, motor de crédito, emissão de CCB, assinatura, cessão a fundo, administração e custódia de FIDC) e outras a levantar.
- Custo estimado por saque cobrado pela parceira: R$ 5, até haver cotação.
- Tempo até operar: 2 a 4 meses (escolher parceira, contrato, integração).

## 4.3 Caminhos descartados — para explicar, não para vender
- **Emprestar direto como empresa comum:** inviável. Para quem não é instituição financeira valem a Lei de Usura (juros de 12% ao ano), a nulidade do excesso com devolução em dobro (MP 2.172-32/2001), o crime de usura (Lei 1.521/51) e o crime de operar como instituição financeira sem autorização (Lei 7.492/86).
- **ESC — Empresa Simples de Crédito (LC 167/2019):** só atende MEI, microempresa e empresa de pequeno porte, nunca pessoa física; só no município-sede e nos vizinhos; carteira limitada ao capital integralizado, sem alavancagem; só recursos próprios, sem fundos; só juros remuneratórios, qualquer tarifa é vedada e a multa provavelmente também; teto de receita de R$ 4,8 milhões por ano; cada pessoa só pode ser sócia de uma ESC. Serviria de laboratório, mas não escala nem recebe aporte.
- **Fato decisivo:** a Zippi nunca foi ESC. Começou como originadora (Ltda) apoiada em instituição parceira, emprestando para pessoa física no Brasil inteiro.
- **Correção importante:** juros livres não vêm da ESC. Vêm de operar através de instituição autorizada, porque a Lei de Usura não se aplica a instituições financeiras.

## 4.4 Produto
- **Limite rotativo.** Cada saque cobra juros sobre o valor sacado.
- **Pagamento padrão:** 4 parcelas semanais de 25% do valor sacado, mais os juros. **Alternativa:** plano diário de 7, 14 ou 20 dias — o recomendado é 14.
- **Recomposição do limite:** volta quando o saldo zera (padrão). Nos níveis Prata e Ouro, volta conforme o cliente paga.
- **Cobrança por Pix Automático** (Banco Central, em operação desde junho de 2025): o cliente autoriza uma vez; até 3 novas tentativas se faltar saldo; o cliente vê o valor 10 dias antes e pode cancelar a autorização até 23h59 da véspera. Cancelamento é tratado como sinal de risco e gatilho de contato. QR Pix como alternativa.
- **Análise:** Open Finance, com consentimento, para medir a constância do recebimento. Regra de capacidade: a parcela não passa de 15% da renda de um período ruim típico, nunca da média. No plano semanal, o período ruim é o percentil 20 das semanas dos últimos 90 dias; no plano diário, o percentil 20 dos dias. Bureau só no primeiro saque.
- **Travas:** um saque ativo por vez no padrão; nada de sacar para pagar saque; cliente em atraso não saca; saques repetidos em intervalo curto reduzem o limite e disparam uma oferta de reparcelamento.

## 4.5 Preço
Base: R$ 400 sacados, pagos em 4 parcelas semanais de 25%.

| Taxa semanal | Juros sobre o sacado | Parcela semanal | Efetiva ao mês (sobre o sacado) | Efetiva ao mês se fosse sobre o saldo |
| --- | --- | --- | --- | --- |
| 4,0% | R$ 64 | R$ 116 | 29,5% | 18,3% |
| 4,5% | R$ 72 | R$ 118 | 33,5% | 20,8% |
| 5,0% | R$ 80 | R$ 120 | 37,5% | 23,3% |
| 6,0% | R$ 96 | R$ 124 | 45,8% | 28,4% |

- **Zippi, a referência:** a partir de 4% por semana sobre o valor usado, pago na semana seguinte. Equivale a **18,3% ao mês**.
- Cobrar sobre o sacado rende **60% mais juros** do que sobre o saldo. A 5% por semana, a Vapti fica em cerca de **2 vezes a Zippi**.

**Plano diário** (equivalente a 5% por semana sobre o sacado, dias corridos):

| Prazo | Juros | Parcela por dia | Efetiva ao mês |
| --- | --- | --- | --- |
| 7 dias | R$ 20,00 | R$ 60,00 | 44,5% |
| 14 dias | R$ 40,00 | R$ 31,43 | 47,2% |
| 20 dias | R$ 57,14 | R$ 22,86 | 47,6% |

**Cuidados de preço — entram na apresentação com honestidade**
1. Custo total em reais e taxa efetiva mensal sempre visíveis: é exigência legal e é proteção.
2. Juros livres não são juros sem teto: o STJ revisa taxas muito acima da média de mercado. Cobrar o dobro da referência é defensável pelo risco do público negativado; o triplo, não.
3. Seleção adversa: se for caro para todos, quem tem opção vai embora.
4. Por isso a taxa cai com o nível (4.6).

## 4.6 Gamificação — visível, com regra clara

| Nível | Como chega | Taxa semanal sobre o sacado | Efetiva ao mês | Limite volta |
| --- | --- | --- | --- | --- |
| Entrada | Primeiro saque, negativado incluso | 6,0% | 45,8% | Ao zerar |
| Bronze | 2 ciclos quitados sem atraso | 5,0% | 37,5% | Ao zerar |
| Prata | 5 ciclos sem atraso | 4,5% | 33,5% | Conforme paga |
| Ouro | 10 ciclos sem atraso | 4,0% | 29,5% | Conforme paga |

- Taxa média esperada da carteira madura: cerca de 5% por semana (é o cenário-base das projeções).
- Mesmo no Ouro, a Vapti rende cerca de 60% acima da Zippi (29,5% contra 18,3% ao mês).

**Mecânicas**
1. Escada de níveis com barra de progresso ("faltam 2 ciclos para Prata").
2. Barra de progresso de 7 etapas na contratação, até o Pix cair.
3. Sequência de semanas em dia, com 1 tolerância por trimestre (um dia de atraso sem perder a sequência).
4. Ativar o Pix Automático acelera o progresso de nível. A própria Zippi mantém uma frente de gamificação de pagamentos e débito automático, segundo vaga publicada por ela.
5. Indicação: quem indica sobe mais rápido se os indicados pagarem em dia. Nenhuma dívida muda de dono; ninguém vê dados de ninguém.
6. Reserva de emergência no Ouro: valor pré-aprovado, liberado em segundos.
7. Linha do tempo do crédito do cliente: limite inicial, limite atual, semanas em dia.

**Princípios do jogo justo** — vão para o slide como diferencial
- Premiar pagamento e organização, nunca volume de dívida.
- Regras sempre visíveis.
- Nada aleatório: sem sorteio, sem caixa-surpresa.
- Sinal de dependência reduz limite em vez de vender mais.

## 4.7 Atraso, multa e mora
- **Viáveis no modelo BaaS:** multa de até 2% da parcela (CDC, art. 52, §1º) e juros de mora de até 1% ao mês (Súmula 379 do STJ), sem acumular com comissão de permanência (Súmula 472 do STJ).
- **Encargo é sinal, não receita:** numa parcela de R$ 100, a multa é de R$ 2.
- **A alavanca contra o atraso:** bloquear novo saque, tolerância de 1 a 2 dias com lembrete, aceitar pagamento parcial, oferta automática de reparcelamento no 7º dia de atraso.
- **Cobrança:** das 8h às 20h, nada em domingos e feriados, no máximo 1 mensagem de cobrança por dia por contrato, nunca contatar terceiros, roteiro revisado por advogado. Cobrança vexatória é crime pelo CDC.

## 4.8 Modelo financeiro — o simulador e as tabelas DEVEM reproduzir estes números

**Premissas**
- Saque médio de R$ 400.
- 85% do capital na rua.
- Saldo médio de cada saque igual a 62,5% do valor (4 semanas, amortização de 25% por semana).
- 52/12 semanas por mês.
- Custo direto de R$ 13 por saque: R$ 8 de operação mais R$ 5 da parceira (estimativa).
- Perda medida sobre o valor sacado.
- Funding sênior a 2% ao mês.
- Margem antes de equipe, tecnologia e impostos.

**Fórmulas**
- `carteira = capital × 0,85` (fase 1)
- `sacado_mes = carteira ÷ 0,625 × (52/12) ÷ 4`
- `receita_mes = sacado_mes × taxa_semanal × 4`
- `perda_mes = sacado_mes × perda`
- `custo_mes = sacado_mes ÷ 400 × 13`
- `funding_mes = divida_senior × 0,02`
- `margem_mes = receita_mes − perda_mes − custo_mes − funding_mes`
- `clientes_com_saldo = carteira ÷ (0,625 × 400)`
- `perda_de_equilibrio_fase1 = taxa_semanal × 4 − 13/400` → a 5% por semana, 16,75%
- Taxa efetiva mensal: TIR do fluxo (−400 no dia 0; parcelas nas datas), convertida para 30 dias.

**Tabela A — variação de capital, fase 1** (valores de teste)

| Capital | Carteira | Sacado/mês | Receita/mês a 4% | a 5% | a 6% | Receita/ano a 5% | Margem/mês a 5%, perda 8% | Margem/mês a 5%, perda 12% | Clientes com saldo | Saques/mês |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R$ 150 mil | R$ 127,5 mil | R$ 221,0 mil | R$ 35,4 mil | R$ 44,2 mil | R$ 53,0 mil | R$ 530,4 mil | R$ 19,3 mil | R$ 10,5 mil | 510 | 552 |
| R$ 250 mil | R$ 212,5 mil | R$ 368,3 mil | R$ 58,9 mil | R$ 73,7 mil | R$ 88,4 mil | R$ 884,0 mil | R$ 32,2 mil | R$ 17,5 mil | 850 | 921 |
| R$ 500 mil | R$ 425,0 mil | R$ 736,7 mil | R$ 117,9 mil | R$ 147,3 mil | R$ 176,8 mil | R$ 1,77 mi | R$ 64,5 mil | R$ 35,0 mil | 1.700 | 1.842 |
| R$ 1 mi | R$ 850,0 mil | R$ 1,47 mi | R$ 235,7 mil | R$ 294,7 mil | R$ 353,6 mil | R$ 3,54 mi | R$ 128,9 mil | R$ 70,0 mil | 3.400 | 3.683 |

**Tabela B — as três fases** (5% por semana)

| Fase | Como é financiada | Carteira | Sacado/mês | Receita/ano | Perda/mês (8%) | Custo/mês | Funding/mês | Margem/mês, perda 8% | Margem/mês, perda 12% | Perda de equilíbrio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 · meses 0–12 | R$ 1 mi próprio compra todas as CCBs | R$ 0,85 mi | R$ 1,47 mi | R$ 3,54 mi | R$ 117,9 mil | R$ 47,9 mil | — | R$ 128,9 mil | R$ 70,0 mil | 16,75% |
| 2 · meses 12–24 | Dívida estruturada (debênture ou linha com a parceira); o capital da Vapti vira 25% subordinado (R$ 0,85 mi); sênior de R$ 2,55 mi | R$ 3,4 mi | R$ 5,89 mi | R$ 14,14 mi | R$ 471,5 mil | R$ 191,5 mil | R$ 51,0 mil | R$ 464,7 mil | R$ 228,9 mil | 15,9% |
| 3 · ano 3 | FIDC: subordinada de R$ 2,55 mi (capital, lucro retido e aporte) a 20%; sênior de R$ 10,2 mi | R$ 12,75 mi | R$ 22,1 mi | R$ 53,04 mi | R$ 1,77 mi | R$ 718,3 mil | R$ 204,0 mil | R$ 1,73 mi | R$ 845,8 mil | 15,8% |

**Perda de equilíbrio da fase 1 por taxa:** 4% → 12,75% · 4,5% → 14,75% · 5% → 16,75% · 6% → 20,75%.

**Leitura obrigatória:** quem decide é a perda; a taxa vem depois. Entre 8% e 12% de perda, a margem da fase 1 cai R$ 59 mil por mês.

Estes números substituem quaisquer tabelas de documentos anteriores (que usavam custo de R$ 8 por saque e estrutura de ESC).

**Padrão de banco desde o primeiro dia** — pode virar o painel "Como medimos"
- Safra mensal por coorte de entrada.
- Roll rate entre faixas de atraso: em dia → 1–7 dias → 8–30 → 31–60 → mais de 60.
- Perda esperada = PD × LGD × EAD, com provisão por safra.
- Recontratação por coorte.
- Custo total por saque.

## 4.9 Custos e eficiência
- **Bureau de crédito:** preço de balcão da Serasa de R$ 15,99 a R$ 59,99 por consulta; Boa Vista R$ 13 (CNPJ com score). Por API, em volume: R$ 1 a R$ 5. Com o funil em camadas (cadastro público grátis → antifraude → Open Finance → bureau), o custo por cliente aprovado cai de R$ 16,67 para R$ 8,33 (estimativa com consulta a R$ 5 e 30% de aprovação). A recontratação dispensa bureau, o que leva a média para R$ 2 a R$ 3 por saque na carteira madura.
- **WhatsApp, API oficial:** desde 01/10/2026 a Meta cobra também as respostas livres — R$ 0,035 por mensagem no Brasil, depois de uma franquia de 1.000 mensagens de serviço por mês. Conversa aberta por anúncio Click-to-WhatsApp tem 72 horas sem cobrança de resposta. Jornada redesenhada: 4 a 6 mensagens cobradas por saque (cerca de R$ 0,20) em vez de 30 (R$ 1,05). Usar IA para atender os próprios clientes é permitido na API oficial; a restrição de 15/01/2026 mira assistentes de IA de uso geral.
- **Fornecedores oficiais de WhatsApp a cotar:** Blip, Zenvia (vertical financeira, triagem de crédito, integração com Open Finance), Infobip, Sinch e Twilio. A verificação da conta na Meta leva de 2 a 6 semanas.
- **Pix Automático:** sem tarifa para quem paga; quem recebe paga conforme a instituição.

## 4.10 Zippi — a referência
- Fundada em 2019 por André Bernardes, Ludmila Pontremolez e Bruno Lucas (ex-ITA e MIT). Razão social: Zippi Soluções de Crédito Ltda.
- **Set/2019:** seed do Y Combinator, US$ 125 mil a US$ 2 milhões de valuation (Dealroom).
- **Out/2021:** lança o cartão de crédito semanal. A fatura fecha no domingo e é paga até quarta; a "fatura flexível" permite pagar parte e parcelar o resto em até 12 semanas; o limite volta segundos depois do Pix. Pedido só com CPF, e-mail e WhatsApp.
- **2021:** 160 mil empréstimos concluídos (Preqin).
- **Jun/2022:** Série A de US$ 16 milhões liderada pela Tiger Global; cerca de US$ 22 milhões em três rodadas até ali.
- **2022:** R$ 275 milhões liberados em cerca de 500 mil transações (ticket médio de ~R$ 550); operação 9 vezes maior que no ano anterior; debênture de R$ 30 milhões estruturada pela gestora Empírica.
- **Abr/2024:** R$ 1 bilhão em transações de crédito, alta de 210% em um ano.
- **FIDC:** R$ 66 milhões (2024), R$ 80 milhões (2025), R$ 220 milhões (fev/2026, terceira captação; Itaú e Bradesco BBI entre os participantes, segundo o Dealroom).
- **Valor da empresa:** não divulgado pela Zippi. O Dealroom estima cerca de US$ 80 milhões — estimativa de terceiros; use sempre com essa ressalva. Os aportes de 2025 que o Dealroom lista (Verde, Valora e Bradesco Asset) coincidem com a captação do FIDC daquele ano; não trate como rodada de equity.
- **2025:** crescimento acima de 100% em receita, carteira e volume; mais de 100 mil clientes ativos.
- **Hoje:** R$ 7,6 bilhões concedidos; cerca de 250 mil autônomos no app; limite de até R$ 5.000; projeta movimentar R$ 10 bilhões em 2026.
- **Preço:** a partir de 4% por semana sobre o valor usado; varia por perfil.
- **Modelo:** análise, esteira e cobrança feitas dentro de casa; Pix e liquidação via fornecedores de BaaS ("não somos participantes do Pix").
- **Lição:** equity financia a empresa; dívida (debênture, depois FIDC) financia a carteira.
- **Onde a comparação não vale:** a Zippi nasceu no circuito de venture capital, com fundadores do MIT e do ITA; a Vapti começa com R$ 1 milhão próprio. A Vapti cobra cerca de 2 vezes mais — o argumento é atender quem a Zippi recusa.
- **Uso visual:** a Zippi aparece sempre em cinza neutro e só como texto. Nunca use o logotipo dela.

## 4.11 Régua de crescimento, aportes e saída

| Ano | Zippi (contando do lançamento, 2021) | Vapti — meta | Capital acessível à Vapti |
| --- | --- | --- | --- |
| 0 | 2019–2021: seed no Y Combinator; produto lançado em out/2021 | Estrutura, parceira, piloto de 90 dias | Só o R$ 1 mi |
| 1 | 2022: Série A de US$ 16 mi; R$ 275 mi liberados; debênture de R$ 30 mi | Fase 1: carteira de R$ 0,85 mi, ~3.400 clientes com saldo, 12 meses de safra | Nenhum: é o ano de gerar histórico |
| 2 | 2023: rumo a R$ 1 bi acumulado (abr/2024) | Fase 2: dívida estruturada, carteira de R$ 3,4 mi | Dívida de R$ 3 a 10 mi; anjo ou seed se crescer mais de 3x |
| 3 | 2024: primeiro FIDC, R$ 66 mi | Fase 3: FIDC, carteira de R$ 12,75 mi | FIDC de R$ 10 a 30 mi |
| 4–5 | 2025: FIDC de R$ 80 mi; crescimento acima de 100%; mais de 100 mil clientes ativos | Rodada Série A, se os números sustentarem | Equity de R$ 15 a 40 mi |
| 6+ | 2026: FIDC de R$ 220 mi; R$ 7,6 bi concedidos | Janela de venda ou nova carteira | — |

A coluna da Vapti são hipóteses de ordem de grandeza, não promessas.

- **O que uma gestora de FIDC olha antes de entrar:** 12 a 18 meses de safras fechadas; perda estável e previsível; carteira acima de R$ 5 mi (abaixo disso, estruturar não compensa); trilha auditável de ponta a ponta; originação acima de R$ 2 mi por mês, sustentada.
- **Valuation:** a carteira vale o valor de face; o que vale múltiplo é o motor de originação — canal barato, modelo de risco e base que recontrata. Referências: 0,8x a 2x o patrimônio (operação estável); 4x a 8x o lucro (pequena e lucrativa); 2x a 6x a receita (só com crescimento alto). Para comparar, o Dealroom estima a Zippi em cerca de US$ 80 milhões, depois de ~US$ 22 milhões de equity divulgado até 2022 e R$ 7,6 bilhões concedidos — estimativa de terceiros, use como ordem de grandeza. Crédito para autônomo é operação pesada e de risco: não conte com múltiplos de empresa de software.
- **Janela de venda:** do ano 4 ao 6 — carteira acima de R$ 30 mi, FIDC rodando, crescimento acima de 50% ao ano. Antes disso não há comprador; depois, o preço volta a ser múltiplo de lucro.
- **"Montar mais carteiras"** significa abrir uma nova originadora em outro nicho, levando o motor de crédito e o time.

## 4.12 Vantagens e desvantagens

**Vantagens**
1. Nacional desde o primeiro dia; pessoa física, MEI e negativado.
2. Sem teto de receita; dívida estruturada a partir do ano 2 e FIDC a partir do ano 3.
3. Juros livres via instituição autorizada; multa e mora viáveis.
4. Modelo validado: a Zippi já concedeu R$ 7,6 bilhões.
5. Pix Automático reduz atraso e custo de cobrança.
6. Jornada enxuta: cerca de R$ 0,20 de WhatsApp por saque; bureau de R$ 2 a R$ 3 por saque na carteira madura.
7. O motor de crédito próprio é o ativo que se vende.
8. Preço com prêmio de risco: mesmo no nível Ouro, cerca de 60% acima da Zippi.

**Desvantagens e riscos, com a mitigação**

| Risco | Mitigação |
| --- | --- |
| Perda acima de 16,75% zera a margem da fase 1 | Piloto de 90 dias com critério de parada; Open Finance; escada de limite |
| Dependência da parceira (preço, encerramento) | Contrato com aviso prévio; integração desenhada para trocar de parceira; cotar 3 |
| Custo por CCB cobrado pela parceira | Negociar por volume; cotação antes do piloto |
| 2 a 4 meses até operar | Começar já os contratos e a verificação na Meta |
| Taxa de cerca de 2x a Zippi: revisão judicial e seleção adversa | Taxa cai por nível; custo em reais na tela; perfil de risco documentado |
| CDC integral para pessoa física | Roteiros revisados; cobrança dentro das regras; registro de tudo |
| Regra de BaaS nova, interpretação em consolidação | Parecer jurídico antes de assinar |
| Fraude no cadastro digital | Biometria, antifraude, Open Finance; limite inicial baixo |
| Dependência do WhatsApp e da Meta | A plataforma própria carrega a jornada; o WhatsApp fica nas pontas |
| Capital próprio limitado no ano 1 | Fase 2 com dívida assim que houver 12 meses de safra |

## 4.13 Piloto de 90 dias
- **Escopo:** um segmento (sugestão: motoristas de aplicativo), praça de partida na Grande Natal, até R$ 150 mil de carteira.
- **Metas:** mais de 80% das parcelas pagas no vencimento; atraso acima de 30 dias abaixo de 10%; custo direto do primeiro saque abaixo de R$ 20 e da recontratação abaixo de R$ 8; recontratação de adimplentes acima de 50%; mais de 85% dos saques sem atendimento humano; mais de 95% dos Pix conciliados automaticamente; reclamações abaixo de 3%.
- **Critérios de parada, definidos antes:** atraso acima de 30 dias passa de 20% em qualquer safra; custo por saque acima de R$ 35; qualquer reclamação formal de cobrança abusiva; recontratação abaixo de 30%.
- **Para escalar:** atraso abaixo de 10%, recontratação acima de 50% e custo dentro da meta, os três juntos. Aí aumenta o capital e abre o segundo segmento.

## 4.14 O pedido ao cliente — última seção
**Decisões para hoje**
1. Aprovar a estrutura BaaS, sem ESC.
2. Autorizar a contratação de advogado e contador.
3. Autorizar a cotação de 3 parceiras de BaaS de crédito (começando pela QI Tech) e de 3 fornecedores de WhatsApp.
4. Aprovar o piloto de 90 dias com os critérios de parada.
5. Confirmar o aporte de R$ 1 milhão e o calendário de integralização.

**Perguntas para o advogado:** a estrutura de tomadora com cessão; se os juros contratados pela parceira se mantêm quando a CCB é cedida a uma Ltda; o nome; as cláusulas de multa e mora; os roteiros de cobrança.

**Perguntas para o contador:** Ltda no lucro presumido ou no lucro real; tributação da receita de juros de CCB adquirida; como o IOF recolhido pela parceira entra no custo.

**Pendências de produto:** confirmar com a parceira se o rotativo semanal com Pix Automático cabe no catálogo dela; acesso ao Open Finance via parceira.

## 4.15 FORA DA APRESENTAÇÃO — proibido em qualquer lugar

| Não entra | O que entra no lugar |
| --- | --- |
| "Mentalidade de cassino", gatilhos "imperceptíveis", persuasão oculta | Gamificação visível, com regras na tela (4.6) |
| Ofertas de maior margem para clientes com sinais de dependência | Sinal de dependência reduz o limite e oferece reparcelamento |
| Cobrança envolvendo grupos de clientes, exposição de devedores, consórcio informal, sorteio | Indicação que acelera o nível de quem indica |
| Chips descartáveis, números rotativos, API não oficial do WhatsApp | API oficial, Pix Automático e plataforma própria |
| Induzir atraso; quem indica pagar a dívida do indicado | Tolerância, pagamento parcial, reparcelamento |
| "Taxa de serviço Vapti" ou qualquer tarifa em nome da Vapti | Receita dos juros das CCBs compradas |
| ESC como estrutura escolhida; meta de "R$ 10 milhões por mês" | Modelo BaaS e a régua da seção 4.11 |
| Promessa de retorno, "risco zero", "aprovação garantida" | Projeção com premissas e selo |

## 4.16 Fontes — citar na seção de fontes do site e no PDF
- [Finsiders — Zippi cresce 9 vezes](https://finsidersbrasil.com.br/reportagem-exclusiva-fintechs/zippi-fintech-para-autonomos-cresce-9-vezes-e-planeja-dobrar-volume-de-credito-neste-ano/)
- [Startups — Zippi cresce 9 vezes e preço de 4%](https://startups.com.br/negocios/fintech/fintech-zippi-cresce-9-vezes-e-planeja-dobrar-volume-de-credito/)
- [Finsiders — FIDC de R$ 220 milhões](https://finsidersbrasil.com.br/credito-digital/zippi-levanta-r-220-milhoes-via-fidc-e-projeta-movimentar-r-10-bi-em-2026/)
- [Finsiders — R$ 1 bilhão em transações](https://finsidersbrasil.com.br/giro-noticias/zippi-dobra-meta-de-transacoes-de-credito-em-um-ano-para-r-1-bi/)
- [TI Inside — cartão de crédito semanal (2021)](https://tiinside.com.br/14/10/2021/1o-cartao-de-credito-semanal-do-mundo-e-lancado-pela-fintech-zippi/)
- [Exame — Série A de US$ 16 milhões](https://exame.com/negocios/fintech-dos-autonomos-zippi-capta-us-16-milhoes-com-tiger-global/)
- [Startups — Série A e mercado de 24 milhões de autônomos](https://startups.com.br/negocios/zippi-fecha-serie-a-de-us-16-mi-com-tiger-global-e-y-combinator/)
- [Dealroom — rodadas e valor estimado da Zippi](https://app.dealroom.co/companies/zippi)
- [LatamList — FIDC de 2025 e mais de 100 mil clientes ativos](https://latamlist.com/zippi-secures-15-9m-to-expand-credit-access-for-brazilian-small-businesses/)
- [Regulamento do FIDC da Zippi (Anbima)](https://data-api.prd.anbima.com.br/web-bff/v2/fundos/F0000739480/documentos/7c3658a9-4ad5-4ddf-85a1-a57153d9a1a7.pdf)
- [Zippi — vaga citando gamificação de pagamentos](https://jobs.lever.co/zippi/faf2b8cd-b2a9-4a32-8ce8-cf6df5bb7e08)
- [App Store — Zippi (250 mil autônomos, limite até R$ 5.000)](https://apps.apple.com/br/app/zippi/id1525763736)
- [Demarest — Resolução Conjunta 16/2025 (BaaS)](https://www.demarest.com.br/bc-e-cmn-regulamentam-banking-as-a-service/)
- [Monitor Mercantil — BaaS e correspondente bancário](https://monitormercantil.com.br/o-novo-marco-regulatorio-do-baas-e-a-revisao-das-estruturas-vigentes-de-correspondente-bancario/)
- [QI Tech — Lending as a Service](https://qitech.com.br/en/laas)
- [Tributário nos Bastidores — regras da ESC (LC 167/2019)](https://tributarionosbastidores.com.br/2019/06/empresa-simples-de-credito-esc-principais-regras-e-sua-tributacao/)
- [Migalhas — juros para quem não é instituição financeira](https://www.migalhas.com.br/depeso/341795/como-emprestar-dinheiro-a-juros-no-brasil)
- [B3 Bora Investir — lançamento do Pix Automático](https://borainvestir.b3.com.br/noticias/banco-central-lanca-hoje-o-pix-automatico-saiba-como-vai-funcionar/)
- [Nosso Meio — cobrança de respostas na API do WhatsApp](https://nossomeio.com.br/whatsapp-business-cobra-respostas-de-empresas-na-api-business/)
- [TechCrunch — política de IA na API do WhatsApp](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/)
- [Serasa Experian — preços de consulta](https://www.serasaexperian.com.br/solucoes/consulta-de-cnpj-serasa-experian)
- [Zenvia — soluções para o setor financeiro](https://zenvia.com/segmentos/financeiro/)

## 4.17 Aviso padrão — rodapé do site e última página do PDF
"Documento de trabalho para discussão. Projeções são hipóteses com premissas declaradas, não promessa de resultado. A estrutura jurídica e tributária depende de parecer de advogado e contador. Dados de terceiros conforme as fontes citadas, consultadas em outubro de 2026."

# 5. Narrativa — as seções do site

Regra de texto: **o título de cada seção é a conclusão, não o assunto.** "Quem decide é a perda", não "Projeções financeiras".

Os IDs de visual (V01–V24) são os mesmos do roteiro do vídeo, para o site e o vídeo contarem a mesma história.

| # | Seção | Título sugerido | O que mostra | Visuais | Tempo |
| --- | --- | --- | --- | --- | --- |
| 00 | Capa | "Capital de giro na velocidade do Pix" | Marca, "Apresentação para [NOME DO CLIENTE]", data | V01 | 0:20 |
| 01 | O problema | "R$ 400 hoje, não em 30 dias" | Caixa diário irregular do autônomo (ilustrativo), o crédito tradicional que pede holerite, 24 milhões de autônomos | V02, V03 | 1:00 |
| 02 | A prova | "A Zippi provou o mercado" | Linha do tempo 2019–2026, números com contador, barras do FIDC, lição "equity financia a empresa, dívida financia a carteira" | V04, V05, V06 | 1:30 |
| 03 | O produto | "Um limite que cresce com o cliente" | Rotativo, 4 semanas ou 14 dias, Pix Automático e o protótipo de celular com a jornada de 7 etapas | V07, V08, V09 | 2:00 |
| 04 | Gamificação | "Quem paga bem paga menos" | Escada de níveis interativa, mecânicas, princípios do jogo justo | V10, V11 | 1:30 |
| 05 | Estrutura | "Dentro da lei, sem teto" | Três caminhos (empresa comum, ESC, BaaS), fluxo BaaS em 5 passos, regras da Resolução Conjunta 16/2025 | V12, V13 | 2:00 |
| 06 | Preço | "O dobro da referência, com transparência" | Sacado × saldo × Zippi, taxa efetiva ao mês por nível, custo em reais | V14 | 1:30 |
| 07 | Números | "Quem decide é a perda" | Simulador, Tabela A, as três fases, curva margem × perda com o equilíbrio em 16,75% | V15, V16, V17 | 2:30 |
| 08 | Eficiência | "Cada centavo desenhado" | Funil do bureau, WhatsApp R$ 1,05 → R$ 0,20, Pix Automático, painel "Como medimos" | V18 | 1:00 |
| 09 | Vantagens e riscos | "O que ganhamos e o que pode dar errado" | Duas colunas de mesmo peso e tabela de riscos com mitigação | V19 | 1:30 |
| 10 | Crescimento | "Três anos até o primeiro fundo" | Régua Vapti × Zippi em duas trilhas, gatilhos de captação, valuation, janela de venda | V20, V21 | 2:00 |
| 11 | Piloto | "90 dias para medir antes de crescer" | Metas, critérios de parada e de escala em semáforo | V22 | 1:00 |
| 12 | Decisões | "Cinco decisões para começar" | As 5 decisões, perguntas ao advogado e ao contador, próximas 4 semanas | V23 | 1:00 |
| 13 | Fontes e aviso | — | Fontes da 4.16 e aviso da 4.17 | V24 | — |

Tempo total: cerca de 20 minutos, mais perguntas.

**Visuais — descrição única, compartilhada com o vídeo**

| ID | Visual | O que mostra (números exatos) | Seção |
| --- | --- | --- | --- |
| V01 | Marca Vapti | Logotipo (ou wordmark provisório) e a frase “capital de giro na velocidade do Pix”. | Capa |
| V02 | Caixa irregular do autônomo | Gráfico ILUSTRATIVO de entradas diárias pequenas e irregulares de um motorista e um barbeiro, com um “buraco” no meio da semana. Selo “Ilustrativo”. | 01 Problema |
| V03 | 24 milhões de autônomos | Contador até 24.000.000 sobre mapa do Brasil em pontos. Fonte: IBGE, citado por Startups.com.br. | 01 Problema |
| V04 | Linha do tempo da Zippi | 2019 seed US$ 125 mil · out/2021 crédito semanal via Pix · 2022 R$ 275 mi liberados (9x) · abr/2024 R$ 1 bi acumulado · 2024 primeiro FIDC · 2025 FIDC de R$ 80 mi e crescimento acima de 100% · fev/2026 FIDC R$ 220 mi. Zippi em cinza neutro, só o nome em texto, sem logotipo. | 02 A prova |
| V05 | FIDC da Zippi | Três barras: R$ 66 mi (2024), R$ 80 mi (2025), R$ 220 mi (fev/2026). | 02 A prova |
| V06 | Números da Zippi hoje | Cards: R$ 7,6 bi concedidos · ≈ US$ 80 mi de valor estimado (Dealroom; estimativa de terceiros, sempre com essa etiqueta) · cerca de 250 mil autônomos no app. | 02 A prova |
| V07 | Celular — jornada e painel | Protótipo: conversa com áudio (balões genéricos, sem logotipo de terceiros) → link → plataforma com barra de 7 etapas (dados, Open Finance, análise, proposta, aceite, Pix Automático, Pix recebido) → painel com limite, nível e próxima parcela. Instituição parceira aparece como credora. Dados fictícios. | 03 Produto |
| V08 | Planos de pagamento | R$ 400 → 4 parcelas semanais de R$ 120 (R$ 100 + R$ 20 de juros). Alternativa: 14 dias de R$ 31,43. | 03 Produto |
| V09 | Pix Automático | Autorização única + até 3 retentativas se faltar saldo (1 ✕, 2 ✕, 3 ✓). | 03 Produto |
| V10 | Escada de níveis | Entrada 6,0%/sem (45,8% ao mês) · Bronze 5,0% (37,5%) · Prata 4,5% (33,5%) · Ouro 4,0% (29,5%). Prata e Ouro: limite volta conforme paga. Ouro: reserva de emergência. | 04 Gamificação |
| V11 | Regras do jogo justo | Premia pagamento em dia, nunca volume de dívida · regras visíveis · nada aleatório · sinal de dependência reduz limite. | 04 Gamificação |
| V12 | Três caminhos | Empresa comum (juros limitados a 12% ao ano) ✕ · ESC (sem pessoa física, só a cidade, sem fundos, teto R$ 4,8 mi/ano) ✕ · BaaS ✓. | 05 Estrutura |
| V13 | Fluxo BaaS | Cliente → Vapti (cliente, análise, cobrança) → Instituição parceira (credora: emite a CCB e libera o Pix) → cessão da CCB para quem financia a carteira: a Vapti (fase 1), dívida estruturada (fase 2) ou FIDC (fase 3) → cliente paga por Pix Automático na conta da parceira ou do fundo. Selo “Resolução Conjunta nº 16 · 28/11/2025”. | 05 Estrutura |
| V14 | Preço | R$ 400 × 5% × 4 semanas = R$ 80 → 37,5% ao mês. Barras: Zippi 18,3% (cinza) × Vapti por nível 45,8% / 37,5% / 33,5% / 29,5%. | 06 Preço |
| V15 | Fase 1 em números | Capital R$ 1 mi → R$ 0,85 mi na rua → R$ 1,47 mi sacados por mês → receita R$ 294,7 mil/mês (R$ 3,54 mi/ano) − perda R$ 117,9 mil − custos R$ 47,9 mil = margem R$ 128,9 mil/mês. Selo “Projeção”. | 07 Números |
| V16 | Margem × perda | Curva da margem mensal da fase 1 conforme a perda sobe de 4% a 20%; cruza o zero em 16,75%. Selo “Projeção”. | 07 Números |
| V17 | Três fases | Carteira R$ 0,85 mi → R$ 3,4 mi → R$ 12,75 mi; margem/mês R$ 128,9 mil → R$ 464,7 mil → R$ 1,73 mi (perda de 8%). Selo “Projeção”. | 07 Números |
| V18 | Eficiência | WhatsApp: 30 mensagens (R$ 1,05) → 5 (R$ 0,20) por saque. Bureau: R$ 15,99 no balcão → R$ 8,33 por aprovado com funil → R$ 2 a 3 por saque na carteira madura. | 08 Eficiência |
| V19 | Riscos e mitigação | Parceira → cotar 3 · Taxa ~2x Zippi → CET em reais e taxa por nível · Regra nova → parecer jurídico · Prazo 2–4 meses → começar já. | 09 Vantagens e riscos |
| V20 | Régua Vapti × Zippi | Duas trilhas por ano. Zippi (cinza): lançamento 2021 → primeiro FIDC 2024 → FIDC R$ 80 mi 2025 → FIDC R$ 220 mi 2026. Vapti (verde): ano 1 histórico (R$ 0,85 mi) → ano 2 dívida R$ 3–10 mi → ano 3 FIDC R$ 10–30 mi → anos 4–5 rodada R$ 15–40 mi → anos 4–6 janela de venda. Selo “Projeção”. | 10 Crescimento |
| V21 | O que se vende | Carteira (vale o valor de face) × motor de originação (canal, análise, clientes que voltam — vale múltiplo). Janela de venda: anos 4 a 6. | 10 Crescimento |
| V22 | Piloto de 90 dias | Metas: >80% pagas no vencimento · atraso >30 dias <10% · recontratação >50% · custo do 1º saque <R$ 20. Parada: atraso >20% em uma safra · custo >R$ 35 · reclamação formal de cobrança · recontratação <30%. | 11 Piloto |
| V23 | Cinco decisões | 1 Estrutura BaaS · 2 Advogado e contador · 3 Cotar parceiras · 4 Piloto de 90 dias · 5 Aporte de R$ 1 mi. | 12 Decisões |
| V24 | Card final | Marca Vapti + “Vamos?” + aviso: “Projeções são hipóteses com premissas declaradas, não promessa de resultado. Estrutura sujeita a parecer jurídico e contábil.” (5 segundos). | 13 Fechamento |

**O protótipo de celular** (seção 03, também usado na 04)
1. Conversa com balões genéricos: o cliente manda um áudio (forma de onda), o assistente responde e envia um link.
2. Plataforma com barra de progresso de 7 etapas: dados → Open Finance (consentimento simulado) → análise → proposta (recebe R$ 400, paga 4 × R$ 120, datas, taxa efetiva ao mês, nome da instituição parceira como credora) → aceite → autorização do Pix Automático → "Pix recebido".
3. Painel: saldo, próxima parcela, nível atual, "faltam 2 ciclos para Prata", sequência de semanas em dia, linha do tempo do limite.
4. Tela de níveis Entrada → Ouro, com a taxa de cada nível e as regras de subida e descida.
5. Tela de atraso humana: lembrete, pagamento parcial, oferta de reparcelamento, sem ameaça.

Dados fictícios e selo "Protótipo". Nenhum campo coleta dado real; nenhum campo de senha, cartão ou documento.

# 6. Direção de arte
- Use a skill `frontend-design` antes de qualquer decisão visual. A skill `theme-factory` pode servir de inspiração de paleta; não aplique tema pronto sem adaptar.
- **Personalidade:** velocidade, confiança e calor humano. "Vapti" vem de "vapt-vupt".
- **Paleta sugerida** (se houver arquivos em `assets/marca/`, eles mandam): fundo tinta `#0E1116`; superfície `#161B22`; texto `#F2F4F7`; verde-elétrico `#B6F23A` para dinheiro entrando e para a Vapti; coral `#FF7A45` para risco e alerta; azul-gelo `#8FB8FF` para dado neutro; cinza `#8B95A1` para a Zippi e terceiros. Modo claro para impressão com fundo `#FAFAF7`. Contraste AA no mínimo.
- **Tipografia empacotada localmente** (via @fontsource): títulos em fonte grotesca com personalidade (Bricolage Grotesque ou Space Grotesk); texto em Manrope ou IBM Plex Sans; números em fonte mono com algarismos tabulares (JetBrains Mono ou IBM Plex Mono). Evite Inter e gradientes roxos: são cara de template.
- **Os números são os protagonistas:** grandes, com contagem animada ao entrar na tela, respeitando `prefers-reduced-motion`.
- **Movimento:** entradas de 200 a 400 ms com easing suave; gráficos se desenham ao entrar; nada de parallax exagerado.
- **Componentes:** KPI grande com legenda; tabela comparativa com destaque de linha; linha do tempo em duas trilhas; diagrama de fluxo; moldura de celular; selos "Projeção", "Ilustrativo" e "Protótipo".
- **Ícones:** um único conjunto (por exemplo, Lucide), traço fino.
- **Legibilidade a 3 metros:** em 1920×1080, nenhum texto de conteúdo abaixo de 22 px; títulos acima de 48 px.
- **Proibido:** fotos de banco de imagem, moedas, cofrinho, dinheiro chovendo, logotipos de terceiros (Zippi, bancos, Meta, WhatsApp, Banco Central, Pix). Nomes de terceiros só em texto.

# 7. Arquitetura técnica
- **Stack:** React, TypeScript, Vite e Tailwind; `motion` (Framer Motion) para animação; gráficos em SVG próprio ou Recharts; sem backend.
- **Arquivo único:** use a skill `web-artifacts-builder` (ela empacota tudo num único HTML) ou `vite-plugin-singlefile`. O resultado abre com duplo clique, sem internet.
- **Dados:** `src/data/vapti.ts` é a única fonte de números do app. Nenhum número digitado dentro de componente.
- **Modelo:** `src/lib/modelo.ts` com as fórmulas da 4.8; testes em Vitest reproduzindo as Tabelas A e B e as taxas efetivas da 4.5, com tolerância de ±0,5%.
- **Texto:** `src/content/secoes.ts` com todo o texto e as notas do apresentador.
- **Modo apresentação:** rotas por seção (`#/03`), teclado (←, →, espaço, N, F, G, Esc), barra de progresso discreta, notas do apresentador num painel e também numa segunda janela (`?notas=1`) para usar com dois monitores.
- **Impressão:** `?print=1` com layout 16:9 por página e modo claro. PDFs gerados com Playwright (`page.pdf`) pelas skills `webapp-testing` e `pdf`. Resumo A4 com os 6 números-chave (R$ 1 mi de capital; R$ 1,47 mi sacados por mês; R$ 3,54 mi de receita por ano; R$ 128,9 mil de margem por mês; 16,75% de perda de equilíbrio; 37,5% ao mês no cenário-base e 29,5% no Ouro), o diagrama da estrutura e as 5 decisões.
- **Acessibilidade:** navegação por teclado, foco visível, `prefers-reduced-motion`, tabela acessível escondida por trás de cada gráfico.
- **Desempenho:** HTML final abaixo de 5 MB; nada de vídeo embutido.

# 8. O time — subagentes

Crie cada arquivo abaixo em `.claude/agents/`, com o conteúdo exato entre os marcadores. Depois confirme que os 9 foram reconhecidos (comando `/agents` ou listando a pasta).

Antes de seguir, **confira na sua lista de skills disponíveis os nomes exatos** de `frontend-design`, `web-artifacts-builder`, `webapp-testing` e `pdf`. Instaladas por plugin, podem aparecer com prefixo (por exemplo, `example-skills:frontend-design`). Ajuste o campo `skills:` dos agentes para os nomes exatos.

(Os 9 arquivos de agente estão em `.claude/agents/` deste projeto, com o conteúdo exato do prompt original.)

# 9. Plano de execução

**Fase 0 — Preparação (você, orquestrador)**
1. Se docs/BRIEFING.md não existir, salve este prompt inteiro nele, literalmente.
2. Crie um CLAUDE.md curto: a missão em 3 linhas, as regras da seção 1, "fonte da verdade: docs/BRIEFING.md, seção 4" e a lista dos agentes.
3. Crie os arquivos dos agentes (seção 8) e confira que foram reconhecidos.
4. Confira as skills `frontend-design`, `web-artifacts-builder`, `webapp-testing` e `pdf`. Se faltar alguma, pare e me peça para instalar (os comandos estão no topo do briefing).
5. Inicie o projeto (git, Vite, React, TypeScript, Tailwind) e faça o primeiro commit.
6. Me mostre o plano em 10 linhas e faça as perguntas da seção 11 de uma vez só.

**Fase 1 — Fundamentos, em paralelo**
- `analista-financeiro`: dados, modelo e testes.
- `roteirista`: texto de todas as seções.
- `diretor-de-arte`: tokens, guia e página de estilo.

Verificação: testes passando; `revisor-compliance` revisa o texto; resolva todos os bloqueios antes de seguir.

**Fase 2 — Construção, em paralelo**
- `dev-site`: estrutura, seções, modos e impressão.
- `dev-dataviz`: simulador, gráficos e diagramas.
- `dev-prototipo`: celular clicável.

Verificação: build limpo; `qa-entrega` tira capturas; `diretor-de-arte` revisa o visual pelas capturas; correções.

**Fase 3 — Integração e revisão**
Integre tudo. `revisor-compliance` faz a revisão completa. Corrija todos os itens "bloqueia" e "corrigir".

**Fase 4 — Entrega**
`qa-entrega` roda os testes, as capturas, os PDFs e o arquivo único. Você escreve `entregas/COMO-APRESENTAR.md` e `entregas/RELATORIO.md`.

**Fase 5 — Kit de vídeo, só se P0 e P1 estiverem prontos**
`kit-video`.

**Regras de orquestração**
- Passe a cada subagente só o que ele precisa: caminhos de arquivo e a seção do briefing, não o briefing inteiro colado.
- Peça sempre um resumo curto de volta.
- Não aceite "pronto" sem a verificação da fase.
- Se dois agentes discordarem, a seção 4 decide. Se a seção 4 não decidir, pergunte para mim.

# 10. Critérios de aceite
- [ ] Testes do modelo passam; o simulador reproduz as Tabelas A e B.
- [ ] `revisor-compliance`: zero bloqueios.
- [ ] O arquivo único abre offline com duplo clique (testado com a rede bloqueada).
- [ ] Modo apresentação completo pelo teclado em 1920×1080, sem texto cortado.
- [ ] PDF 16:9 e resumo A4 conferidos visualmente, página por página.
- [ ] Desvantagens e riscos com o mesmo peso visual das vantagens.
- [ ] Todas as fontes citadas; aviso presente; pendências `[A CONFIRMAR]` listadas no relatório.
- [ ] Busca no projeto inteiro: nada da seção 4.15.

# 11. Perguntas para mim — faça todas de uma vez, na Fase 0
1. Existe logo, cores ou nome final da marca? Se sim, onde estão os arquivos? (Se não, crio uma identidade provisória discreta.)
2. Como vai ser a reunião: presencial em TV ou projetor, presencial no notebook, ou online? Quanto tempo temos?
3. Como o cliente deve aparecer na capa: nome da pessoa, nome da empresa ou genérico?

Se eu não responder em 10 minutos, siga com: identidade provisória, TV em 1920×1080, 30 minutos e capa genérica.

# 12. Relatório final — sua última mensagem
Em até 15 linhas: o que foi entregue (com os caminhos), como abrir, os atalhos do modo apresentação, as pendências `[A CONFIRMAR]`, o que eu devo revisar antes da reunião e o que ficou de fora, e por quê.

▲▲▲ FIM DO PROMPT ▲▲▲
