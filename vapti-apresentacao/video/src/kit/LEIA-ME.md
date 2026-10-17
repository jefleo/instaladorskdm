# Kit do filme Vapti — API para as cenas

O filme é um site React que é **função pura do tempo**: o renderizador chama `window.__vapti.setTime(t)` e fotografa o quadro. Cada cena (`video/src/scenes/AtoN.tsx`) lê `t` do contexto e devolve o desenho daquele instante. Contrato completo: `video/SPEC.md`.

```tsx
// video/src/scenes/Ato1.tsx — esqueleto de um ato
import { projeto } from "../../../src/data/vapti";
import { Camada, Camera, Numero, Rotulo, useEnfase, useFrase } from "../kit";

export const frases: string[] = ["F001", "F002", /* … */ "F009"];

export default function Ato1() {
  const f1 = useFrase("F001");
  const e1 = useEnfase("F001");
  return (
    <Camera de={{ zoom: 1 }} para={{ zoom: 1.04 }} t0={f1.t0} t1={f1.tProxima}>
      <Camada z={1.5}>
        <Numero valor={projeto.saqueMedio.valor} final={projeto.saqueMedio.rotulo} formato="brl0" tParada={e1.tE + 0.6} tamanho={400} />
      </Camada>
      <Camada z={0}>
        <div className="absolute" style={{ left: 120, top: 930 }}>
          <Rotulo texto={f1.f.tela} em={e1.tE} />
        </div>
      </Camada>
    </Camera>
  );
}
```

Importe tudo de `../kit`. Números só de `src/data/vapti.ts` (ou `src/content/ui.ts → prototipo.ficticio` no celular). Cores e fontes já vêm do `tokens.css` (Tailwind funciona: `text-verde`, `font-mono`, `bg-superficie` …).

## 1. Regras que o kit não consegue garantir por você

- **Pureza**: nada de `Date.now`, `Math.random`, `performance.now`, `setTimeout`, `requestAnimationFrame`, `useState/useEffect` para animar, CSS `transition`/`animation` (o `video.css` as desliga no palco). Aleatório só com `mulberry32(seed)` (calcule fora do componente ou memoize por seed). Teste: o mesmo `t` tem de dar o mesmo PNG, venha de onde vier.
- **Seu ato é desenhado de `fronteira anterior − 0,35 s` até `próxima fronteira + 0,35 s`** (crossfade de 0,7 s; o ato que entra fica por cima, com fundo tinta). Antes da primeira frase e depois da última, mostre um estado parado bonito (os `prog`/`spring` do kit já seguram o fim).
- **Cantos reservados**: canto superior esquerdo = `<Capitulo>` (2 s no início do ato, em `CAPITULO`); canto superior direito = `<MarcaCanto>` a partir do fim da F009 (`MARCA_CANTO`). Mantenha o conteúdo abaixo de y ≈ 140 px. **Não desenhe** capítulo, marca do canto, grão, vinheta, graduação, card final, preto inicial nem legenda: o `Film` já desenha.
- **Faixa da legenda**: na versão legendada, os 150 px de baixo (`ZONA_LEGENDA`) recebem a legenda; não ponha números ali (rótulos pequenos podem).
- **≤ 8 palavras na tela**; números e símbolos não contam. Em `video:dev`, `Palavra`/`Rotulo` avisam no console quando passa.
- **Selos colados ao número**: Projeção (F058–F066, F078–F082), Ilustrativo, Estimativa (Dealroom) e Protótipo (celular).
- **Zippi sempre em cinza, só texto**; nada de logotipos de terceiros, moedas, cofrinhos, dinheiro chovendo, rostos reais. Verde = Vapti/entrada; coral = risco/perda; azul-gelo = dado neutro. Riscos com o mesmo peso visual das vantagens (Cartao/Barra têm o mesmo brilho em verde e coral).
- **Algo muda a cada 3–5 s**; o elemento principal entra em `tE` (ênfase); contadores **param** em `tParada` e ficam ≥ 1,5 s; respiro de 0,3–0,6 s antes dos números importantes; nada pisca mais de 3×/s.

## 2. Prévia e verificação

- `npm run video:dev` → `http://localhost:5173/?t=45&hud=1` (filme) ou `?demo=1` (demonstração do kit, ~8 s + card).
  Teclas: espaço toca/pausa · ←/→ ±1 s (Shift ±5 s) · `,` `.` ±1 quadro · Home · End (card final) · H liga o HUD.
