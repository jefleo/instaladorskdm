# QA de entrega: Vapti, apresentação

Data: 15/10/2026. Build: `dist/index.html` (1,22 MB), aberto via file:// com a rede bloqueada (só file:/data:/blob: passam).
Como rodar: `npm run entregas` (build, entregas e QA) ou `npm run qa` (só os testes). Os dados brutos ficam em `entregas/qa/resultados.json`.

## Entregas geradas

| Arquivo | Tamanho | Conferência |
| --- | --- | --- |
| `entregas/vapti-apresentacao.html` | 1,22 MB | Arquivo único: 0 `<script src>`, 0 `<link stylesheet>`, nenhum http(s) em @import/url() |
| `entregas/vapti-apresentacao.pdf` | 1,1 MB | 35 páginas de 1920×1080 (16:9), uma tela por página, modo claro |
| `entregas/vapti-resumo.pdf` | 96 KB | 1 página A4 |
| `entregas/qa/1920x1080/*.png` | 35 capturas | Todas as telas (o nome do arquivo é o id da rota: 00, 01, 01b… 13c) |
| `entregas/qa/1440x900/`, `entregas/qa/1280x720/` | 8 capturas cada | Telas 00, 03, 04, 07, 07c, 09, 10 e 12 |
| `entregas/qa/390x844/` | topo.png (2x), pagina-inteira.png | Modo leitura no celular |
| `entregas/qa/simulador-extremo.png`, `prototipo-03.png`, `prototipo-prototipo.png` | | Estado final dos testes do simulador e do protótipo |

Scripts: `scripts/entregas.mjs`, `scripts/qa.mjs` e `scripts/comum.mjs`. No `package.json` entrou `"qa": "node scripts/qa.mjs"`.

## Resultado por teste

