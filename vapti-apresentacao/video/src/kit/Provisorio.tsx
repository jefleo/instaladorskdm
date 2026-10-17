/**
 * Cena provisória: mostra o id e a fala da frase ativa do ato. Os agentes de cena
 * substituem cada scenes/AtoN.tsx; isto só garante um filme completo desde o início.
 */
import { useFilme } from "./contexto";
import { frasePorId } from "../timeline";
import { Grade } from "./formas";
import { ease, prog } from "./tempo";

export function CenaProvisoria({ frases }: { frases: string[] }) {
  const { t, tl, ato } = useFilme();
  const lista = frases.map((id) => frasePorId(tl, id));
  let f = lista[0];
  for (const x of lista) if (x.inicio <= t) f = x;
  const p = ease.outCubic(prog(t, f.inicio - 0.1, f.inicio + 0.3));
  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
      <Grade tipo="pauta" opacidade={0.8} />
      <div className="absolute flex flex-col" style={{ left: 160, top: 300, width: 1500, gap: 28, opacity: p }}>
        <p className="font-mono" style={{ margin: 0, fontSize: 28, color: "var(--cor-verde)", letterSpacing: "0.06em" }}>
          {f.id} · {f.layout} · {ato.titulo}
        </p>
        <p style={{ margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 76, lineHeight: 1.04, letterSpacing: "-0.035em", textWrap: "balance" }}>{f.tela || "—"}</p>
        <p style={{ margin: 0, fontSize: 32, lineHeight: 1.4, color: "var(--cor-texto-2)", maxWidth: 1300 }}>{f.texto}</p>
      </div>
    </div>
  );
}
