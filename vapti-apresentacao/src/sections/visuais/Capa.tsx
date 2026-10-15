import { Wordmark } from "../../components/base";
import { config } from "../../data/vapti";
import { rotulos } from "../../content/ui";
import type { Secao } from "../../content/tipos";

/** V01 — marca, frase, para quem, data e quem apresenta. */
export function Capa({ secao }: { secao: Secao }) {
  const r = rotulos.capa;
  const linhas = [
    { rotulo: r.para, texto: config.cliente },
    { rotulo: r.data, texto: config.data },
    { rotulo: r.apresenta, texto: secao.blocos[0]?.texto ?? "" },
  ];
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-x-[var(--esp-7)] gap-y-[var(--esp-4)]">
        <Wordmark tamanho="calc(var(--fs-kpi) * 1.15)" />
        <p className="pt-[0.6em] font-mono text-apoio uppercase text-texto-3" style={{ letterSpacing: "0.12em" }}>
          {secao.legendas.V01}
        </p>
      </div>

      <div className="mt-auto pt-[var(--esp-8)]">
        <p className="flex items-center gap-[0.6em] font-mono text-eyebrow font-medium uppercase text-texto-2" style={{ letterSpacing: "var(--tracking-eyebrow)" }}>
          <span className="text-verde">{secao.id}</span>
          <span className="traco-vupt" aria-hidden="true" style={{ width: "1.1em", height: "0.22em" }} />
          <span>{secao.nome}</span>
        </p>
        <h1
          className="mt-[0.25em] font-titulo font-extrabold text-texto"
          style={{ fontSize: "calc(var(--fs-display) * 1.4)", lineHeight: 0.98, letterSpacing: "-0.045em", maxWidth: "15ch" }}
        >
          {secao.titulo}
        </h1>
      </div>

      <dl className="grade-3 mt-[var(--esp-8)] border-t border-borda-forte pt-[var(--esp-6)]" style={{ ["--vao" as string]: "var(--esp-7)" }}>
        {linhas.map((l) => (
          <div key={l.rotulo} className="min-w-0">
            <dt className="font-mono text-apoio uppercase text-texto-3" style={{ letterSpacing: "0.12em" }}>
              {l.rotulo}
            </dt>
            <dd className="mt-[0.3em] text-corpo-g font-semibold text-texto" style={{ lineHeight: 1.25 }}>
              {l.texto}
            </dd>
          </div>
        ))}
      </dl>

      {/* Traços "vupt": assinatura de movimento, sem dado */}
      <div className="capa-vupt" aria-hidden="true">
        {[560, 380, 700, 300, 480].map((w, i) => (
          <span key={w} style={{ width: w, opacity: [1, 0.5, 0.26, 0.16, 0.09][i] }} />
        ))}
      </div>
    </div>
  );
}

/** V24 — card final: marca, "Vamos?" e o aviso curto. */
export function CardFinal({ legenda }: { legenda?: string }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center text-center">
      <Wordmark tamanho="var(--fs-kpi-m)" />
      <p
        className="mt-[0.18em] font-titulo font-extrabold text-texto"
        style={{ fontSize: "calc(var(--fs-kpi) * 1.45)", lineHeight: 1, letterSpacing: "-0.05em" }}
      >
        {rotulos.fechamento.pergunta}
      </p>
      <span className="traco-vupt mt-[var(--esp-6)]" aria-hidden="true" style={{ width: "3.2em", height: "0.5em", fontSize: "var(--fs-corpo-g)" }} />
      {legenda ? (
        <p className="mt-[var(--esp-7)] max-w-[56ch] text-apoio text-texto-3" style={{ lineHeight: 1.45 }}>
          {legenda}
        </p>
      ) : null}
    </div>
  );
}
