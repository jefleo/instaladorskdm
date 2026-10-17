import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Moon, ShieldAlert, Sun, TrendingUp } from "lucide-react";
import { Card, Icone, Kpi, MolduraCelular, Selo, TabelaComparativa, TituloSecao, Wordmark } from "../components/base";

/*
 * Página interna #/estilo — referência visual para todo o time.
 * Todos os dados aqui são NEUTROS e de exemplo (rótulos genéricos, valores-placeholder).
 * Não usar nada desta página como conteúdo da apresentação.
 */

const secao: CSSProperties = { containerType: "inline-size", containerName: "secao" };

const PALETA = [
  { nome: "Tinta", var: "--cor-tinta", escuro: "#0E1116", claro: "#FAFAF7", uso: "Fundo do palco." },
  { nome: "Superfície", var: "--cor-superficie", escuro: "#161B22", claro: "#FFFFFF", uso: "Cartões e tabelas." },
  { nome: "Superfície 2", var: "--cor-superficie-2", escuro: "#1D242E", claro: "#F1F1EC", uso: "Elevada: popover, destaque neutro." },
  { nome: "Texto", var: "--cor-texto", escuro: "#F2F4F7", claro: "#12161C", uso: "Títulos e texto principal." },
  { nome: "Texto 2", var: "--cor-texto-2", escuro: "#B4BCC7", claro: "#3D4652", uso: "Subtítulos e corpo de apoio." },
  { nome: "Texto 3", var: "--cor-texto-3", escuro: "#8B95A1", claro: "#59626D", uso: "Legendas e rótulos de eixo." },
  { nome: "Verde-elétrico", var: "--cor-verde", escuro: "#B6F23A", claro: "#3F6A00", uso: "Dinheiro entrando. Vapti." },
  { nome: "Coral", var: "--cor-coral", escuro: "#FF7A45", claro: "#B23E0B", uso: "Risco e alerta." },
  { nome: "Azul-gelo", var: "--cor-azul", escuro: "#8FB8FF", claro: "#2456B5", uso: "Dado neutro." },
  { nome: "Cinza", var: "--cor-cinza", escuro: "#8B95A1", claro: "#59626D", uso: "Terceiros e referências. Só texto." },
];

