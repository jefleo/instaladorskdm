# Como apresentar a Vapti

Reunião prevista: 30 minutos. São cerca de 20 minutos de fala e 10 de perguntas. O padrão é TV ou projetor em 1920×1080.

## Abrir

1. Dê **duplo clique** em `entregas/vapti-apresentacao.html` e abra no Chrome ou no Edge. Funciona sem internet.
2. Aperte **F** para tela cheia. A apresentação abre na capa (`#/00`).
3. Para usar dois monitores, aperte **N**. No painel de notas, clique em "Abrir notas em outra janela" e arraste essa janela para o notebook. Ela mostra a tela atual, a próxima, as notas e um cronômetro.

## Atalhos

| Tecla | Ação |
| --- | --- |
| → · Espaço · PageDown | Avança (o passador de slides também funciona) |
| ← · PageUp | Volta |
| Home · End | Primeira e última tela |
| N | Notas do apresentador |
| F | Tela cheia |
| G | Grade com todas as telas (clique ou Enter para ir) |
| ? | Ajuda de atalhos |
| Esc | Fecha a grade, as notas ou a tela cheia |

No simulador (tela 07c), as setas mexem no controle que está em foco. PageDown e o passador continuam avançando de tela.

## Roteiro: ordem, tempo e frase-chave

Cada seção tem uma ou mais telas, com rotas `#/NN`, `#/NNb` e assim por diante. Use a grade (G) para conferir.

| # | Seção | Título | Tempo | Frase-chave |
| --- | --- | --- | --- | --- |
| 00 | Capa | Capital de giro na velocidade do Pix | 0:20 | Vou mostrar o modelo, os números e os riscos. No fim, peço 5 decisões. |
| 01 | O problema | R$ 400 hoje, não em 30 dias | 1:00 | O autônomo não precisa de muito dinheiro. Precisa de R$ 400 hoje, não em 30 dias. |
| 02 | A prova | A Zippi provou o mercado | 1:30 | A Zippi já concedeu R$ 7,6 bi. O mercado existe; a questão é como entrar. |
| 03 | O produto | Um limite que cresce com o cliente | 2:00 | O limite funciona como reserva de emergência, reposta com dias ou semanas de trabalho. |
| 04 | Gamificação | Quem paga bem paga menos | 1:30 | Premiamos pagamento e organização, nunca volume de dívida. |
| 05 | Estrutura | Dentro da lei, sem teto | 2:00 | Juros livres não vêm da ESC. Vêm de operar através de instituição autorizada. |
| 06 | Preço | O dobro da referência, com transparência | 1:30 | Cobramos o dobro da referência e mostramos o custo em reais em toda tela. |
| 07 | Números | Quem decide é a perda | 2:30 | Quem decide é a perda. Na projeção, acima de 16,75%, a margem da fase 1 some. |
| 08 | Eficiência | Cada centavo desenhado | 1:00 | O motor barato de originação é o que vale múltiplo lá na frente. |
| 09 | Vantagens e riscos | O que ganhamos e o que pode dar errado | 1:30 | Honestidade é parte da tese: cada risco já tem mitigação. |
| 10 | Crescimento | Três anos até o primeiro fundo | 2:00 | Equity financia a empresa; dívida financia a carteira. O ano 1 é para gerar histórico. |
| 11 | Piloto | 90 dias para medir antes de crescer | 1:00 | Paramos se der errado, e os critérios estão escritos antes de começar. |
| 12 | Decisões | Cinco decisões para começar | 1:00 | Com estas 5 decisões, começamos já os contratos e as cotações. |
| 13 | Fontes e aviso | Cada número tem origem declarada | — | Vamos? |

Total: cerca de 20 minutos. As notas completas de cada tela (tópicos e perguntas prováveis com resposta) estão no painel **N**.

### Os três momentos que decidem a reunião

- **03, protótipo:** clique na jornada ao vivo. Use a barra "Telas do protótipo": Conversa, Contratação, Painel, Níveis e Atraso. Mostre a proposta, com a instituição parceira como credora e o custo em reais.
- **07c, simulador:** comece no cenário-base (R$ 1 mi, 5% por semana, perda de 8%, margem de R$ 128,9 mil por mês). Depois deixe o cliente subir a perda até ver a margem zerar perto de 16,75%. Tudo ali é **projeção**: o selo abre as premissas.
- **09, riscos:** leia os riscos com a mesma calma das vantagens.

## Checklist de 5 minutos antes

- [ ] Notebook na tomada e notificações desligadas (modo "não perturbe").
- [ ] Abrir o HTML, apertar F e conferir que a capa ocupa a TV inteira, sem barra do navegador.
- [ ] Ir à grade (G), conferir que as telas aparecem e voltar à capa (Home).
- [ ] Na 07c, clicar em "Voltar ao cenário-base".
- [ ] Na 03, clicar em "Reiniciar" no protótipo.
- [ ] Testar o passador: avançar uma tela e voltar.
- [ ] Se for usar dois monitores, abrir a janela de notas e conferir que ela acompanha.
- [ ] Ter o PDF aberto em segundo plano (plano B) e o resumo A4 impresso para deixar com o cliente.

## Plano B

1. **O HTML não abre ou trava:** abra `entregas/vapti-apresentacao.pdf` em tela cheia. São as mesmas telas, em modo claro, uma por página. Sem o simulador, mostre a curva margem × perda (07b) e a Tabela A (07d).
2. **Sem computador:** use o resumo A4 (`entregas/vapti-resumo.pdf`) impresso, com os 6 números-chave, a estrutura e as 5 decisões.
3. **A TV corta as bordas:** a apresentação se ajusta a qualquer resolução. Se a TV estiver com "overscan", troque o modo de imagem para "Ajustar à tela" ou "Just scan".
4. **Para mandar depois:** no próprio HTML, o botão "Modo leitura" mostra tudo em rolagem contínua, inclusive no celular. Envie o HTML ou o PDF.

## O que ainda falta antes da reunião

- Nome do apresentador na capa: hoje aparece "[A CONFIRMAR]". Ajuste `config.apresentador` em `src/data/vapti.ts` e rode `npm run entregas`.
- Revise as pendências `[A CONFIRMAR]` listadas em `entregas/RELATORIO.md`.
