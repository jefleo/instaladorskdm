# Guia visual — Vapti

**Conceito: "sinal verde".** Fundo tinta, números grandes em mono como protagonistas, um único acento verde que significa *dinheiro entrando*. A assinatura é o **traço vupt**: uma barra curta inclinada que aparece no pingo do "i" da marca e antes de cada eyebrow — o "vupt" do vapt-vupt. Calor humano vem da Bricolage (grotesca com personalidade) e de frases curtas, não de enfeite.

## Paleta (cada cor tem um único significado)
| Token | Escuro | Claro (impressão) | Significa |
| --- | --- | --- | --- |
| `tinta` / `superficie` / `superficie-2` | #0E1116 / #161B22 / #1D242E | #FAFAF7 / #FFFFFF / #F1F1EC | Fundo, cartões, elevação |
| `texto` / `texto-2` / `texto-3` | #F2F4F7 / #B4BCC7 / #8B95A1 | #12161C / #3D4652 / #59626D | Principal, apoio, legenda |
| `verde` | #B6F23A | #3F6A00 | Dinheiro entrando. Vapti. |
| `coral` | #FF7A45 | #B23E0B | Risco e alerta |
| `azul` | #8FB8FF | #2456B5 | Dado neutro |
| `cinza` | #8B95A1 | #59626D | Zippi e terceiros |

Contraste conferido: todas as cores de texto ≥ 4,5:1 sobre tinta, superfície e superfície-2, nos dois modos (texto 15,7:1; verde 13:1; coral 6,7:1; claro: verde 6,1:1, coral 5,6:1). Verde e coral têm **o mesmo peso**: mesma opacidade de fundo (`*-suave`), mesma borda (`*-borda`), mesma barra no `Card`. Modo claro: `html[data-modo="claro"]`.

## Tipografia
- **Títulos:** Bricolage Grotesque 800, tracking −0,035em. O título é a conclusão, não o assunto.
- **Texto:** Manrope 400–600. **Números:** JetBrains Mono 700, algarismos tabulares.
- **Escala no palco 1920×1080** (`--fs-*`, utilitários `text-*`): KPI 168/112/72 · display 96 · título 76 · subtítulo 36 · h3 44 · corpo 32/26 · apoio e eyebrow 22 (mínimo). Reduz por `@container secao` em ≤1100 px e ≤600 px.
- **Legibilidade a 3 m:** nada de conteúdo abaixo de 22 px no palco; no máximo ~12 palavras por linha de corpo; um número protagonista por tela.

## Movimento
Entradas de 200–400 ms com `--ease-saida` (cubic-bezier .22,1,.36,1), deslocamento de 16 px. KPIs contam em 1,1 s ao entrar na tela, uma vez. Gráficos se desenham ao entrar. Sem parallax, sem loop. Com `prefers-reduced-motion` ou `?print=1`: tudo estático, valor final direto.

## Regras de uso
- **Zippi sempre em cinza e só em texto.** Nenhum logotipo de terceiros (Zippi, bancos, Meta, WhatsApp, Banco Central, Pix).
- Nada de fotos de banco de imagem, moedas, cofrinho, dinheiro chovendo, raios. Sem Inter, sem gradiente roxo.
- Ícones: só Lucide, traço 1,5 (`<Icone>`).
- Número projetado = selo **Projeção** (verde, abre premissas). Desenho que não é dado = **Ilustrativo** (azul tracejado). Tela do app = **Protótipo** (cinza, canto reto).
- Gráficos: Vapti em verde sólido e mais grosso; terceiros em cinza tracejado; risco em coral; contexto em azul-gelo. Referências em `#/estilo`.
