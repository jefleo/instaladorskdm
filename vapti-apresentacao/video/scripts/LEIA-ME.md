# Scripts do vídeo (pipeline)

Ordem de `npm run video` (tudo a partir da raiz do projeto):

1. `video:voz` → `node video/scripts/voz.mjs` gera `video/build/audio/F001.wav … F091.wav` (48 kHz, mono, 16 bits) e `video/build/voz.json`.
2. `video:timeline` → `node video/scripts/timeline.mjs` gera `video/build/timeline.json`, `video/build/falas.json` e `entregas/vapti-video.srt`. Com todos os WAVs presentes usa as durações reais (`fonte: "voz"`, com corte de silêncio de 60 ms antes e 100 ms depois); sem eles, ou com `--estimado`, usa as durações do roteiro (`fonte: "estimado"`).
3. `video:audio` → `node video/scripts/audio.mjs` sintetiza trilha e efeitos (`musica.py`, numpy, sem baixar nada), mistura com ducking de 13 a 17 dB e fecha em −14 LUFS com loudnorm de 2 passes: `video/build/music.wav`, `sfx.wav`, `voz.wav`, `mix.wav`, `mix-info.json` (inclui LUFS e pico medidos).
4. `video:build` → vite gera `video/dist/index.html` (feito pelo kit).
5. `video:render` → `node video/scripts/render.mjs` renderiza, concatena, mixa o áudio e gera `entregas/vapti-video-16x9.mp4` e `entregas/vapti-video-legendado.mp4`.

Atalho de teste: `npm run video:rascunho` (960×540, 12 fps, `video/build/rascunho.mp4`).

## Voz

Motor padrão: **Kokoro pt-BR (neural, local)**, voz `pm_alex`. Velocidade por ato conforme a energia (0,95 / 0,97 / 1,0 / 1,04). Os modelos ficam em `video/modelos/` (`kokoro-v1.0.onnx`, `voices-v1.0.bin`) e o Python em `video/.venv` (pacotes `kokoro-onnx` e `soundfile`); ambos fora do git. `kokoro_tts.py` carrega o modelo uma vez para todas as frases.

- Outra voz: `node video/scripts/voz.mjs --voz pm_santa` (M) ou `--voz pf_dora` (F).
- Siglas e nomes: dicionário em `video/scripts/lib/texto.mjs` (`PRONUNCIA_KOKORO`). Só o texto enviado ao TTS muda; legenda e `falas.json` mantêm a grafia do roteiro.
- Alternativa offline: `--motor mbrola` (espeak-ng + mbrola `mb-br3`, com camada de prosódia própria; soa bem mais robótica; só para emergência).
- Reexecuta só o que mudou (hash de texto, ênfase, ato, motor e voz). `--forcar` refaz tudo; `--so F001,F007` limita.

### Trocar pela sua voz (pasta `video/entrada/`)
Coloque um arquivo por frase com o id do roteiro: `F001.wav` (ou `.mp3 .m4a .mp4 .mov`) … `F091.*`. Tem prioridade sobre o motor sintético, frase a frase. O áudio é extraído, passa por `afftdn` (redução de ruído), calor leve, de-esser, compressão suave e nivelamento. Depois rode `npm run video` (ou só voz → timeline → audio → render): o motion design acompanha o ritmo da sua voz porque a timeline mede os clipes reais. Para usar só arquivos: `--motor arquivos` (frases sem arquivo usam o mbrola).

### Reinstalar a voz neural do zero
```
python3 -m venv video/.venv && video/.venv/bin/pip install kokoro-onnx soundfile
# baixar para video/modelos/ (GitHub Releases do projeto kokoro-onnx, model-files-v1.0):
#   kokoro-v1.0.onnx   voices-v1.0.bin
```

## Áudio
Cues de som: `video/cues/atoN.json` (`[{frase, ref: fala|enfase|fim, dt, tipo: tick|whoosh|impacto|swell|ding|pop|sub, dur, vol}]`). Funde com os padrões (whoosh em cada fronteira de ato, grave no "reais" da F001, swell+impacto na F063, resolução com ding na F091); um cue do mesmo tipo a menos de 1,2 s do padrão o substitui. Efeitos em −22 a −13 dB de pico, raros.

## Render
`render.mjs --workers 4` (padrão) · `--rascunho` · `--de 0 --ate 6` (trecho → `video/build/parcial.mp4`) · `--quadros 0,150,300` (PNGs em `video/build/previa/`) · `--forcar` · `--sem-legendado`. Os chunks (150 quadros) ficam em `video/build/chunks/` e são reaproveitados enquanto `dist/index.html` e `timeline.json` não mudarem. Erros de console da página abortam com mensagem. Legenda queimada: Manrope Bold 31 px, branco com contorno escuro, base da tela (`MarginV=46`); ajuste `MarginV` em `render.mjs` se uma cena precisar liberar a base.
