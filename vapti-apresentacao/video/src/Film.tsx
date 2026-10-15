/**
 * O filme: lê a timeline, escolhe o ato ativo em `t`, faz o crossfade de 0,7 s nas
 * fronteiras e desenha as camadas globais (capítulo, marca no canto, card final,
 * graduação, vinheta, grão, legenda e o preto de abertura/fechamento).
 *
 * Função pura de `t`: o mesmo `t` produz sempre o mesmo quadro, em qualquer ordem.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import {
  CardFinal,
  Capitulo,
  criarFilme,
  ease,
  FilmeContext,
  Grao,
  Graduacao,
  Legenda,
  MarcaCanto,
  prog,
  rgba,
  tMarcaCanto,
  Vinheta,
  type TomGraduacao,
} from "./kit";
import type { Cena } from "./scenes";
import { fronteira, indiceAtoEm, type Timeline } from "./timeline";

/** Duração do crossfade entre atos (s), centrado na fronteira. */
export const CROSSFADE = 0.7;
/** Preto inicial (s). */
export const PRETO_INICIAL = 0.8;

/** Graduação de cor por ato: calor humano no problema e no fecho; frio nos números e riscos. */
const TOM_ATO: Record<string, TomGraduacao> = {
  A1: "quente",
  A2: "neutro",
  A3: "neutro",
  A4: "quente",
  A5: "frio",
  A6: "frio",
  A7: "frio",
  A8: "neutro",
  A9: "quente",
};

export interface FilmProps {
  tl: Timeline;
  cenas: Record<string, Cena>;
  t: number;
  /** Sem grão (prévia rápida). */
  rascunho?: boolean;
  /** Legenda queimada. */
  legenda?: boolean;
  /** Frase a partir da qual a marca fica no canto (padrão "F009"). */
  marcaDesde?: string;
  /** Traço "vupt" que cruza a tela na troca de ato (padrão true). */
  passagem?: boolean;
}

interface CamadaAto {
  i: number;
  opacidade: number;
  transform: string;
}

/** Quais atos desenhar em `t` e com que opacidade (o de cima entra por dissolução). */
export function atosVisiveis(tl: Timeline, t: number): { camadas: CamadaAto[]; troca: number | null; pTroca: number } {
  const n = tl.atos.length;
  const meio = CROSSFADE / 2;
  for (let k = 0; k < n - 1; k++) {
    const B = fronteira(tl, k);
    if (t >= B - meio && t < B + meio) {
      const p = ease.inOutSine(prog(t, B - meio, B + meio));
      return {
        troca: k,
        pTroca: p,
        camadas: [
          { i: k, opacidade: 1, transform: `scale(${(1 + 0.025 * p).toFixed(5)})` },
          { i: k + 1, opacidade: p, transform: `scale(${(0.985 + 0.015 * p).toFixed(5)})` },
        ],
      };
    }
  }
  return { troca: null, pTroca: 0, camadas: [{ i: indiceAtoEm(tl, t), opacidade: 1, transform: "none" }] };
}

