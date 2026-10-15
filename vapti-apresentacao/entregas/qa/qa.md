# QA de entrega: Vapti, apresentação

Data: 15/10/2026. Build: `dist/index.html` (1,22 MB), aberto via file:// com a rede bloqueada (só file:/data:/blob: passam).
Como rodar: `npm run entregas` (build, entregas e QA) ou `npm run qa` (só os testes). Os dados brutos ficam em `entregas/qa/resultados.json`.

## Entregas geradas

| Arquivo | Tamanho | Conferência |
| --- | --- | --- |
| `entregas/vapti-apresentacao.html` | 1,22 MB | Arquivo único: 0 `<script src>`, 0 `<link stylesheet>`, nenhum http(s) em @import/url() |
| `entregas/vapti-apresentacao.pdf` | 1,1 MB | 36 páginas de 1920×1080 (16:9), uma tela por página, modo claro |
| `entregas/vapti-resumo.pdf` | 96 KB | 1 página A4 |
| `entregas/qa/1920x1080/*.png` | 36 capturas | Todas as telas (o nome do arquivo é o id da rota: 00, 01, 01b… 13c) |
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

## Revisão visual (diretor de arte)

Revisão das 35 telas originais em 1920×1080, do PDF claro (pdftoppm a 40 dpi, folha de contato) e do resumo A4. Depois das correções o deck tem **36 telas / 36 páginas** (a 03b foi dividida); o resumo continua com 1 página.

### O que vi
- **Ar de template:** várias telas de continuação repetem o mesmo título de 76 px e trazem três ou quatro blocos de texto com barra lateral (06b, 08b, 05c, 10b). Funciona, mas é a fórmula de sempre, e o título se repete três a seis vezes por seção (07 aparece seis vezes).
- **Hierarquia:** no `Bloco grande` (01b, 02b, 06b, 08b), o título do bloco e o corpo tinham o mesmo tamanho (32 px); só o negrito separava um do outro. Na 03b havia dois visuais competindo numa só tela, sem um protagonista. Na 10c, o destaque "O que se vende" fica pequeno, solto à direita do título.
- **Leitura a 3 m:** o corpo da 03b caía para cerca de 18 px por causa da redução. A tabela da 07f (20,8 px), o "Margem negativa" da 07b (19,8 px), a dica da curva (18,7 px) e o "Saque" e os rótulos laterais da V08 (19,8 px) ficavam abaixo do mínimo. Os selos "sm" tinham de 13 a 16 px. Na Tabela A (07d), os números quebravam em duas linhas ("127,5 / mil").
- **Equilíbrio:** sobrava 20–35% do palco vazio embaixo em 06b, 08b, 10c, 07c, 07d e 07e. Na 07c, os botões de fase quebravam ("Meses 0–" / "12").

### Correções feitas
| Problema | Correção | Arquivo |
| --- | --- | --- |
| 03b reduzida a ~0,81 | Dividida em **03b (V08, planos de pagamento)** e **03c (V09, Pix Automático)**, cada uma com o cabeçalho completo, o visual centralizado e a escala um degrau acima no palco (`.ampliar`). As notas são por seção e não mudam; as rotas são geradas pelo registro | `src/sections/index.tsx` (03: 3 partes), `src/sections/Secao03Produto.tsx` |
| Visual sozinho com sobra embaixo | `Encaixe`/`Figura` ganharam a opção `centro`: centraliza na altura só quando o conteúdo cabe sem redução. Também criei a classe `.ampliar` (apoio 26, corpo 30, corpo-g 36, h3 56), que vale só em `.slide--fixo` | `src/sections/Slide.tsx`, `src/sections/secoes.css` |
| 07c: simulador com vazio e botões quebrando | "Perda" e "Fase" passaram a ocupar a linha inteira dos controles; os botões de fase têm o período em linha própria, sem quebra (`whitespace-nowrap`); o simulador fica centralizado. Conferi também o estado extremo (alerta), que cabe sem redução | `src/components/viz/Simulador.tsx`, `src/sections/Secao07Numeros.tsx` |
| 07d: números quebrando | `td` sem quebra no modo largo; tabela centralizada | `src/components/viz/TabelaCapital.tsx` |
| 07f a 20,8 px | A coluna dos rótulos passou de 34% para 42%, e nenhuma linha quebra mais. A tabela cabe sem redução (22 px ou mais) | `src/sections/visuais/Medidas.tsx` |
| 07b "Margem negativa" 19,8 px | Agora a 22 px, em duas linhas, entre o equilíbrio e a borda. A dica da curva passou de 0,85f para f | `src/components/viz/CurvaMargemPerda.tsx` |
| V08: "Saque" e rótulos laterais a 0,9f | Agora a 1f (22 px ou mais) | `src/components/viz/PlanosPagamento.tsx` |
| Selos de 13 a 16 px | Novo token `--fs-selo` (18 px no palco, 13 px no tablet, 12 px no celular, 9 px na folha A4). Vale para o Selo "sm", a etiqueta ESTIMATIVA e a tag RECOMENDADO | `src/styles/tokens.css`, `src/components/base/Selo.tsx`, `src/components/viz/comum.tsx`, `src/components/viz/PlanosPagamento.tsx`, `src/shell/shell.css` |
| 07e com sobra | V17 centralizado e um degrau acima (`ampliar`) | `src/sections/Secao07Numeros.tsx` |
| 06b, 08b, 10c com sobra | Corpo centralizado na altura (`corpoClassName="justify-center"`) | `Secao06Preco.tsx`, `Secao08Eficiencia.tsx`, `Secao10Crescimento.tsx` |
| Bloco grande sem hierarquia | O título do bloco grande passou de 32 para 44 px (`text-h3`); o corpo continua com 32 px | `src/sections/Slide.tsx` |

Nenhum número, dado ou texto de conteúdo foi alterado. Os selos continuam em pílula discreta, Zippi segue em cinza e só em texto, e as vantagens e os riscos continuam com o mesmo peso. `semAnimacao()` e o modo claro de impressão continuam como antes, conferidos no PDF.

**Verificação:** `npx tsc -b` ok; `npx vitest run` 135/135; `npm run entregas` e `npm run qa` sem erros: console 0, rede 0, teclado ok (35 passos), 0 cortes e 0 textos fora do palco em 1920, simulador sem falhas, protótipo ok, rolagem horizontal de 0 px em 390. Abaixo de 22 px no palco ficaram só o celular da 03 (mock em tamanho real) e os selos de 18 px (etiquetas). As 3 sobreposições são as mesmas, já aceitas.

### O que ficou
- 03, celular em escala real (11–17 px): é um mock de protótipo, aceito.
- O título da seção se repete em todas as telas de continuação. Uma alternativa seria usar o cabeçalho "linha" a partir da segunda tela, mas isso muda o ritmo do deck inteiro e fica como decisão do orquestrador.
- 06b, 08b e 10c continuam sendo telas de texto, só reequilibradas. Para ganharem força, precisariam de um visual próprio.
- 08b e 06b: "R$ 1,05" e "R$ 16,67" quebram entre "R$" e o número. A correção é um espaço não separável nos textos de `src/content`, que não alterei.
- 03c: os títulos "Autorização única" e "Aviso 10 dias antes" quebram em duas linhas com a escala ampliada. Está legível, aceito.
