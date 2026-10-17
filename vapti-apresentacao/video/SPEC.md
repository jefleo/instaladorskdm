# Vídeo Vapti — contrato de produção

Vídeo de apresentação de cerca de 7:30, 16:9, 1920×1080, 30 fps, **sem apresentador na tela**, com narração e motion design cinematográfico.
Fonte do conteúdo: `docs/ROTEIRO_VIDEO.md` e `docs/VAPTI_roteiro_video.json` (91 frases F001–F091, 9 atos, visuais V01–V24).
Fonte da verdade dos números: `docs/BRIEFING.md` seção 4 → `src/data/vapti.ts` (importe daí; nada de número digitado em cena, salvo geometria e os dados fictícios do protótipo em `src/content/ui.ts → prototipo.ficticio`).
Ajustes de fala por conformidade: `video/ajustes-fala.json` (têm prioridade sobre o roteiro).

Regras do briefing que valem aqui: nada da seção 4.15 (texto, código, comentário, nome de variável); toda projeção com selo "Projeção"; toda taxa semanal exibida com a efetiva mensal e o custo em reais de R$ 400; Zippi sempre em cinza e só texto; nenhum logotipo de terceiros (nem Pix, WhatsApp, bancos, Banco Central); desvantagens e riscos com o mesmo peso das vantagens; nada de promessa de retorno.

## 1. Arquitetura

O vídeo é um **site React que é função pura do tempo**, capturado quadro a quadro com Playwright.

```
video/
  SPEC.md · ajustes-fala.json
  src/main.tsx         monta <Film/>; expõe window.__vapti (ver 3)
  src/Film.tsx         lê timeline, escolhe o ato ativo, faz crossfade entre atos, camadas globais
  src/timeline.ts      tipos + import de ../build/timeline.json
  src/kit/**           primitivas cinematográficas e tipográficas (dono: agente KIT)
  src/scenes/AtoN.tsx  um arquivo por ato (N = 1..9) + scenes/index.ts (registro)
  cues/atoN.json       cues de som de cada ato (dono: agente do ato)
  scripts/*.mjs        voz, timeline, áudio, render (dono: agente PIPELINE)
  build/               gerado, fora do git: falas.json, audio/Fxxx.wav, timeline.json, music.wav, mix.wav, chunks/
  entrada/             áudio próprio opcional (F001.wav …)
vite.video.config.ts   (raiz) build em arquivo único, root = video/, saída video/dist/index.html
```

Scripts npm (já no package.json): `video:dev`, `video:build`, `video:voz`, `video:timeline`, `video:audio`, `video:render`, `video:rascunho`, `video`.

Stack: React 19 + TS estrito + Tailwind v4 + `src/styles/tokens.css` + fontes @fontsource já instaladas. **Sem** `motion/react` e sem CSS transitions/animations: tudo é calculado a partir de `t`.

## 2. Timeline (`video/build/timeline.json`)

```json
{
  "fps": 30, "largura": 1920, "altura": 1080, "duracao": 452.3, "fonte": "estimado | voz",
  "atos": [{ "id": "A1", "titulo": "O problema", "capitulo": "01 · O problema", "tom": "…", "energia": 3,
             "musica": "…", "inicio": 0, "fim": 42.1, "primeira": "F001", "ultima": "F009" }],
  "frases": [{ "id": "F001", "ato": "A1", "texto": "Quatrocentos reais.", "inicio": 0.0, "duracao": 1.8, "fim": 1.8,
               "pausaAntes": 0, "pausaDepois": 1.0, "enfase": "Quatrocentos", "tEnfase": 0.35,
               "palavras": [{ "w": "Quatrocentos", "t0": 0.0, "t1": 0.9 }, { "w": "reais.", "t0": 0.95, "t1": 1.8 }],
               "layout": "L5", "visuais": ["V07"], "tela": "R$ 400", "selo": "", "som": "…", "direcao": "texto do campo visual do roteiro" }],
  "marcas": { "fimNarracao": 440.0, "cardFinal": [446.5, 451.5] }
}
```