/** Captura erros de uma cena e mostra na tela (e no console), sem derrubar o filme. */
class LimiteDeErro extends Component<{ nome: string; children: ReactNode }, { erro: Error | null }> {
  state: { erro: Error | null } = { erro: null };
  static getDerivedStateFromError(erro: Error) {
    return { erro };
  }
  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error(`[filme] erro na cena ${this.props.nome}:`, erro, info.componentStack);
  }
  render() {
    if (this.state.erro) {
      return (
        <div className="absolute inset-0 grid place-items-center" style={{ background: "var(--cor-tinta)" }}>
          <p className="font-mono" style={{ fontSize: 28, color: "var(--cor-coral)", maxWidth: 1400 }}>
            Erro na cena {this.props.nome}: {this.state.erro.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Traço "vupt" que atravessa a tela na troca de ato (a assinatura da marca, discreta). */
function Passagem({ p }: { p: number }) {
  if (p <= 0.02 || p >= 0.98) return null;
  const x = -420 + 2760 * ease.inOutCubic(p);
  const a = Math.sin(p * Math.PI);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {[0.09, 0.05, 0.025].map((atraso, k) => {
        const xr = -420 + 2760 * ease.inOutCubic(Math.max(0, p - atraso));
        return (
          <span
            key={k}
            style={{
              position: "absolute",
              left: 0,
              top: 536,
              width: 300,
              height: 8,
              borderRadius: 2,
              background: "var(--cor-verde)",
              opacity: a * (0.12 + k * 0.1),
              transform: `translate(${xr.toFixed(1)}px, 0) skewX(-24deg)`,
            }}
          />
        );
      })}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 536,
          width: 300,
          height: 8,
          borderRadius: 2,
          background: "var(--cor-verde)",
          opacity: a * 0.7,
          boxShadow: `0 0 28px ${rgba("verde", 0.5)}`,
          transform: `translate(${x.toFixed(1)}px, 0) skewX(-24deg)`,
        }}
      />
    </div>
  );
}

/** O filme inteiro no instante `t`. */
export function Film({ tl, cenas, t, rascunho = false, legenda = false, marcaDesde = "F009", passagem = true }: FilmProps) {
  const { camadas, troca, pTroca } = atosVisiveis(tl, t);
  const iAtual = camadas[camadas.length - 1].i;
  const base = criarFilme(tl, t, iAtual, { rascunho, legenda });
  const [c0, c1] = tl.marcas.cardFinal;
  const cardCobre = t >= c0 + 0.65; // card opaco: não desenha mais o ato embaixo

  // Capítulo do ato atual: entra logo antes da primeira fala (nunca durante o preto)
  const atoAtual = tl.atos[iAtual];
  const primeira = tl.frases.find((f) => f.id === atoAtual.primeira);
  const emCapitulo = Math.max(PRETO_INICIAL + 0.1, (primeira?.inicio ?? atoAtual.inicio) - 0.1);

  // Graduação: cruza os tons na troca de ato
  const tomDe = TOM_ATO[tl.atos[camadas[0].i].id] ?? "neutro";
  const tomPara = TOM_ATO[atoAtual.id] ?? "neutro";

  // Preto de abertura e fade final depois do card
  const pretoAbertura = 1 - ease.inOutSine(prog(t, PRETO_INICIAL, PRETO_INICIAL + 0.45));
  const pretoFinal = tl.duracao - c1 > 0.1 ? ease.inOutSine(prog(t, c1, tl.duracao)) : 0;
  const preto = Math.max(pretoAbertura, pretoFinal);

  return (
    <FilmeContext.Provider value={base}>
      <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
        {!cardCobre && preto < 1
          ? camadas.map(({ i, opacidade, transform }) => {
              const ato = tl.atos[i];
              const C = cenas[ato.id]?.Componente;
              if (!C) return null;
              return (
                <div key={ato.id} className="absolute inset-0 overflow-hidden" style={{ opacity: opacidade, transform, background: "var(--cor-tinta)" }}>
                  <FilmeContext.Provider value={{ ...base, ato, iAto: i }}>
                    <LimiteDeErro nome={ato.id}>
                      <C />
                    </LimiteDeErro>
                  </FilmeContext.Provider>
                </div>
              );
            })
          : null}

        {passagem && troca !== null ? <Passagem p={pTroca} /> : null}

        {t >= c0 - 0.01 ? <CardFinal t0={c0} t1={c1} /> : null}

        {troca !== null ? (
          <>
            <Graduacao tom={tomDe} intensidade={1 - pTroca} />
            <Graduacao tom={tomPara} intensidade={pTroca} />
          </>
        ) : (
          <Graduacao tom={tomPara} />
        )}
        <Vinheta />
        {/* orientação acima da vinheta (legível nos cantos), abaixo do grão */}
        {!cardCobre ? <Capitulo key={atoAtual.id} texto={atoAtual.capitulo} em={emCapitulo} /> : null}
        <MarcaCanto em={tMarcaCanto(tl, marcaDesde)} ate={c0} />
        <Grao />
        {legenda ? <Legenda /> : null}
        {preto > 0.001 ? <div className="absolute inset-0" style={{ background: "#000", opacity: preto }} /> : null}
      </div>
    </FilmeContext.Provider>
  );
}