- Parâmetros: `?w=960&h=540` (escala), `?rascunho=1` (sem grão), `?legenda=1`.
- Captura: `window.__vapti.pronto` → `setTime(t)` → screenshot. `npx tsc -b` checa o vídeo junto com o site.
- O exemplo completo de uso está em `video/src/scenes/_demo.tsx`.

## 3. Contexto (tempo e timeline) — `contexto.tsx`

| API | Devolve |
| --- | --- |
| `useFilme()` | `{ t, fps, tl, ato, iAto, frase, ltFrase, proxima, anterior, rascunho, legenda }` — `ato` é o ato DA SUA cena (vale no crossfade). `frase` é a frase corrente do filme (a última que começou). |
| `useT()` | só `t` |
| `useFrase("F008")` | `{ f, t0, t1, tProxima, tE, ativa, lt, p }` — `t0/t1` = início/fim da fala; `tProxima` = início da frase seguinte; `ativa` = `t0 ≤ t < tProxima`; `lt = t − t0`; `p` = progresso 0..1 da fala; `f` traz `texto`, `tela`, `selo`, `layout`, `palavras[]`, `direcao` … |
| `useEnfase("F008")` | `{ tE, passou, lt }` — `tE` = instante absoluto da ênfase |
| `useJanela("F003", "F007")` | `{ t0, t1, ativa, lt }` de um bloco de frases (t1 = início da frase depois da última) |
| `useAto(id?)` | `{ a, t0, t1, lt, p }` |
| `estadoFrase(tl, id, t)` | versão pura de `useFrase` |

Ids inexistentes lançam erro (a cena mostra o erro na tela e no console). Os tempos vêm de `video/build/timeline.json` e **mudam** quando a voz é regenerada: nunca digite segundos absolutos; ancore tudo em `t0`, `tE`, `t1`, `tProxima`.

## 4. Tempo e easing — `tempo.ts`

```ts
clamp(x, a, b) · clamp01(x) · lerp(a, b, p)
prog(t, t0, t1)                       // 0..1 limitado (janela vazia = degrau)
mapear(t, t0, t1, v0, v1, curva?)     // ex.: mapear(t, tE, tE + .4, 40, 0, ease.outCubic)
envelope(t, t0, t1, entrada=.35, saida=.35, curva?) // 0..1 para opacidade de quem vive numa janela (t1 = Infinity: não sai)
ease.linear | inCubic | outCubic | inOutCubic | outQuint | outExpo | inOutExpo | outBack | inOutSine | saida   // (p) => número
ease.saida                            // = --ease-saida do site (cubic-bezier .22,1,.36,1)
spring(tSeg, { k=170, d=26, m=1, v0=0 })  // mola analítica; tSeg = SEGUNDOS desde o disparo; pode passar de 1
bezier(x1, y1, x2, y2)                // curva CSS própria
stagger(i, passo, inicio=0)           // inicio + i*passo
quadro(t, fps=30) · oscilar(t, periodo, fase=0) (−1..1)
mulberry32(seed) → () => [0,1) · hash(n, seed) · ruido(x, seed) (−1..1 suave)
```

Receita de entrada: `const s = spring(t - tE, { k: 220, d: 20 }); transform: \`translate(0, ${(1 - s) * 40}px)\``.

## 5. Câmera e parallax — `Camera.tsx`

```tsx
<Camera de={{ x: 0, y: 0, zoom: 1, rot: 0 }} para={{ zoom: 1.05, y: -10 }} t0={…} t1={…} curva={ease.inOutSine}
        chaves={[{ t, x, y, zoom, rot, curva }]}   // alternativa a de/para (tempos absolutos)
        deriva={6} seed={1} foco={[960, 540]}>
  <Camada z={2} desfoque={4} opacidade={…}>  fundo: move 1/(1+z) da câmera  </Camada>
  <Camada z={0}>  plano de foco  </Camada>
  <Camada z={-0.3}>  primeiro plano (move mais)  </Camada>
</Camera>
```

