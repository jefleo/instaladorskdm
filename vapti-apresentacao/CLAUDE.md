# Vapti — site-apresentação para o investidor

**Missão:** produzir a apresentação da Vapti (capital de giro de ciclo curto para autônomos, modelo BaaS) para o cliente que vai aportar R$ 1 milhão.
Entregas: um HTML único offline com modo apresentação, simulador e protótipo de celular; PDF 16:9; resumo A4; guia de apresentação.
Visual de fintech de primeira linha, e cada número certo.

**Fonte da verdade: docs/BRIEFING.md, seção 4.** Números só em `src/data/vapti.ts`; fórmulas em `src/lib/modelo.ts`; texto em `src/content/`.

## Regras (seção 1 do briefing)
1. Fonte da verdade é a seção 4. Não invente número, data, nome, fonte ou citação; faltou, escreva `[A CONFIRMAR]`.
2. Todo número projetado leva o selo "Projeção", com premissas a um clique.
3. Toda taxa semanal aparece com a taxa efetiva mensal e o custo em reais de um exemplo de R$ 400.
4. Nada da seção 4.15 do briefing aparece em lugar nenhum (texto, nota, comentário, variável, metadado).
5. Português do Brasil, frases curtas, formato brasileiro (R$ 1,47 mi; 37,5%).
6. Funciona offline: nada de CDN; fontes e bibliotecas empacotadas.
7. Sem deploy, sem contas, sem envio, sem instalar fora do projeto sem perguntar.
8. Um commit por fase, mensagem em português.
9. Nada é "pronto" sem a verificação da fase (seção 10).
10. Desvantagens e riscos têm o mesmo peso visual das vantagens.

## Agentes (.claude/agents/)
analista-financeiro · roteirista · diretor-de-arte · dev-site · dev-dataviz · dev-prototipo · revisor-compliance · qa-entrega · kit-video

## Comandos
- `npm run dev` · `npm test` · `npm run build` (gera `dist/index.html`, arquivo único)
- `npm run entregas` (build + PDFs + capturas em `entregas/`)
