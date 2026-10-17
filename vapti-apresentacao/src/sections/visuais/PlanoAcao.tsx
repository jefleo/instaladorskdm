import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, CircleHelp, Gauge, MessageCircle, Radio, ShieldCheck, X as Xis } from "lucide-react";
import { Icone } from "../../components/base";
import { planoAcao as P, resumoMarco, type IdAba } from "../../content/plano";
import { Rotulo } from "../Slide";

/* -------------------------------------------------------------------------- */
/* Navegação entre as sub-telas (modo apresentação)                            */
/* -------------------------------------------------------------------------- */

/** Rotas das abas no modo apresentação: 11b, 11c e 11d. A 11 é a visão geral. */
export const ROTA_ABA: Record<IdAba, string> = { aquisicao: "11b", cobranca: "11c", pix: "11d" };
export const ORDEM_ABAS: IdAba[] = P.abas.map((a) => a.id);

/** Quando a troca de aba veio do teclado, a nova tela devolve o foco à aba. */
let focarAbaAoMontar = false;

/** Vai para outra tela pela rota (#/11c), como a grade e o teclado fazem. */
export function irParaTela(id: string, comFoco = false) {
  focarAbaAoMontar = comFoco;
  const hash = `#/${id}`;
  if (window.location.hash === hash) return;
  window.history.replaceState(null, "", hash);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

/** Teclas 1, 2 e 3 trocam a aba no modo apresentação (sem conflito: a navegação usa setas, Espaço e PageUp/PageDown). */
export function useTeclasAbas(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const aoTeclar = (e: globalThis.KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const i = ["1", "2", "3"].indexOf(e.key);
      if (i < 0) return;
      const alvo = e.target as HTMLElement | null;
      if (alvo && (alvo.isContentEditable || alvo.tagName === "TEXTAREA" || (alvo.tagName === "INPUT" && !["range", "checkbox", "radio", "button"].includes((alvo as HTMLInputElement).type)))) return;
      if (document.querySelector("[role='dialog']")) return;
      e.preventDefault();
      irParaTela(ROTA_ABA[ORDEM_ABAS[i]]);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ativo]);
}

/* -------------------------------------------------------------------------- */
/* Abas                                                                        */
/* -------------------------------------------------------------------------- */

