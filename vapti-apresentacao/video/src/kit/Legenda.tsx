/**
 * <Legenda> — legenda queimada da versão para assistir sem som (`?legenda=1`).
 * Fala exata da frase, no máximo 2 linhas, na faixa inferior (`ZONA_LEGENDA`).
 * Falas longas são divididas em blocos que trocam no tempo das palavras.
 */
import type { Frase } from "../timeline";
import { useFilme } from "./contexto";
import { envelope } from "./tempo";

/** Faixa inferior reservada à legenda: as cenas não devem pôr números aqui. */
export const ZONA_LEGENDA = { base: 54, altura: 150 } as const;

/** Máximo de caracteres por bloco (≈ 2 linhas de 46 caracteres a 36 px). */
const MAX_BLOCO = 88;

/** Divide a fala em blocos de até `MAX_BLOCO` caracteres, com o instante de início de cada um. */
export function blocosDaFala(f: Frase): { texto: string; t0: number }[] {
  const ws = f.palavras.length ? f.palavras : f.texto.split(/\s+/).map((w) => ({ w, t0: f.inicio, t1: f.fim }));
  const blocos: { texto: string; t0: number }[] = [];
  let atual: string[] = [];
  let t0 = f.inicio;
  ws.forEach((p, i) => {
    const prox = [...atual, p.w].join(" ");
    if (atual.length && prox.length > MAX_BLOCO) {
      blocos.push({ texto: atual.join(" "), t0 });
      atual = [p.w];
      t0 = p.t0;
    } else {
      if (!atual.length) t0 = i === 0 ? f.inicio : p.t0;
      atual.push(p.w);
    }
  });
  if (atual.length) blocos.push({ texto: atual.join(" "), t0 });
  // Equilibra: se o último bloco ficou curtinho, divide o total ao meio
  if (blocos.length === 2 && blocos[1].texto.length < 24) {
    const meio = Math.ceil(ws.length / 2);
    return [
      { texto: ws.slice(0, meio).map((p) => p.w).join(" "), t0: f.inicio },
      { texto: ws.slice(meio).map((p) => p.w).join(" "), t0: ws[meio].t0 },
    ];
  }
  return blocos;
}

/** Legenda da frase corrente (só aparece enquanto ela é dita, mais 0,25 s). */
export function Legenda() {
  const { t, frase } = useFilme();
  if (!frase) return null;
  const fim = frase.fim + 0.25;
  if (t < frase.inicio - 0.05 || t > fim) return null;
  const blocos = blocosDaFala(frase);
  let b = blocos[0];
  for (const x of blocos) if (x.t0 <= t) b = x;
  const vida = envelope(t, frase.inicio - 0.05, fim, 0.12, 0.15);
  return (
    <div className="pointer-events-none absolute inset-x-0 flex justify-center" style={{ bottom: ZONA_LEGENDA.base, opacity: vida }}>
      <p
        style={{
          margin: 0,
          maxWidth: 1240,
          padding: "12px 26px 14px",
          borderRadius: 14,
          background: "rgb(8 10 14 / 0.78)",
          boxShadow: "0 0 0 1px rgb(255 255 255 / 0.05) inset",
          fontFamily: "var(--fonte-texto)",
          fontWeight: 600,
          fontSize: 36,
          lineHeight: 1.3,
          color: "#F2F4F7",
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        {b.texto}
      </p>
    </div>
  );
}