Todos os tempos em segundos **absolutos** do filme. `tEnfase` é o instante absoluto em que a sílaba da palavra de ênfase começa (estimado pela posição proporcional da palavra dentro da fala). `palavras[].t0/t1` também absolutos. Regras de montagem (agente PIPELINE): respiro entre frases 0,3 s, mais `pausaAntes`/`pausaDepois` do roteiro; fronteira de ato +0,9 s; o filme abre com 0,8 s de preto; fecha com card final de 5 s (V24) após a F091.
Com a voz gravada e editada (`video/edicao-voz.json` → `video/entrada/editado/`, motor `arquivos`), o vão entre duas frases é o silêncio total do plano (`pausaDepois` do plano, que já inclui respiro, `pausaAntes` e fronteira de ato), `palavras` são os tempos reais do plano e `tEnfase` é o início medido da palavra de ênfase. Os campos `pausaAntes`/`pausaDepois` da timeline continuam sendo os do roteiro.
Enquanto a voz não existir, `fonte: "estimado"` usa as durações do roteiro; ao rodar `video:voz`, vira `"voz"` com as durações reais.

Cues de som: `video/cues/atoN.json` = `[{ "frase": "F008", "ref": "fala|enfase|fim", "dt": 0.0, "tipo": "tick|whoosh|impacto|swell|ding|pop|sub", "dur": 2.5, "vol": -18 }]`. O script de áudio funde esses cues com os padrões (whoosh na fronteira de ato, impacto na revelação).

## 3. Contrato de renderização

`window.__vapti = { duracao: number, fps: number, pronto: Promise<void>, setTime(t: number): Promise<void> }`.
`setTime` renderiza **sincronamente** (flushSync) o quadro do instante `t`, espera `document.fonts.ready` e dois `requestAnimationFrame`, e resolve. O renderizador chama `setTime(i / fps)` e tira `page.screenshot({ type: "png" })`.
Parâmetros de URL: `?w=1920&h=1080` (escala o palco de 1920×1080 por `transform`), `?rascunho=1` (opcional, sem grão).

**Pureza**: nenhuma cena pode usar `Date.now`, `Math.random`, `performance.now`, `setTimeout`, `requestAnimationFrame` próprio, CSS `transition`/`animation` ou estado temporal. Aleatoriedade só por `mulberry32(seed)` do kit. Tudo = f(t).
**Desempenho**: alvo ≤ 250 ms por quadro. Evite `filter: blur` grande em área cheia, `mix-blend-mode` em tela inteira, `feTurbulence` por quadro (o grão é um PNG em mosaico deslocado por `floor(t*fps)`), centenas de nós SVG animados. Prefira transform/opacity.

## 4. API do kit (`video/src/kit`, dono: KIT)