export function Abas({
  ativa,
  aoEscolher,
  idBase,
  idPainel,
  focoInicial = false,
}: {
  ativa: IdAba;
  /** Escolha por clique ou teclado (`teclado` = veio das setas/Home/End). */
  aoEscolher: (id: IdAba, teclado: boolean) => void;
  idBase: string;
  idPainel: string;
  focoInicial?: boolean;
}) {
  const lista = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focoInicial && focarAbaAoMontar) {
      focarAbaAoMontar = false;
      lista.current?.querySelector<HTMLButtonElement>("[aria-selected='true']")?.focus({ preventScroll: true });
    }
  }, [focoInicial]);

  const mover = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = ORDEM_ABAS.indexOf(ativa);
    const n = ORDEM_ABAS.length;
    const destino = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    aoEscolher(ORDEM_ABAS[destino], true);
  };

  return (
    <div ref={lista} role="tablist" aria-label={P.rotuloAbas} className="plano-abas" onKeyDown={mover}>
      {P.abas.map((a) => {
        const sel = a.id === ativa;
        return (
          <button
            key={a.id}
            id={`${idBase}-${a.id}`}
            type="button"
            role="tab"
            aria-selected={sel}
            aria-controls={sel ? idPainel : undefined}
            tabIndex={sel ? 0 : -1}
            onClick={() => aoEscolher(a.id, false)}
            className={`plano-aba ${sel ? "plano-aba--ativa" : ""}`}
          >
            <span className="plano-aba__tecla" aria-hidden="true">
              {a.tecla}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold leading-tight">{a.nome}</span>
              <span className="block text-apoio leading-tight text-texto-3">{a.resumo}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Identificação da aba na impressão (no lugar da barra de abas). */
export function AbaImpressa({ id }: { id: IdAba }) {
  const a = P.abas.find((x) => x.id === id);
  if (!a) return null;
  return (
    <p className="flex flex-wrap items-center gap-[0.6em] text-corpo font-semibold text-texto">
      <span className="plano-aba__tecla" aria-hidden="true">
        {a.tecla}
      </span>
      {a.nome}
      <span className="text-apoio font-normal text-texto-3">· {a.resumo}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* Visão geral (11)                                                            */
/* -------------------------------------------------------------------------- */

export function VisaoGeral({ blocos, interativo }: { blocos: readonly { titulo?: string; texto: string }[]; interativo: boolean }) {
  const guia = blocos[3];
  return (
    <div className="flex flex-col gap-[var(--esp-6)]">
      <ol className="grade-3 m-0 list-none p-0" style={{ ["--vao" as string]: "var(--esp-6)" }}>
        {P.abas.map((a, i) => {
          const b = blocos[i];
          const conteudo = (
            <>
              <span className="flex items-center gap-[0.6em]">
                <span className="plano-aba__tecla" aria-hidden="true">
                  {a.tecla}
                </span>
                <span className="font-titulo text-subtitulo font-bold leading-tight text-texto">{a.nome}</span>
              </span>
              <span className="mt-[0.5em] block text-corpo leading-snug text-texto-2">{b?.texto}</span>
              <span className="mt-[0.9em] block">
                <Rotulo tom="verde">{P.visao.metasRotulo}</Rotulo>
                <span className="mt-[0.35em] flex flex-col gap-[0.3em]">
                  {P.visao.metas[a.id].map((m) => (
                    <span key={m} className="flex items-start gap-[0.5em] text-apoio leading-snug text-texto">
                      <Icone icone={Check} tamanho="1em" className="mt-[0.2em] flex-none text-verde" strokeWidth={2.2} />
                      {m}
                    </span>
                  ))}
                </span>
              </span>
              {interativo ? (
                <span className="mt-auto inline-flex items-center gap-[0.4em] pt-[0.9em] text-apoio font-semibold text-verde">
                  {P.visao.abrir(a.nome)}
                  <Icone icone={ArrowRight} tamanho="1em" />
                </span>
              ) : null}
            </>
          );
          return (
            <li key={a.id} className="min-w-0">
              {interativo ? (
                <button type="button" onClick={() => irParaTela(ROTA_ABA[a.id])} className="plano-cartao plano-cartao--botao">
                  {conteudo}
                </button>
              ) : (
                <div className="plano-cartao">{conteudo}</div>
              )}
            </li>
          );
        })}
      </ol>
      {guia ? <MetricaGuia /> : null}
      {interativo ? <p className="text-apoio text-texto-3">{P.dicaTeclas}</p> : null}
    </div>
  );
}

function MetricaGuia({ nota }: { nota?: string }) {
  const g = P.aquisicao.guia;
  return (
    <div className="flex flex-wrap items-center gap-x-[1.2em] gap-y-[0.4em] rounded-3 border-2 border-verde-borda bg-verde-suave px-[1em] py-[0.6em]">
      <span className="flex items-center gap-[0.5em]">
        <Icone icone={Gauge} tamanho="1.2em" className="text-verde" />
        <Rotulo tom="verde">{g.rotulo}</Rotulo>
      </span>
      <span className="font-mono text-h3 font-bold text-verde" style={{ letterSpacing: "-0.03em", lineHeight: 1 }}>
        &lt; {g.valor}
      </span>
      <span className="min-w-0 flex-1 text-apoio leading-snug text-texto-2">
        <strong className="font-semibold text-texto">{g.texto}.</strong> {nota ?? g.nota}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Aba 1 — Aquisição barata                                                    */
/* -------------------------------------------------------------------------- */

export function PainelAquisicao({ estatico }: { estatico: boolean }) {
  const A = P.aquisicao;
  // Um canal aberto por vez: a tela da apresentação nunca transborda.
  const [aberto, setAberto] = useState<number | null>(0);
  const base = useId();
  const alternar = (i: number) => setAberto((a) => (a === i ? null : i));

  return (
    <div className="flex flex-col gap-[var(--esp-4)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-[1.5em] gap-y-[0.3em]">
        <h3 className="font-titulo text-corpo-g font-bold text-texto">{A.titulo}</h3>
        <p className="text-apoio text-texto-3">{estatico ? A.nota : `${A.nota} ${A.instrucao}`}</p>
      </div>
      <div className="plano-canal plano-canal--cab" aria-hidden="true">
        <Rotulo>{A.canal}</Rotulo>
        <Rotulo>{A.comoFazer}</Rotulo>
        <Rotulo>{A.oQueMedir}</Rotulo>
      </div>
      <div className="plano-canais -mt-[var(--esp-4)]" role="list">
        {A.canais.map((c, i) => {
          const estaAberto = estatico || aberto === i;
          const idCorpo = `${base}-c${i}`;
          const cabeca = (
            <>
              <span className="font-mono text-corpo font-bold text-verde">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block font-titulo text-corpo font-bold leading-tight text-texto">{c.titulo}</span>
                <span className="block text-apoio leading-snug text-texto-2">{c.porque}</span>
              </span>
              {!estatico ? <Icone icone={ChevronDown} tamanho="1.1em" className={`plano-canal__seta flex-none text-texto-3 ${estaAberto ? "rotate-180" : ""}`} /> : null}
            </>
          );
          return (
            <div
              key={c.titulo}
              role="listitem"
              className={`plano-canal ${estaAberto ? "plano-canal--aberto" : ""} ${estatico ? "" : "plano-canal--clicavel"}`}
              onClick={estatico ? undefined : () => alternar(i)}
            >
              {estatico ? (
                <div className="plano-canal__cabeca">{cabeca}</div>
              ) : (
                <button type="button" className="plano-canal__cabeca" aria-expanded={estaAberto} aria-controls={idCorpo}>
                  {cabeca}
                </button>
              )}
              <div id={idCorpo} className="plano-canal__corpo">
                {estaAberto ? (
                  <>
                    <p className="text-apoio leading-snug text-texto">
                      <span className="plano-so-estreito font-semibold text-texto-2">{A.comoFazer}: </span>
                      {c.como}
                    </p>
                    <p className="text-apoio leading-snug text-texto-2">
                      <span className="plano-so-estreito font-semibold">{A.oQueMedir}: </span>
                      {c.medir}
                    </p>
                  </>
                ) : (
                  <p className="plano-canal__dica text-apoio text-texto-3">{A.abrir}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <MetricaGuia />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Aba 2 — Cobrança e follow-up                                                */
/* -------------------------------------------------------------------------- */

export function PainelCobranca({ estatico }: { estatico: boolean }) {
  const C = P.cobranca;
  const [sel, setSel] = useState(0);
  const idDetalhe = useId();
  const m = C.marcos[sel];

  const regras = (
    <div className="rounded-3 border border-borda bg-superficie px-[0.9em] py-[0.6em]">
      <p className="flex items-center gap-[0.5em]">
        <Icone icone={ShieldCheck} tamanho="1.1em" className="text-azul" />
        <Rotulo tom="azul">{C.regrasTitulo}</Rotulo>
      </p>
      <ul className="mt-[0.4em] flex list-none flex-wrap gap-[0.4em] p-0">
        {C.regras.map((r) => (
          <li key={r} className="rounded-full border border-borda-forte px-[0.7em] py-[0.15em] text-apoio text-texto">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );

  const roll = (faixaAtual: number | null) => (
    <div className="rounded-3 border border-borda bg-superficie px-[0.9em] py-[0.6em]">
      <p className="flex items-center gap-[0.5em]">
        <Icone icone={Radio} tamanho="1.1em" className="text-azul" />
        <Rotulo tom="azul">{C.rollTitulo}</Rotulo>
      </p>
      <ol className="mt-[0.4em] grid list-none gap-[0.3em] p-0" style={{ gridTemplateColumns: `repeat(${C.rollFaixas.length}, minmax(0, 1fr))` }}>
        {C.rollFaixas.map((f, i) => {
          const atual = faixaAtual === i;
          return (
            <li
              key={f}
              className={`rounded-2 border px-[0.3em] py-[0.15em] text-center text-apoio leading-tight ${
                atual ? (i === 0 ? "border-verde bg-verde-suave font-semibold text-texto" : "border-coral bg-coral-suave font-semibold text-texto") : "border-borda text-texto-2"
              }`}
              aria-current={atual ? "step" : undefined}
            >
              {f}
            </li>
          );
        })}
      </ol>
      {faixaAtual !== null ? <p className="mt-[0.5em] text-apoio leading-snug text-texto-3">{C.rollAtual(C.rollFaixas[faixaAtual])}</p> : null}
    </div>
  );

  if (estatico) {
    return (
      <div className="flex flex-col gap-[var(--esp-4)]">
        <h3 className="font-titulo text-corpo-g font-bold text-texto">{C.titulo}</h3>
        <table className="plano-tabela w-full border-collapse text-left">
          <thead>
            <tr>
              <th scope="col">
                <Rotulo>{C.quando}</Rotulo>
              </th>
              <th scope="col">
                <Rotulo>{C.oQue}</Rotulo>
              </th>
              <th scope="col">
                <Rotulo>
                  {C.canal} · {C.tom}
                </Rotulo>
              </th>
            </tr>
          </thead>
          <tbody>
            {C.marcos.map((x) => (
              <tr key={x.id}>
                <th scope="row" className={`font-mono font-bold ${x.alerta ? "text-coral" : "text-verde"}`}>
                  {x.quando}
                  <span className="block font-texto text-apoio font-semibold text-texto">{x.titulo}</span>
                </th>
                <td className="text-texto-2">{x.oque}</td>
                <td className="text-texto-2">
                  {x.canal}. <span className="text-texto-3">{x.tom}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grade-2" style={{ ["--vao" as string]: "var(--esp-4)" }}>
          {regras}
          {roll(null)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--esp-4)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-[1.5em] gap-y-[0.3em]">
        <h3 className="font-titulo text-corpo-g font-bold text-texto">{C.titulo}</h3>
        <p className="text-apoio text-texto-3">{C.instrucao}</p>
      </div>
      {/* Linha do tempo: marcos clicáveis (espaçamento igual, fora de escala) */}
      <ol className="plano-regua m-0 list-none p-0" aria-label={C.eixo}>
        {C.marcos.map((x, i) => {
          const ativo = i === sel;
          return (
            <li key={x.id} className="min-w-0">
              <button
                type="button"
                aria-pressed={ativo}
                aria-controls={idDetalhe}
                onClick={() => setSel(i)}
                className={`plano-marco ${ativo ? "plano-marco--ativo" : ""} ${x.alerta ? "plano-marco--alerta" : ""}`}
              >
                <span className="font-mono text-corpo font-bold">{x.quando}</span>
                <span className="plano-marco__ponto" aria-hidden="true" />
                <span className="block text-apoio leading-tight">{x.titulo}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div id={idDetalhe} aria-live="polite" className={`rounded-3 border-2 px-[1em] py-[0.7em] ${m.alerta ? "border-coral-borda bg-coral-suave" : "border-verde-borda bg-verde-suave"}`}>
        <p className="flex flex-wrap items-baseline gap-x-[0.7em]">
          <span className={`font-mono text-corpo-g font-bold ${m.alerta ? "text-coral" : "text-verde"}`}>{m.quando}</span>
          <span className="font-titulo text-corpo-g font-bold text-texto">{m.titulo}</span>
        </p>
        <div className="plano-detalhe mt-[0.4em]">
          <div>
            <Rotulo>{C.oQue}</Rotulo>
            <p className="mt-[0.2em] text-corpo leading-snug text-texto">{m.oque}</p>
          </div>
          <div className="flex flex-col gap-[0.6em]">
            <div>
              <Rotulo>{C.canal}</Rotulo>
              <p className="mt-[0.2em] text-apoio leading-snug text-texto">{m.canal}</p>
            </div>
            <div>
              <Rotulo>{C.tom}</Rotulo>
              <p className="mt-[0.2em] text-apoio leading-snug text-texto">{m.tom}</p>
            </div>
          </div>
        </div>
        <p className="mt-[0.6em] flex items-start gap-[0.5em] text-apoio leading-snug text-texto-2">
          <Icone icone={MessageCircle} tamanho="1.1em" className="mt-[0.15em] flex-none text-texto-3" />
          <span>
            <span className="text-texto-3">{C.exemplo}: </span>
            {m.exemploTexto}
          </span>
        </p>
      </div>
      <div className="grade-2" style={{ ["--vao" as string]: "var(--esp-4)" }}>
        {regras}
        {roll(m.faixa)}
      </div>
      <p className="sr-only-vapti">{C.marcos.map(resumoMarco).join(" ")}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Aba 3 — Pix Automático                                                      */
/* -------------------------------------------------------------------------- */

export function PainelPix() {
  const Px = P.pix;
  const g = Px.programacao;
  return (
    <div className="flex flex-col gap-[var(--esp-4)]">
      <h3 className="font-titulo text-corpo-g font-bold text-texto">{Px.titulo}</h3>
      <div className="dividir" style={{ ["--colunas" as string]: "minmax(0, 1.05fr) minmax(0, 1fr)", ["--vao" as string]: "var(--esp-7)" }}>
        <div className="flex flex-col gap-[var(--esp-4)]">
          <Rotulo>{Px.ondeCabe}</Rotulo>
          {Px.planos.map((pl) => (
            <div key={pl.nome} className={`flex items-start gap-[0.7em] rounded-3 border-2 px-[0.9em] py-[0.55em] ${pl.cabe ? "border-verde-borda bg-verde-suave" : "border-coral-borda bg-coral-suave"}`}>
              <span className={`mt-[0.1em] grid size-[1.6em] flex-none place-items-center rounded-full text-corpo ${pl.cabe ? "bg-verde text-sobre-verde" : "bg-coral text-sobre-coral"}`}>
                <Icone icone={pl.cabe ? Check : Xis} tamanho="1em" strokeWidth={2.6} />
              </span>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-[0.6em] text-corpo font-semibold text-texto">
                  {pl.nome}
                  <span className={`font-mono uppercase ${pl.cabe ? "text-verde" : "text-coral"}`} style={{ letterSpacing: "0.06em" }}>
                    {pl.cabe ? Px.cabe : Px.naoCabe}
                  </span>
                </p>
                <p className="text-apoio leading-snug text-texto-2">{pl.texto}</p>
              </div>
            </div>
          ))}
          <div>
            <Rotulo>{Px.periodicidadesRotulo}</Rotulo>
            <ul className="mt-[0.35em] flex list-none flex-wrap items-center gap-[0.4em] p-0">
              {Px.periodicidades.map((pr, i) => (
                <li
                  key={pr}
                  className={`rounded-full border px-[0.7em] py-[0.12em] text-apoio ${i === 0 ? "border-verde bg-verde-suave font-semibold text-texto" : "border-borda-forte text-texto-2"}`}
                >
                  {pr}
                </li>
              ))}
              <li className="text-apoio text-texto-3">{Px.minima}</li>
            </ul>
          </div>
          <div>
            <Rotulo>{Px.quemPaga.titulo}</Rotulo>
            <dl className="m-0 mt-[0.35em] border-b border-borda">
              {Px.quemPaga.linhas.map((l) => (
                <div key={l.quem} className="grid gap-x-[1em] border-t border-borda py-[0.4em]" style={{ gridTemplateColumns: "minmax(0, 0.75fr) minmax(0, 1.25fr)" }}>
                  <dt className="text-apoio font-semibold text-texto">{l.quem}</dt>
                  <dd className="m-0 text-apoio leading-snug text-texto-2">{l.oque}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="flex flex-col gap-[var(--esp-5)]">
          {/* Programação: janela de 2 a 10 dias antes do vencimento (fora de escala) */}
          <div className="rounded-3 border border-borda bg-superficie px-[0.9em] py-[0.6em]">
            <p className="text-corpo font-semibold text-texto">{g.titulo}</p>
            <p className="text-apoio leading-snug text-texto-2">{g.texto}</p>
            <div className="plano-janela mt-[0.6em]" aria-hidden="true">
              <span className="plano-janela__faixa">
                <span className="font-mono">{g.de}</span>
                <span>{g.janela}</span>
                <span className="font-mono">{g.ate}</span>
              </span>
              <span className="plano-janela__d0">
                <span className="font-mono font-bold">{g.d0}</span>
                <span>{g.vencimento}</span>
              </span>
            </div>
            <p className="mt-[0.5em] text-apoio leading-snug text-texto-3">{g.retentativas}</p>
          </div>
          <div>
            <p className="flex items-center gap-[0.5em]">
              <Icone icone={CircleHelp} tamanho="1.1em" className="text-azul" />
              <Rotulo tom="azul">{Px.perguntas.titulo}</Rotulo>
            </p>
            <ol className="m-0 mt-[0.35em] flex list-none flex-col gap-[0.3em] p-0">
              {Px.perguntas.itens.map((q, i) => (
                <li key={q} className="grid gap-x-[0.6em] text-apoio leading-snug text-texto" style={{ gridTemplateColumns: "1.4em minmax(0, 1fr)" }}>
                  <span className="font-mono font-bold text-azul">{i + 1}</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-apoio text-texto-3">{Px.fonte}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modo leitura: abas de verdade, com estado local                            */
/* -------------------------------------------------------------------------- */

export function PlanoInterativo() {
  const [aba, setAba] = useState<IdAba>("aquisicao");
  const base = useId();
  const idPainel = `${base}-painel`;
  const escolher = (id: IdAba, teclado: boolean) => {
    setAba(id);
    if (teclado) requestAnimationFrame(() => document.getElementById(`${base}-${id}`)?.focus());
  };
  return (
    <div className="flex flex-col gap-[var(--esp-5)]">
      <Abas ativa={aba} aoEscolher={escolher} idBase={base} idPainel={idPainel} />
      <Painel id={idPainel} rotuladoPor={`${base}-${aba}`}>
        {aba === "aquisicao" ? <PainelAquisicao estatico={false} /> : aba === "cobranca" ? <PainelCobranca estatico={false} /> : <PainelPix />}
      </Painel>
    </div>
  );
}

export function Painel({ id, rotuladoPor, children }: { id: string; rotuladoPor?: string; children: ReactNode }) {
  return (
    <div id={id} role={rotuladoPor ? "tabpanel" : undefined} aria-labelledby={rotuladoPor} tabIndex={rotuladoPor ? 0 : undefined} className="plano-painel min-h-0">
      {children}
    </div>
  );
}
