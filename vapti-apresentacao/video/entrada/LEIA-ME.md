# Entrada de áudio próprio (opcional)

Para trocar a voz-guia pela sua gravação, coloque aqui um arquivo por frase, com o id do roteiro:
`F001.wav` (ou .mp3, .m4a, .mp4, .mov) … `F091.*`. O áudio é extraído, normalizado e o vídeo é
renderizado de novo com o mesmo motion design, no ritmo da SUA voz: `npm run video`.
Frases sem arquivo continuam com a voz sintética.

Clipes editados: `npm run video:editar` aplica o plano `video/edicao-voz.json` (cortes, troca de tomada, pausas internas
encurtadas, fades e EQ) e grava `video/entrada/editado/Fxxx.wav` (48 kHz, mono, 24 bits). Quando existe, o clipe editado
tem prioridade no `video:voz --motor arquivos`, que também leva para `voz.json` as palavras, a ênfase e o silêncio do plano.
