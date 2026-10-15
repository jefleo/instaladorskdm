import { ExternalLink, X } from "lucide-react";
import { Icone } from "../components/base";
import type { Secao } from "../content/tipos";
import { modos } from "../content/ui";

/** Conteúdo das notas de uma seção: tempo, frase-chave, tópicos e perguntas. */
export function ConteudoNotas({ secao, grande = false }: { secao: Secao; grande?: boolean }) {
  const n = secao.notas;
  const r = modos.notas;
  const corpo = grande ? "text-[22px]" : "text-[17px]";
  return (
    <div className={`space-y-6 ${corpo} leading-[1.45]`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-titulo text-[1.25em] font-bold text-texto">
          <span className="mr-2 font-mono text-verde">{secao.id}</span>
          {secao.nome}
        </p>
        <p className="font-mono text-[0.85em] text-texto-3">
          {r.tempo}: <span className="text-texto">{n.tempo}</span>
        </p>
      </div>
      <section>
        <h3 className="font-mono text-[0.75em] uppercase tracking-[0.12em] text-verde">{r.fraseChave}</h3>
        <p className="mt-2 border-l-[3px] border-verde pl-3 font-titulo text-[1.3em] font-bold leading-[1.2] text-texto">{n.fraseChave}</p>
      </section>
      <section>
        <h3 className="font-mono text-[0.75em] uppercase tracking-[0.12em] text-texto-3">{r.topicos}</h3>
        <ol className="mt-2 space-y-2">
          {n.topicos.map((t, i) => (
            <li key={t} className="flex gap-3 text-texto">
              <span className="font-mono text-texto-3">{String(i + 1).padStart(2, "0")}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>
      {n.perguntas?.length ? (
        <section>
          <h3 className="font-mono text-[0.75em] uppercase tracking-[0.12em] text-azul">{r.perguntas}</h3>
          <dl className="mt-2 space-y-3">
            {n.perguntas.map((p) => (
              <div key={p.pergunta} className="rounded-2 border border-borda bg-superficie p-3">
                <dt className="font-semibold text-texto">{p.pergunta}</dt>
                <dd className="mt-1 text-texto-2">
                  <span className="sr-only-vapti">{r.resposta}: </span>
                  {p.resposta}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}

/** Painel lateral de notas no modo apresentação. */
export function PainelNotas({ secao, onFechar, onAbrirJanela }: { secao: Secao; onFechar: () => void; onAbrirJanela: () => void }) {
  const r = modos.notas;
  return (
    <aside className="apres-notas" aria-label={r.titulo}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-borda bg-superficie px-5 py-3">
        <h2 className="font-mono text-[14px] uppercase tracking-[0.12em] text-texto-2">{r.titulo}</h2>
        <div className="flex items-center gap-1">
          <button type="button" className="botao-shell" onClick={onAbrirJanela} title={r.outraJanela}>
            <Icone icone={ExternalLink} tamanho={18} />
            <span>{r.outraJanela}</span>
          </button>
          <button type="button" className="botao-shell botao-shell--icone" onClick={onFechar} aria-label={r.fechar} title={r.fechar}>
            <Icone icone={X} tamanho={18} />
          </button>
        </div>
      </div>
      <div className="px-5 py-5">
        <ConteudoNotas secao={secao} />
      </div>
    </aside>
  );
}