Tempo e easing: `clamp01`, `lerp`, `prog(t, t0, t1)` → 0..1, `ease.outCubic|inOutCubic|outExpo|outBack|inOutSine|spring(t, {k,d})`, `stagger(i, delay)`, `mulberry32`.
Contexto: `useFilme()` → `{ t, fps, tl, ato, frase, ltFrase, proxima, anterior }` e `useFrase(id)` → `{ f, t0, t1, ativa, lt, p }` (p = progresso 0..1 da fala); `useEnfase(id)` → `{ tE, passou, lt }`.
Câmera e acabamento: `<Camera>` (push-in/pan lento por `from/to` e curva, parallax por camadas `<Camada z>`), `<Grao>`, `<Vinheta>`, `<Respiracao>` (luz que pulsa devagar), `<Poeira>` (partículas deterministas), `<Graduacao tom="frio|quente|neutro">`.
Tipografia: `<Palavra>` (entrada por palavra no tempo da fala, destaque verde na palavra de ênfase), `<Titulo>`, `<Rotulo>` (texto da tela, ≤ 8 palavras), `<Numero>` (contagem que **para exatamente em `tParada`** e segura ≥ 1,5 s), `<Selo tipo="projecao|ilustrativo|estimativa">`, `<Capitulo>` (etiqueta de ato por 2 s, canto superior esquerdo), `<MarcaCanto>` (Vapti discreta no canto, a partir da F009), `<Legenda>` (para a versão legendada).
Formas: `<Tracado>` (SVG path que se desenha com `pathLength`), `<Barra>`, `<Curva>`, `<Grade>`, `<Cartao>`, `<Seta>`, `<CelularMoldura>` (reusa `src/components/base/MolduraCelular` se servir).
Cores e fontes: do `tokens.css` (tinta #0E1116, superfície #161B22, texto #F2F4F7, verde #B6F23A = Vapti/dinheiro entrando, coral #FF7A45 = risco/perda, azul-gelo #8FB8FF = dado neutro, cinza #8B95A1 = Zippi/terceiros). Títulos Bricolage Grotesque, texto Manrope, números JetBrains Mono (tabulares).

Cada `scenes/AtoN.tsx` exporta `export default function AtoN()` e `export const frases: string[]` (ids que cobre). O `Film` renderiza o ato ativo, mais o vizinho durante o crossfade de 0,7 s.

## 5. Layouts sem apresentador

O roteiro pensa num apresentador recortado; aqui ele não aparece. Adaptação (o campo `layout` da frase continua valendo como ritmo e composição):
- **L1** (antes: você no centro): composição central e limpa, tipografia/objeto único em destaque, muito ar. Aberturas, viradas, momentos de confiança.
- **L2** (você à esquerda, painel à direita): o terço esquerdo carrega o rótulo/palavra-chave em tipografia grande; os dois terços da direita, o visual.
- **L3** (você no canto): o visual ocupa a tela; rótulo pequeno no canto inferior esquerdo.
- **L4**: tela cheia, só visual (≤ 4 s seguidos).
- **L5**: número gigante ocupando o fundo, com profundidade (camadas, desfoque leve, parallax) e a cena menor à frente.
O "gesto" do roteiro (apontar, sorrir) é ignorado.

## 6. Direção de atenção (princípios, todos transparentes)

Objetivo: manter a atenção e a compreensão do investidor de forma honesta. Técnicas permitidas, baseadas em pesquisa de atenção, memória e aprendizagem multimídia:
1. **Arco narrativo e promessa clara** (problema → prova → solução → riscos → pedido); a abertura já avisa que há um pedido no fim (a F001 abre com o número que ancora a história).
2. **Orientação e novidade**: algo muda na tela a cada 3 a 5 s; nada parado por mais de 5 s. Variação de ritmo entre atos (energia 2 a 5 do roteiro).
3. **Sincronia áudio-visual (contiguidade temporal)**: o elemento principal entra na sílaba da ênfase; contadores param no instante em que o número é dito.
4. **Codificação dupla sem redundância**: não mostrar a transcrição; no máximo 8 palavras na tela; a imagem explica o mecanismo e a voz narra.
5. **Carga cognitiva**: no máximo 4 itens por vez; revelação progressiva; um conceito por cena.
6. **Primazia e recência / pico-fim**: abertura forte; o pico emocional e de informação é a revelação "quem decide é a perda" (V16, F061–F063); o fim é firme e caloroso (F089–F091 e card final).
7. **Contraste e sinalização**: cor com significado fixo (verde = Vapti/entrada, coral = risco/perda, cinza = terceiros); a palavra de ênfase destacada.
8. **Silêncio e respiro** antes dos números que importam (0,3 a 0,6 s); música baixa nos riscos (franqueza), cresce na visão de futuro.
9. **Som**: pad contínuo, batida só onde o roteiro marca; efeitos raros e no lugar certo; voz sempre acima da música (ducking de 12 a 18 dB).
10. **Honestidade visível**: riscos com o mesmo peso e a mesma qualidade visual das vantagens; selos Projeção/Ilustrativo/estimativa sempre colados ao número.

**Não fazer**: quadros subliminares, comandos embutidos, urgência ou escassez fabricadas, piscadas acima de 3 por segundo (acessibilidade), manipulação de volume, esconder risco, qualquer coisa da lista da 4.15 do briefing (inclui persuasão oculta). Nada de moedas, cofrinho, dinheiro chovendo, cassino, roleta, caça-níquel, rostos de pessoas reais, logotipos de terceiros.

## 7. Entregas

`entregas/vapti-video-16x9.mp4` (H.264 CRF 16–18, yuv420p, AAC 192k, −14 LUFS, pico < −1 dBTP), `entregas/vapti-video.srt`, `entregas/vapti-video-legendado.mp4` (legenda queimada na base, máx. 2 linhas, sem cobrir números), `entregas/qa/video/` (quadros-chave e `qa-video.md`).
Checklist do roteiro (Parte 8) vale integralmente.