| Teste | Resultado |
| --- | --- |
| Rede bloqueada | **Passou.** 0 requisições abortadas, nem nas entregas nem no QA |
| Console (35 telas, ?print=1, ?resumo=1, ?notas=1, #/prototipo, leitura 390) | **Passou.** 0 erros, 0 warnings, 0 exceções |
| Teclado | **Passou depois da correção 1.** Avança do início ao fim com →, Espaço e PageDown, conferindo o hash a cada um dos 34 passos. Não passa do fim nem volta antes do início. ←/PageUp voltam; Home e End funcionam. G abre a grade, as setas mais Enter vão à tela escolhida, Esc fecha. N abre as notas e Esc fecha. ? abre a ajuda e Esc fecha. No slider, ← muda o valor sem trocar de tela, e PageDown troca de tela |
| Texto cortado em 1920×1080 | **Passou depois da correção 2.** 0 cortes, 0 textos fora do palco |
| Sobreposição em 1920×1080 | 3 sobreposições detectadas e revisadas nas capturas. São só caixas de linha encostadas, sem texto colidindo: 07b (rótulo "Perda de 8%/12%" sobre o valor, no gráfico) e 07c (KPI "R$ 128,9 mil" com line-height 1,05 sobre a nota logo abaixo) |
| Menor fonte no palco 1920 (meta ≥ 22 px) | **Não passou.** Tamanho efetivo, já contando o transform do encaixe e o viewBox dos SVG. Exceções abaixo |
| Contraste AA | **Passou, com 1 exceção aceita.** Só falhou o botão "Voltar ao cenário-base" desabilitado (opacidade 0,45; 4,16:1 no escuro, 2,96:1 no claro). Controle desabilitado é isento no WCAG 1.4.3. Observação: fundos em gradiente ou imagem foram aproximados pela cor de fundo |
| Simulador | **Passou.** Cenário-base mostra "R$ 1,47 mi", "R$ 294,7 mil", "R$ 128,9 mil" e "16,75%". Foram 36 combinações: capital mínimo/máximo (R$ 150 mil e R$ 1 mi) × taxa 4% e 6% × perda 4%, 8% e 20% × fases 1, 2 e 3. Nenhum NaN, Infinity, undefined ou null. O alerta aparece sempre que perda ≥ equilíbrio e nunca sem necessidade. Na varredura de perda de 4% a 20% no cenário-base, o alerta liga a partir de 17% (equilíbrio 16,75%) |
| Protótipo (#/03 e #/prototipo) | **Passou.** Fluxo completo sem erro: conversa (áudio, link) → contratação nas 7 etapas (espera a análise, marca o aceite) → painel → níveis (todos os toques) → atraso (todas as opções) → voltar ao painel → reiniciar |
| Arquivo único | **Passou.** 1,22 MB (< 5 MB). Sem referências externas em script, link, @import ou url() |
| Termos da seção 4.15 | **Passou.** 0 ocorrências em 102 arquivos (src/, entregas/*.html, index.html, scripts/). docs/BRIEFING.md, .claude/ e node_modules ficaram de fora. Em scripts/qa.mjs a lista de termos está em base64, para que as palavras não apareçam como texto no projeto |
| Leitura 390×844 | **Passou.** Sem rolagem horizontal da página (0 px) |
| PDFs (olhados página a página: pdftoppm a 40 dpi, folhas de contato, e páginas em 72–110 dpi) | **Passou.** Modo claro legível, uma tela por página, nada cortado. O resumo cabe numa A4 com folga |

### Fontes abaixo de 22 px no palco 1920 (em aberto)
- **Selos pequenos** (`Selo tamanho="sm"`): PROJEÇÃO com 15,4 px em 01, 07, 07b, 07c, 07d, 07e e 10. ESTIMATIVA com 13,6 px em 08 e 16,2 px em 06. ILUSTRATIVO com 15,4 px em 01. RECOMENDADO com 13,1 px em 03b.
- **03, celular em escala real** (moldura de 390 px): de 11 a 17 px ("TRANSCRIÇÃO", "HOJE", "Atendimento", balões de 16 px). O selo PROTÓTIPO tem 12,9 px. A numeração 01–05 do trilho tem 17,7 px. É um mock de app; para melhorar, seria preciso ampliar o celular, o que mexe no layout da seção.
- **03b**: o `Encaixe` reduz o conteúdo para cerca de 0,81, e o corpo cai para 17,8 px (gráfico de parcelas) e 19,3 px (passos do Pix Automático). É o caso mais relevante, porque há muito conteúdo numa tela só. Sugestão: dividir 03b em duas telas ou enxugar o texto.
- **07f**: o encaixe reduz para cerca de 0,95 e a legenda e o cabeçalho da tabela ficam com 20,8 px.
- **07b**: o rótulo "Margem negativa" do gráfico tem 19,8 px.

### Achados do modo impressão (claro)
- Os 9 "cortes" na página 03 são do celular estático: a lista "Vencimentos (fictícios)" fica dentro da área rolável da tela do app, como num celular de verdade. Aceito.
- 03b e 07f aparecem como corte só na medição por rolagem, por causa do encaixe com transform. Pela medição de retângulos não há corte.

## O que foi corrigido

1. **Passador travado no simulador**, em `src/components/viz/Simulador.tsx`. Com o foco num slider, o `onKeyDown` interrompia também PageUp e PageDown, e o passador do apresentador não trocava de tela. Isso contrariava a regra do shell ("Passador sempre navega, mesmo com foco num controle"). Agora só as setas e Home/End ficam no slider.
2. **Risco 07 cortado na tela 09b**, em `src/sections/Secao09VantagensRiscos.tsx`. O cartão "Riscos e mitigação" (riscos 4 a 7) tinha `overflow: hidden`, e a linha "MITIGAÇÃO Parecer jurídico antes de assinar" saía cortada na borda de baixo, tanto em 1920 quanto no PDF. As faixas foram redistribuídas: 09b com os riscos 4 a 6, 09c com os riscos 7 a 10. As vantagens e a quantidade de telas não mudaram. Conferido nas capturas e no PDF (páginas 25 e 26).

Depois das correções rodaram `npx tsc -b` (ok), `npx vitest run` (135/135), `npm run build` e de novo as entregas e o QA, todos verdes nos itens acima.

## Problemas em aberto, por gravidade
- **Média:** fontes abaixo de 22 px. A principal é a 03b reduzida (17,8–19,3 px de corpo). Os selos "sm" (13–16 px) aparecem em várias telas.
- **Baixa:** tela 07c com cerca de 25% do palco vazio embaixo. Os botões de fase quebram mal ("Meses 0–" / "12").
- **Baixa:** no modo leitura em 390 px, a tabela das três fases (07f) e a Tabela A precisam de rolagem lateral dentro do próprio bloco. A página não rola na horizontal.
- **Informativo:** o celular da 03 está em tamanho real de app (11–17 px), o que é coerente com um protótipo.
