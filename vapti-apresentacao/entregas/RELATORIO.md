# Relatório — apresentação Vapti

15/10/2026 · branch `claude/vapti-presentation-orchestration-x6xnp4` · pasta `vapti-apresentacao/`

## Entregas

| Prioridade | Arquivo | Estado |
| --- | --- | --- |
| P0 | `entregas/vapti-apresentacao.html` | Pronto. Arquivo único de 1,28 MB que abre com duplo clique e sem internet. Testado com a rede bloqueada: 0 requisições externas. |
| P0 | `entregas/vapti-apresentacao.pdf` | Pronto. 36 páginas 1920×1080, modo claro, uma tela por página; aviso na última. |
| P0 | `entregas/vapti-resumo.pdf` | Pronto. A4, 1 página: 6 números-chave, estrutura, 5 decisões, 3 riscos e aviso. |
| P0 | `entregas/COMO-APRESENTAR.md` | Pronto. |
| P1 | `entregas/qa/` | Pronto. 36 capturas em 1920×1080 e telas-chave em 1440×900, 1280×720 e 390×844, mais `qa.md` e `resultados.json`. |
| P1 | `entregas/RELATORIO.md` | Este arquivo. |
| P2 | `entregas/kit-video/` | **Não feito**: falta `docs/ROTEIRO_VIDEO.md` (ver abaixo). |

Para regerar tudo depois de mudar dados ou texto: `cd vapti-apresentacao && npm install && npm run entregas && npm run qa`.

## O que foi feito, por fase

- **Fase 0:** briefing salvo, `CLAUDE.md`, os 9 agentes em `.claude/agents/` e o projeto em Vite, React, TypeScript e Tailwind v4, com build em arquivo único.
- **Fase 1:** dados (`src/data/vapti.ts`), modelo (`src/lib/modelo.ts`) e testes. Todas as células das Tabelas A e B e todas as taxas efetivas da 4.5 batem com as fórmulas da 4.8, sem nenhuma divergência. Hoje são 135 testes passando. Também saíram o texto das 14 seções com notas do apresentador e a identidade visual provisória (tokens, componentes base e página `#/estilo`).
- **Fase 2:** 36 telas com modo apresentação, notas (painel e segunda janela), grade, modo leitura, impressão e resumo A4. Entraram o simulador ao vivo, 15 gráficos e diagramas (V02–V20 e Tabela A) e o protótipo de celular clicável com 5 telas e jornada de 7 etapas.
- **Fase 3:** duas revisões de compliance (texto e site inteiro). O bloqueio e todas as correções foram resolvidos; o resultado final foi "aprovado". A revisão visual do diretor de arte dividiu a 03b e subiu as fontes para ≥ 22 px no palco (os selos ficaram em 18 px). Também centralizou as telas com espaço vazio.
- **Fase 4:** QA automatizado em `scripts/qa.mjs`:
  - 0 erros de console;
  - navegação completa pelo teclado;
  - 0 textos cortados em 1920;
  - simulador com 36 combinações extremas, sem NaN, e o cenário-base mostra exatamente R$ 1,47 mi · R$ 294,7 mil · R$ 128,9 mil · 16,75%;
  - protótipo percorrido do começo ao fim;
  - busca pela lista proibida da 4.15: 0 ocorrências.

## Critérios de aceite (seção 10)

- [x] Testes do modelo passam; o simulador reproduz as Tabelas A e B.
- [x] `revisor-compliance`: zero bloqueios.
- [x] Arquivo único abre offline, testado com a rede bloqueada.
- [x] Modo apresentação completo pelo teclado em 1920×1080, sem texto cortado.
- [x] PDF 16:9 e resumo A4 conferidos visualmente, página por página.
- [x] Desvantagens e riscos com o mesmo peso visual das vantagens (seção 09: cartões verde e coral idênticos).
- [x] Fontes citadas (22, com link), aviso presente e pendências listadas abaixo.
- [x] Busca no projeto inteiro: nada da seção 4.15. O próprio `docs/BRIEFING.md` fica fora da busca, por ser a fonte.

## Pendências [A CONFIRMAR]

