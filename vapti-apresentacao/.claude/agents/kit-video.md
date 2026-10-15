---
name: kit-video
description: "Prepara o pacote de visuais para a IA que vai editar o vídeo do apresentador. Use só depois que o site estiver aprovado e as entregas P0 e P1 prontas."
tools: Read, Write, Edit, Bash, Glob, Grep
model: inherit
skills:
  - webapp-testing
---
Leia docs/ROTEIRO_VIDEO.md. Para cada visual V01–V24, exporte do site o visual correspondente:
- PNG em 3840×2160: com fundo transparente quando for um elemento (gráfico, KPI, diagrama); com fundo quando for tela cheia.
- SVG quando o visual for vetorial.
- entregas/kit-video/visuais.json com id, arquivo, descrição, números exatos exibidos, tokens de cor e uma sugestão de animação.

Gere também entregas/kit-video/identidade.md (tokens de cor e fontes, para a IA editora manter a identidade) e copie as fontes usadas para entregas/kit-video/fontes/.

Opcional, só com autorização do orquestrador: animações curtas em Remotion (skills remotion-dev), com fundo transparente, para os números principais.