Filhos usam coordenadas do palco (1920×1080, `position: absolute`). Push-in de 3–5% por plano basta; com conteúdo perto das margens, não passe de 4%. `deriva` = respiração orgânica lenta (4–8 px), nunca tremor. `useCamera()` dá a pose atual. `desfoque` usa `filter: blur` — só em camadas com pouco conteúdo (número gigante do L5), ≤ 8 px.

## 6. Acabamento — `acabamento.tsx` (o Film já põe grão, vinheta e graduação)

```tsx
<Respiracao tom="verde" x={960} y={540} raio={520} intensidade={0.16} periodo={6} opacidade={…} achatar={0.75} />  // luz que pulsa devagar
<Halo tom="verde" x={…} y={…} w={600} h={300} intensidade={0.2} escala={1} />  // brilho radial barato (textura)
<Poeira n={28} bokeh={4} seed={7} tom="texto" area={{x,y,w,h}} velocidade={10} opacidade={1} />  // partículas deterministas (≤ 80)
<Graduacao tom="frio|quente|neutro" intensidade={1} />   // só se a cena quiser reforçar o tom do ato
<Vinheta forca={0.55} /> · <Grao forca={1} />            // já globais
```

Tom por ato (Film): A1 quente · A2/A3 neutro · A4 quente · A5–A7 frio · A8 neutro · A9 quente.

## 7. Tipografia — `tipografia.tsx`

```tsx
<Palavra texto="dia de trabalho × dia perdido" frase="F002" destaque="dia perdido" tomDestaque="coral"
         em? passo={0.08} adiantar={0.04} modo="mascara|subir|foco" dur={0.55} saida? tom="texto" cor? brilho={0.8} as="span" />
```
Cada palavra entra quando é dita (casada com `frase.palavras`, em ordem); sem par na fala (números, símbolos), entra `passo` depois da anterior. `destaque`: `true` (padrão) = ênfase da frase; texto(s) = essas palavras; `false` = nenhuma.

```tsx
<Titulo texto="Quem decide é a perda" em={tE} destaque="perda" tomDestaque="coral" tamanho="display|titulo|h3|gigante|kpi|px" alinhar="esquerda|centro|direita" largura={900} />
<Rotulo texto={f.tela} em={tE} tom="verde" destaque? traco variante="texto|eyebrow" tamanho? saida? />   // traço vupt + texto curto
<Numero valor={fase1.margemMes.valor} final={fase1.margemMes.rotulo} formato="mi" tParada={tE + 0.5} dur={1.2} de={0}
        tamanho={168} tom="verde" alinhar="esquerda" escalaUnidade={0.5} pulso sublinhar? em? saida? curva? brilho? />
<Nota>Fonte: IBGE, citado por Startups.com.br</Nota>   // 22 px, texto-3
```

`Numero`: conta de `de` até `valor` em `[tParada − dur, tParada]` e **a partir de `tParada` mostra exatamente `final`** (passe o `rotulo` de `vapti.ts` para casar com o roteiro). Formatos: `"int"` (24.000.000), `"brl"` (R$ 1.234,56), `"brl0"` (R$ 400), `"pct"` (37,5%), `"pct0"`, `"pct2"` (16,75%), `"mi"` (R$ 1,47 mi / R$ 128,9 mil) — todos de `src/lib/formato.ts` — ou uma função `(v) => string`. "R$", "mi", "mil", "%" saem menores (`escalaUnidade`). A largura é reservada pelo texto final (não pula). Pulso de "trava" e brilho verde quando para. Utilidades: `normalizar`, `contarPalavras`, `temposDasPalavras`, `formatador`.

## 8. Selos e marca

```tsx
<Selo tipo="projecao|ilustrativo|estimativa|prototipo" em={…} rotulo? tamanho={22} saida? />
tipoDoSelo(f.selo)  // "Projeção" → "projecao" (ou null)
<MarcaVapti tamanho={160} em={…} slogan? variante="cor|mono" brilho={0.6} alinhar="esquerda|centro" saida? />  // V01: letras sobem, haste cresce, pingo vupt chega com rastro
```

F009: leve a marca grande até o canto e solte-a em `tMarcaCanto(tl)` (= fim da F009), na caixa `MARCA_CANTO` (borda direita a 120 px, topo 58 px, letra de 40 px); a `<MarcaCanto>` global aparece ali nesse instante.

## 9. Formas — `formas.tsx`