1. **Nome do apresentador** na capa e nas notas: `config.apresentador` em `src/data/vapti.ts`.
2. **Cronograma das próximas 4 semanas** (seção 12): o briefing não traz. A tela usa só o que a seção 4 permite: começar contratos e verificação na Meta e cotar parceiras e fornecedores.
3. **Regra de descida de nível** (gamificação): o briefing não define. Aparece marcada no protótipo e numa resposta das notas.
4. **Condições do reparcelamento** (tela de atraso do protótipo): o briefing só diz "no 7º dia de atraso".
5. **Nome do cliente** na capa: está genérico ("Apresentação para os sócios investidores").

## Decisões tomadas sem consultar

- **Perguntas da seção 11 sem resposta:** segui o padrão do briefing (identidade provisória, TV 1920×1080, 30 minutos, capa genérica). Trocar a marca ou o nome do cliente é rápido: o nome do cliente fica em `config.cliente` e as cores em `src/styles/tokens.css`.
- **Pasta própria:** o projeto ficou em `vapti-apresentacao/`, porque o repositório já continha um instalador sem relação.
- **Skills ausentes:** `frontend-design`, `web-artifacts-builder` e `webapp-testing` não estavam instaladas na sessão na nuvem, e não parei para pedir. Usei `vite-plugin-singlefile` (alternativa prevista na seção 7) e Playwright direto. O campo `skills:` dos agentes manteve os nomes do briefing; só `pdf` virou `anthropic-skills:pdf`.
- **Agentes:** os 9 agentes foram criados em `.claude/agents/`, mas o Claude Code só os reconhece ao abrir uma sessão nova. Nesta sessão, cada papel rodou como agente genérico com o prompt do respectivo arquivo.
- **Princípio "nada aleatório" (4.6):** reescrito como "Nada aleatório: nenhum benefício depende de sorte". A redação original usava uma palavra que está na lista proibida da 4.15, que vale "em qualquer lugar".
- **Juros da Zippi em reais:** um agente calculou "R$ 40 em R$ 400" para a Zippi. Removi o valor, porque não está no briefing; a coluna mostra "—", com nota de que o preço da Zippi varia por perfil.
- **Mensagens de WhatsApp por saque:** a tela mostra "4 a 6", como no briefing. O 5 é usado só como ponto médio no desenho do gráfico.
- **Premissas derivadas:** para o simulador escalar as fases 2 e 3 com o capital, usei as proporções da Tabela B (carteira 4x e 15x a da fase 1; sênior de 75% e 80%). Com R$ 1 mi elas reproduzem a tabela exatamente, e estão no popover de premissas.
- **Título da seção 13:** o briefing não sugere; usei "Cada número tem origem declarada".
- **Telas por seção:** o briefing pede 14 seções. Para nada ficar abaixo de 22 px nem cortado, várias viraram 2 a 6 telas, num total de 36. As notas e o tempo continuam por seção (cerca de 20 minutos).

## O que revisar antes da reunião

1. Ensaie uma vez no modo apresentação, de preferência na TV, com o passador.
2. Confira os números da seção 07 e o simulador. É a parte em que o cliente vai mexer.
3. Leia as notas (N) das seções 05, 06 e 09: são as que geram perguntas jurídicas e de preço.
4. Preencha o nome do apresentador e, se quiser, o do cliente. Depois rode `npm run entregas`.

## O que ficou de fora, e por quê

- **Kit de vídeo (P2):** o agente `kit-video` depende de `docs/ROTEIRO_VIDEO.md`, que não foi enviado. Com o roteiro em mãos, dá para gerar os PNG 4K e o `visuais.json` a partir das telas. Os IDs V01–V24 já estão no código.
- **Deploy (P3):** não pedido.
- **Melhorias visuais anotadas pelo diretor de arte, sem bloquear:**
  - títulos repetidos nas telas de continuação de uma mesma seção;
  - 06b, 08b e 10c só de texto;
  - "R$" quebrando de linha antes do número em 2 telas;
  - o celular da tela 03 com texto em escala real de app (11 a 17 px), o que é intencional.