const fmtInteiro = (v: number) => Math.round(v).toLocaleString("pt-BR");
const fmtPct = (v: number) => `${v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

type LinhaExemplo = { item: string; a: string; b: string; c: string };
const LINHAS: LinhaExemplo[] = [
  { item: "Opção A", a: "1.000", b: "10,0%", c: "100,00" },
  { item: "Opção B", a: "2.000", b: "12,5%", c: "250,00" },
  { item: "Opção C", a: "3.000", b: "15,0%", c: "450,00" },
  { item: "Opção D", a: "4.000", b: "17,5%", c: "700,00" },
];

function Bloco({ n, nome, children }: { n: string; nome: string; children: ReactNode }) {
  return (
    <section style={secao} className="border-t border-borda">
      <div style={{ padding: "var(--esp-8) var(--palco-margem)" }}>
        <p className="mb-[var(--esp-6)] flex items-center gap-[0.6em] font-mono text-eyebrow uppercase tracking-[0.14em] text-texto-3">
          <span className="text-verde">{n}</span>
          <span className="traco-vupt" aria-hidden="true" style={{ width: "1.1em", height: "0.22em" }} />
          {nome}
        </p>
        {children}
      </div>
    </section>
  );
}

export function PaginaEstilo() {
  const [claro, setClaro] = useState(() => document.documentElement.dataset.modo === "claro");
  useEffect(() => {
    const html = document.documentElement;
    if (claro) html.dataset.modo = "claro";
    else delete html.dataset.modo;
  }, [claro]);

  return (
    <main className="min-h-screen bg-tinta font-texto text-texto">
      {/* Cabeçalho */}
      <section style={secao} className="fundo-pauta">
        <div className="flex flex-wrap items-end justify-between gap-8" style={{ padding: "var(--palco-topo) var(--palco-margem) var(--esp-8)" }}>
          <div>
            <Wordmark tamanho="var(--fs-display)" />
            <p className="mt-[var(--esp-5)] font-mono text-eyebrow uppercase tracking-[0.14em] text-texto-3">Guia de estilo · página interna · dados de exemplo</p>
          </div>
          <button
            type="button"
            onClick={() => setClaro((v) => !v)}
            aria-pressed={claro}
            className="inline-flex items-center gap-3 rounded-full border border-borda-forte bg-superficie px-6 py-3 font-mono text-apoio uppercase tracking-[0.08em] text-texto hover:bg-superficie-2"
          >
            <Icone icone={claro ? Moon : Sun} tamanho="1.1em" />
            {claro ? "Ver escuro" : "Ver claro (impressão)"}
          </button>
        </div>
      </section>

      <Bloco n="01" nome="Paleta">
        <ul className="grid gap-[var(--esp-4)]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}>
          {PALETA.map((c) => (
            <li key={c.var} className="overflow-hidden rounded-3 border border-borda bg-superficie">
              <div className="h-[112px] border-b border-borda" style={{ background: `var(${c.var})` }} />
              <div className="p-[var(--esp-5)]">
                <p className="font-titulo text-[28px] font-bold leading-none">{c.nome}</p>
                <p className="mt-2 font-mono text-[18px] text-texto-2">
                  {claro ? c.claro : c.escuro} · <span className="text-texto-3">{c.var}</span>
                </p>
                <p className="mt-2 text-apoio text-texto-2">{c.uso}</p>
              </div>
            </li>
          ))}
        </ul>
      </Bloco>

      <Bloco n="02" nome="Tipografia">
        <div className="grid gap-[var(--esp-7)]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))" }}>
          <div className="space-y-[var(--esp-5)]">
            <Amostra rotulo="Display · Bricolage 800 · --fs-display">
              <p className="font-titulo text-display font-extrabold" style={{ lineHeight: 0.98, letterSpacing: "-0.04em" }}>
                Rápido de usar. Claro de entender.
              </p>
            </Amostra>
            <Amostra rotulo="Título-conclusão · --fs-titulo">
              <p className="font-titulo text-titulo font-extrabold" style={{ lineHeight: 1.02, letterSpacing: "-0.035em" }}>
                Uma frase que fecha o argumento.
              </p>
            </Amostra>
            <Amostra rotulo="Subtítulo · Manrope 500 · --fs-subtitulo">
              <p className="text-subtitulo font-medium text-texto-2">Uma linha de apoio que explica o título em poucas palavras.</p>
            </Amostra>
          </div>
          <div className="space-y-[var(--esp-5)]">
            <Amostra rotulo="Corpo · Manrope 400 · --fs-corpo (26px no palco)">
              <p className="text-corpo text-texto-2">
                Frases curtas. Um número por frase. <strong className="font-semibold text-texto">O destaque vai em semibold</strong>, nunca em
                caixa alta corrida.
              </p>
            </Amostra>
            <Amostra rotulo="Apoio · --fs-apoio (22px: mínimo absoluto)">
              <p className="text-apoio text-texto-3">Legendas, fontes e rótulos de eixo. Nada de conteúdo abaixo disso no palco.</p>
            </Amostra>
            <Amostra rotulo="Números · JetBrains Mono 700 · tabular">
              <p className="font-mono text-kpi-p font-bold text-verde" style={{ letterSpacing: "-0.04em", lineHeight: 1 }}>
                0123456789
              </p>
              <p className="mt-2 font-mono text-corpo text-texto-2">R$ 1.111,11 · 22,2% · 333 dias</p>
            </Amostra>
          </div>
        </div>
      </Bloco>

      <Bloco n="03" nome="Título de seção">
        <TituloSecao
          numero={3}
          nome="Nome da seção"
          titulo="O título é a conclusão, não o assunto."
          subtitulo="O subtítulo dá a prova em uma frase. O eyebrow orienta: número, traço, nome."
        />
      </Bloco>

      <Bloco n="04" nome="KPI">
        <div className="flex flex-wrap items-start gap-x-[var(--esp-9)] gap-y-[var(--esp-7)]">
          <Kpi valor={123456} formatar={fmtInteiro} rotulo="Valor de exemplo" legenda="Legenda curta: de onde vem o número." selo="projecao" tamanho="g" />
          <Kpi valor={42.5} formatar={fmtPct} rotulo="Indicador de risco" legenda="Coral sinaliza risco." tom="coral" selo="ilustrativo" />
          <Kpi valor={7} formatar={fmtInteiro} rotulo="Dado neutro" legenda="Azul-gelo para contexto." tom="azul" />
        </div>
      </Bloco>

      <Bloco n="05" nome="Selos">
        <div className="flex flex-wrap items-center gap-[var(--esp-5)]">
          <Selo tipo="projecao" />
          <Selo tipo="ilustrativo" />
          <Selo tipo="prototipo" />
          <p className="text-apoio text-texto-3">“Projeção” abre as premissas (clique, Enter ou Espaço; Esc fecha).</p>
        </div>
      </Bloco>

      <Bloco n="06" nome="Tabela comparativa">
        <TabelaComparativa<LinhaExemplo>
          legenda="Tabela de exemplo com linha destacada"
          legendaVisivel
          destaque={2}
          colunas={[
            { chave: "item", titulo: "Item", largura: "34%" },
            { chave: "a", titulo: "Coluna A", numerica: true },
            { chave: "b", titulo: "Terceiro", numerica: true, tom: "cinza" },
            { chave: "c", titulo: "Vapti", numerica: true, tom: "verde" },
          ]}
          linhas={LINHAS}
        />
      </Bloco>

      <Bloco n="07" nome="Vantagens × riscos (mesmo peso)">
        <div className="grid gap-[var(--esp-5)]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))" }}>
          <Card tom="verde" titulo="Vantagem de exemplo" icone={TrendingUp}>
            <p>
              Texto de apoio com <strong>um destaque</strong>. A estrutura é idêntica à do cartão ao lado.
            </p>
          </Card>
          <Card tom="coral" titulo="Risco de exemplo" icone={ShieldAlert}>
            <p>
              Texto de apoio com <strong>um destaque</strong>. Mesma borda, mesmo fundo, mesmo título.
            </p>
          </Card>
        </div>
      </Bloco>

      <Bloco n="08" nome="Moldura de celular">
        <div className="flex flex-wrap items-center gap-[var(--esp-8)]">
          <MolduraCelular largura={330} rotulo="Exemplo de tela">
            <TelaExemplo />
          </MolduraCelular>
          <div className="max-w-[36ch] space-y-4">
            <Selo tipo="prototipo" />
            <p className="text-corpo text-texto-2">Proporção 390×844. Sem marca de aparelho. A tela segue o modo escuro ou claro e rola por dentro.</p>
          </div>
        </div>
      </Bloco>

      <Bloco n="09" nome="Amostra · linha do tempo em duas trilhas">
        <LinhaDoTempoAmostra />
      </Bloco>

      <Bloco n="10" nome="Amostra · diagrama de fluxo">
        <FluxoAmostra />
      </Bloco>

      <footer style={secao} className="border-t border-borda">
        <div className="flex items-center justify-between gap-6" style={{ padding: "var(--esp-7) var(--palco-margem)" }}>
          <Wordmark tamanho={40} />
          <p className="font-mono text-apoio text-texto-3">tokens: src/styles/tokens.css</p>
        </div>
      </footer>
    </main>
  );
}

function Amostra({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-borda pl-[var(--esp-5)]">
      <p className="mb-3 font-mono text-[16px] uppercase tracking-[0.1em] text-texto-3">{rotulo}</p>
      {children}
    </div>
  );
}

function TelaExemplo() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-16 font-texto">
      <Wordmark tamanho={28} />
      <p className="mt-8 text-[15px] text-texto-3">Saldo de exemplo</p>
      <p className="font-mono text-[44px] font-bold tracking-[-0.04em] text-verde">0.000</p>
      <div className="mt-6 rounded-2 border border-borda bg-superficie p-4">
        <p className="text-[15px] text-texto-2">Cartão de exemplo</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-superficie-3">
          <div className="h-full w-3/5 rounded-full bg-verde" />
        </div>
      </div>
      <button type="button" className="mt-auto rounded-full bg-verde py-4 font-semibold text-[var(--cor-sobre-verde)]">
        Botão principal
      </button>
    </div>
  );
}

/* ---- Amostra estática: linha do tempo de duas trilhas -------------------- */
const MARCOS_T = ["T0", "T1", "T2", "T3", "T4", "T5", "T6"];
const TRILHAS = [
  { nome: "Trilha de referência", tom: "cinza" as const, marcos: [{ t: 0, r: "Marco 1" }, { t: 3, r: "Marco 2" }, { t: 6, r: "Marco 3" }], ate: 6 },
  { nome: "Trilha Vapti", tom: "verde" as const, marcos: [{ t: 0, r: "Início" }, { t: 1, r: "Etapa 2" }, { t: 2.5, r: "Etapa 3" }, { t: 4, r: "Etapa 4" }], ate: 4 },
];

function LinhaDoTempoAmostra() {
  const pct = (t: number) => `${(t / (MARCOS_T.length - 1)) * 100}%`;
  return (
    <figure className="rounded-4 border border-borda bg-superficie" style={{ padding: "var(--esp-7) var(--esp-7) var(--esp-6)" }}>
      <div className="grid gap-y-[var(--esp-7)]" style={{ gridTemplateColumns: "minmax(0, 24%) 1fr", columnGap: "var(--esp-7)" }}>
        {TRILHAS.map((tr) => {
          const cor = tr.tom === "verde" ? "var(--cor-verde)" : "var(--cor-cinza)";
          return (
            <div key={tr.nome} className="contents">
              <p className={`self-center font-titulo text-h3 font-bold leading-[1.05] ${tr.tom === "verde" ? "text-verde" : "text-texto-2"}`}>{tr.nome}</p>
              <div className="relative h-[92px] pr-[3ch]">
                <div className="relative h-full">
                  {/* trilho de fundo */}
                  <span className="absolute inset-x-0 top-[22px] h-[2px] bg-borda" />
                  {/* trilho ativo: cinza tracejado, verde sólido e mais grosso */}
                  <span
                    className="absolute left-0 top-[22px] -translate-y-1/2"
                    style={
                      tr.tom === "verde"
                        ? { width: pct(tr.ate), height: 8, background: cor, borderRadius: 4 }
                        : { width: pct(tr.ate), height: 0, borderTop: `3px dashed ${cor}`, top: 22 }
                    }
                  />
                  {tr.marcos.map((m) => (
                    <div key={m.r} className="absolute top-0 -translate-x-1/2 text-center" style={{ left: pct(m.t) }}>
                      <span
                        className="mx-auto block size-[44px] rounded-full border-[3px]"
                        style={{ borderColor: cor, background: tr.tom === "verde" ? cor : "var(--cor-superficie)", transform: "scale(0.5)" }}
                      />
                      <span className={`mt-1 block whitespace-nowrap text-apoio font-semibold ${tr.tom === "verde" ? "text-texto" : "text-texto-2"}`}>{m.r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        {/* eixo */}
        <span />
        <div className="relative h-[32px] border-t border-borda-forte pr-[3ch]">
          <div className="relative h-full">
            {MARCOS_T.map((t, i) => (
              <span key={t} className="absolute top-[10px] -translate-x-1/2 font-mono text-apoio text-texto-3" style={{ left: pct(i) }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-[var(--esp-6)] flex flex-wrap items-center gap-[var(--esp-5)] text-apoio text-texto-3">
        <Selo tipo="ilustrativo" tamanho="sm" />
        Referência visual para o dev-dataviz: terceiro em cinza tracejado; Vapti em verde sólido, mais grosso.
      </figcaption>
    </figure>
  );
}

/* ---- Amostra estática: fluxo de 5 caixas -------------------------------- */
const ETAPAS = [
  { n: "01", t: "Origem", d: "Quem inicia", tom: "neutro" },
  { n: "02", t: "Análise", d: "Regra visível", tom: "azul" },
  { n: "03", t: "Plataforma", d: "Nó central", tom: "verde" },
  { n: "04", t: "Parceiro", d: "Terceiro, só texto", tom: "cinza" },
  { n: "05", t: "Retorno", d: "Fecha o ciclo", tom: "neutro" },
] as const;

const CAIXA = {
  neutro: { borda: "var(--cor-borda-forte)", fundo: "var(--cor-superficie)", titulo: "var(--cor-texto)" },
  azul: { borda: "var(--cor-azul-borda)", fundo: "var(--cor-azul-suave)", titulo: "var(--cor-azul)" },
  verde: { borda: "var(--cor-verde)", fundo: "var(--cor-verde-suave)", titulo: "var(--cor-verde)" },
  cinza: { borda: "var(--cor-cinza-borda)", fundo: "var(--cor-cinza-suave)", titulo: "var(--cor-texto-2)" },
};

function FluxoAmostra() {
  return (
    <figure>
      <style>{`
        .fluxo { display: flex; align-items: stretch; gap: 0; }
        .fluxo-caixa { flex: 1 1 0; min-width: 0; }
        .fluxo-seta { flex: none; display: grid; place-items: center; width: 3.2em; }
        @container secao (max-width: 1100px) {
          .fluxo { flex-direction: column; }
          .fluxo-seta { width: auto; height: 2.4em; }
          .fluxo-seta svg { transform: rotate(90deg); }
        }
      `}</style>
      <ol className="fluxo text-corpo">
        {ETAPAS.map((e, i) => {
          const c = CAIXA[e.tom];
          return (
            <li key={e.n} className="contents">
              <div
                className="fluxo-caixa rounded-3 border-2 p-[0.9em]"
                style={{ borderColor: c.borda, background: c.fundo, borderStyle: e.tom === "cinza" ? "dashed" : "solid" }}
              >
                <p className="font-mono text-apoio text-texto-3">{e.n}</p>
                <p className="mt-1 font-titulo text-h3 font-bold leading-none" style={{ color: c.titulo }}>
                  {e.t}
                </p>
                <p className="mt-2 text-apoio text-texto-2">{e.d}</p>
              </div>
              {i < ETAPAS.length - 1 ? (
                <span className="fluxo-seta text-texto-3" aria-hidden="true">
                  <Icone icone={ArrowRight} tamanho="1.4em" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <figcaption className="mt-[var(--esp-6)] flex flex-wrap items-center gap-[var(--esp-5)] text-apoio text-texto-3">
        <Selo tipo="ilustrativo" tamanho="sm" />
        Nó da Vapti em verde com borda sólida; terceiros em cinza tracejado; setas finas em texto-3.
      </figcaption>
    </figure>
  );
}