```tsx
<svg width={1920} height={1080} className="absolute inset-0">
  <Tracado d="M…" em={tE} dur={0.9} tom="verde" espessura={4} tracejado? brilho? preencher="var(--cor-verde)"? progresso? saida? />
</svg>
<Curva pontos={[[0, 40], [180, 92], …]} largura={940} altura={400} em={…} dur={1.4} tom="verde" espessura={5}
       area ponta tracejado? base? progresso? style={{ position: "absolute", left, top }}>
  {/* extras SVG atrás da linha: eixos, linha do zero… */}
</Curva>
<Barra valor={v} max={m} comprimento={440} espessura={56} orientacao="v|h" em={…} mola tom="verde" estilo="solido|tracejado" brilho? raio={6} saida?>
  {/* rótulo preso à ponta */}
</Barra>
<Grade tipo="pauta|quadriculado|chao" passo={64} em? dur={1.2} opacidade={1} deriva={0} area? horizonte={600} />
<Cartao em={…} x? y? largura? altura? tom="verde|coral|azul|cinza" brilho={0} entrada="subir|escala|esquerda|direita" padding={32} raio={20} saida?>…</Cartao>
<Seta de={[x0, y0]} para={[x1, y1]} curvatura={0.25} em={…} dur={0.6} tom="texto" espessura={3} tracejado? cabeca={16} saida? />
```

`interpolarMonotona(pontos)` → `{ caminho, y(x) }` (curva sem picos falsos; use `y(x)` para pôr marcadores na linha). Pontos das curvas são **geometria**: dados exibidos vêm de `vapti.ts`; desenho que não é dado leva selo Ilustrativo. Cinza = terceiros → `tom="cinza"` já sai tracejado na `Barra`.

## 10. Celular — `CelularMoldura.tsx`

```tsx
<CelularMoldura em={…} x={1330} y={130} largura={330} giro={-7} brilho={0.45} fundoTela? saida?>
  {/* tela: dados de prototipo.ficticio; selo "Protótipo" fora do aparelho */}
</CelularMoldura>
```
Reusa `src/components/base/MolduraCelular` (sem marca). `alturaCelular(largura)` dá a altura total. Componentes do protótipo do site (`src/components/prototipo/*`) usam `motion` e estado: **não** use dentro do filme; recrie a tela com elementos estáticos animados por `t`.

## 11. Layout — `layout.tsx`

`PALCO` (1920×1080, margem 120) e `ZONAS` por layout (SPEC §5): `ZONAS.L1.centro`, `ZONAS.L2.esquerda/direita`, `ZONAS.L3.visual/rotulo`, `ZONAS.L4.tela`, `ZONAS.L5.fundo/frente`. `<Zona r={ZONAS.L2.direita} depurar?>…</Zona>` cria a caixa absoluta.

## 12. Desempenho (medido)

Chromium por software, sem GPU, máquina de 4 núcleos compartilhada. `setTime` ≈ 20–30 ms. Quadro (setTime + captura PNG 1920×1080):

| Conteúdo | `page.screenshot({type:"png"})` | CDP `Page.captureScreenshot({format:"png", optimizeForSpeed:true})` |
| --- | --- | --- |
| Filme com cenas provisórias (leve) | ~314 ms | ~135 ms |
| `?demo=1` (todas as primitivas juntas, câmera mexendo) | ~580 ms | ~350 ms |

As duas capturas dão **os mesmos pixels** (conferido pelo hash do RGBA); a rápida só comprime menos o PNG. O grão deixa o PNG padrão ~130 ms mais caro por quadro. O que mais pesa depois disso: rasterizar o quadro inteiro quando a câmera mexe, transformações 3D, gradientes radiais grandes em CSS.

- Use `translate(x, y)` 2D, **não** `translate3d`/`rotateX/Y` (3D promove camadas e encarece todo quadro; o celular e o chão já usam 3D de propósito).
- Brilho amplo = `<Halo>`/`<Respiracao>` (textura pré-desenhada), não `radial-gradient` gigante nem `text-shadow` enorme.
- **Não use `will-change`**: em camada que muda de escala, a rasterização passa a depender da história e o quadro deixa de ser determinista (testado).
- `filter: blur` só em áreas pequenas; `mix-blend-mode` e `mask-image` em tela cheia, não.
- Centenas de nós animados, não: poeira ≤ 80; listas ≤ ~40 elementos que mexem por quadro.
