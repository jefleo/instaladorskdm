/**
 * V07 — telas do celular recriadas como função pura de `t` (o protótipo do site usa motion e
 * estado; aqui nada disso). Dados fictícios de src/content/ui.ts → prototipo. Balões genéricos,
 * sem logotipo de terceiros. Tela de 370 × 801 px.
 */
import { Check, Link2, Mic, Play } from "lucide-react";
import { prototipo } from "../../../../src/content/ui";
import { preco, produto } from "../../../../src/data/vapti";
import { COR, ease, prog, rgba, spring, useFilme } from "../../kit";
import { mix, surge } from "./comum";

export const TELA = { w: 370, h: 801 } as const;
const PAD = 28;

const mono = { fontFamily: "var(--fonte-mono)", fontVariantNumeric: "tabular-nums" } as const;
const texto = { fontFamily: "var(--fonte-texto)" } as const;
const tit = { fontFamily: "var(--fonte-titulo)", fontWeight: 800, letterSpacing: "-0.03em" } as const;

function BarraStatus() {
  return (
    <div style={{ position: "absolute", left: PAD + 6, top: 16, ...mono, fontSize: 22, fontWeight: 600, color: "var(--cor-texto-2)" }}>{prototipo.ficticio.hora}</div>
  );
}

/** Toque: círculo que expande e some. */
export function Toque({ x, y, em }: { x: number; y: number; em: number }) {
  const { t } = useFilme();
  const p = prog(t, em, em + 0.55);
  if (p <= 0 || p >= 1) return null;
  const r = mix(14, 70, ease.outCubic(p));
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: 999, border: `3px solid rgb(242 244 247 / ${(0.8 * (1 - p)).toFixed(3)})`, background: `rgb(242 244 247 / ${(0.18 * (1 - p)).toFixed(3)})` }} />;
}

/* ------------------------------------------------------------------ */
/* Limite + sacar (F023)                                                */
/* ------------------------------------------------------------------ */

export function TelaLimite({ tSaca }: { tSaca: number }) {
  const { t } = useFilme();
  const uso = ease.inOutCubic(prog(t, tSaca + 0.35, tSaca + 1.2));
  const aperta = t > tSaca && t < tSaca + 0.3 ? 0.96 : 1;
  return (
    <div className="absolute inset-0">
      <BarraStatus />
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 110 }}>
        <div style={{ ...texto, fontSize: 26, fontWeight: 600, color: "var(--cor-texto-2)" }}>Seu limite</div>
        <div style={{ ...mono, fontSize: 80, fontWeight: 700, color: COR.verde, letterSpacing: "-0.05em", marginTop: 6, textShadow: `0 0 24px ${rgba("verde", 0.3)}` }}>{prototipo.ficticio.limiteAtual}</div>
        <div style={{ marginTop: 22, height: 18, borderRadius: 9, background: "var(--cor-superficie-3)", overflow: "hidden" }}>
          <div style={{ width: `${(100 * (1 - 0.8 * uso)).toFixed(2)}%`, height: "100%", borderRadius: 9, background: COR.verde }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 470, height: 92, borderRadius: 999, background: COR.verde, display: "grid", placeItems: "center", transform: `scale(${aperta})`, boxShadow: `0 14px 40px -10px ${rgba("verde", 0.5)}` }}>
        <span style={{ ...texto, fontSize: 32, fontWeight: 800, color: "var(--cor-tinta)" }}>Sacar {prototipo.proposta.recebe}</span>
      </div>
      <Toque x={TELA.w / 2} y={516} em={tSaca} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Conversa (F024–F025)                                                 */
/* ------------------------------------------------------------------ */

const ONDA = Array.from({ length: 22 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6 + 0.4)));

function Pop({ em, lado, children, style }: { em: number; lado: "esq" | "dir"; children: React.ReactNode; style?: React.CSSProperties }) {
  const { t } = useFilme();
  const s = spring(t - em, { k: 260, d: 20 });
  if (s <= 0.001) return null;
  return <div style={{ alignSelf: lado === "dir" ? "flex-end" : "flex-start", transform: `scale(${(0.7 + 0.3 * s).toFixed(4)})`, transformOrigin: lado === "dir" ? "100% 100%" : "0% 100%", opacity: Math.min(1, s * 2), ...style }}>{children}</div>;
}

export function TelaConversa({ tGrava, tAudio, tResposta, tLink, tToqueLink }: { tGrava: number; tAudio: number; tResposta: number; tLink: number; tToqueLink: number }) {
  const { t } = useFilme();
  const c = prototipo.conversa;
  const audio = c.baloes[0];
  const gravando = t >= tGrava && t < tAudio;
  const pGrava = prog(t, tGrava, tAudio);
  const digitando = t > tAudio + 0.35 && t < tResposta;
  return (
    <div className="absolute inset-0" style={{ display: "flex", flexDirection: "column" }}>
      <BarraStatus />
      {/* cabeçalho */}
      <div style={{ marginTop: 58, padding: `0 ${PAD - 6}px 16px`, display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid rgb(255 255 255 / 0.08)" }}>
        <div style={{ width: 52, height: 52, borderRadius: 99, background: COR.verde, display: "grid", placeItems: "center", ...tit, fontSize: 28, color: "var(--cor-tinta)" }}>V</div>
        <div>
          <div style={{ ...texto, fontSize: 26, fontWeight: 800, color: "var(--cor-texto)" }}>{c.contato}</div>
          <div style={{ ...texto, fontSize: 22, color: "var(--cor-texto-3)" }}>{c.contatoStatus}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 16, padding: `16px ${PAD - 8}px 20px` }}>
        <Pop em={tAudio} lado="dir">
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderRadius: "22px 22px 6px 22px", background: rgba("verde", 0.16), border: `1.5px solid ${rgba("verde", 0.4)}` }}>
            <div style={{ width: 40, height: 40, borderRadius: 99, background: COR.verde, display: "grid", placeItems: "center", color: "var(--cor-tinta)" }}>
              <Play size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, height: 40 }}>
              {ONDA.map((v, i) => (
                <div key={i} style={{ width: 5, height: 6 + 30 * v, borderRadius: 3, background: i < 6 ? COR.verde : "rgb(242 244 247 / 0.6)" }} />
              ))}
            </div>
            <span style={{ ...mono, fontSize: 22, color: "var(--cor-texto-2)" }}>{audio.tipo === "audio" ? audio.duracao : ""}</span>
          </div>
        </Pop>
        {digitando ? (
          <Pop em={tAudio + 0.35} lado="esq">
            <div style={{ display: "flex", gap: 8, padding: "20px 22px", borderRadius: "22px 22px 22px 6px", background: "var(--cor-superficie-3)" }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ width: 12, height: 12, borderRadius: 99, background: "rgb(242 244 247 / 0.6)", opacity: 0.4 + 0.6 * Math.max(0, Math.sin((t * 2.2 - k * 0.22) * Math.PI)) }} />
              ))}
            </div>
          </Pop>
        ) : null}
        <Pop em={tResposta} lado="esq">
          <div style={{ width: 260, padding: "20px 22px", borderRadius: "22px 22px 22px 6px", background: "var(--cor-superficie-3)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ height: 14, borderRadius: 7, background: "rgb(242 244 247 / 0.32)", width: "92%" }} />
            <div style={{ height: 14, borderRadius: 7, background: "rgb(242 244 247 / 0.32)", width: "64%" }} />
          </div>
        </Pop>
        <Pop em={tLink} lado="esq">
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", borderRadius: "22px 22px 22px 6px", background: "var(--cor-superficie-3)", border: `1.5px solid ${rgba("verde", 0.45)}`, transform: t > tToqueLink && t < tToqueLink + 0.25 ? "scale(0.97)" : undefined }}>
            <Link2 size={26} color={COR.verde} strokeWidth={2.2} />
            <span style={{ ...texto, fontSize: 24, fontWeight: 800, color: COR.verde }}>{c.baloes[3].texto}</span>
          </div>
        </Pop>
      </div>
      {/* campo com microfone (grava o áudio) */}
      <div style={{ margin: `0 ${PAD - 10}px 34px`, height: 70, borderRadius: 999, background: "var(--cor-superficie-2)", border: "1px solid rgb(255 255 255 / 0.08)", display: "flex", alignItems: "center", gap: 10, padding: "0 10px 0 22px" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, height: 30 }}>
          {gravando
            ? ONDA.slice(0, Math.max(1, Math.floor(pGrava * ONDA.length))).map((v, i) => <div key={i} style={{ width: 5, height: 4 + 22 * v, borderRadius: 3, background: COR.coral }} />)
            : null}
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 99, background: gravando ? COR.coral : COR.verde, display: "grid", placeItems: "center", color: "var(--cor-tinta)", transform: gravando ? `scale(${(1 + 0.06 * Math.sin(t * 9)).toFixed(4)})` : undefined }}>
          <Mic size={26} strokeWidth={2.2} />
        </div>
      </div>
      <Toque x={150} y={TELA.h - 150} em={tToqueLink} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jornada em 7 etapas (F025)                                           */
/* ------------------------------------------------------------------ */

/** Etapa atual (1..7) e progresso fracionário da barra. */
export function etapaEm(t: number, tA: number, tB: number): { n: number; p: number } {
  const passo = (tB - tA) / 6;
  if (t < tA) return { n: 1, p: 0 };
  const k = Math.min(6, Math.floor((t - tA) / passo));
  return { n: k + 1, p: Math.min(7, (t - tA) / passo + 1) };
}

export function TelaJornada({ tA, tB, tConta }: { tA: number; tB: number; tConta: number }) {
  const { t } = useFilme();
  const { n } = etapaEm(t, tA, tB);
  const pronto = t >= tB;
  const sR = spring(t - tB, { k: 220, d: 18 });
  const brilho = t > tConta ? Math.exp(-(t - tConta) * 1.5) : 0;
  return (
    <div className="absolute inset-0">
      <BarraStatus />
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 76 }}>
        <div style={{ ...mono, fontSize: 24, fontWeight: 600, color: "var(--cor-texto-2)" }}>{prototipo.etapas.progresso(n, 7)}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {produto.jornada7.map((_, i) => {
            const tI = tA + ((tB - tA) / 6) * i;
            const f = ease.outCubic(prog(t, tI - 0.12, tI + 0.12));
            return (
              <div key={i} style={{ flex: 1, height: 12, borderRadius: 6, background: "var(--cor-superficie-3)", overflow: "hidden" }}>
                <div style={{ width: `${(100 * f).toFixed(1)}%`, height: "100%", background: COR.verde }} />
              </div>
            );
          })}
        </div>
      </div>
      {/* miolo: anel da etapa ou o Pix recebido */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 150, height: 150, borderRadius: 999, border: `5px solid ${pronto ? COR.verde : "var(--cor-superficie-3)"}`, display: "grid", placeItems: "center", background: pronto ? rgba("verde", 0.15) : "transparent", boxShadow: pronto ? `0 0 ${Math.round(30 + 40 * brilho)}px ${rgba("verde", 0.35 + 0.3 * brilho)}` : undefined }}>
          {pronto ? (
            <div style={{ transform: `scale(${(0.5 + 0.5 * sR).toFixed(4)})`, color: COR.verde }}>
              <Check size={78} strokeWidth={3} />
            </div>
          ) : (
            <div style={{ ...mono, fontSize: 64, fontWeight: 700, color: "var(--cor-texto)" }}>{n}</div>
          )}
        </div>
        <div style={{ ...mono, fontSize: 76, fontWeight: 700, letterSpacing: "-0.05em", color: COR.verde, marginTop: 40, opacity: surge(t, tB + 0.05, 0.3), transform: `translate(0, ${((1 - sR) * 20).toFixed(1)}px)`, textShadow: `0 0 ${Math.round(20 + 30 * brilho)}px ${rgba("verde", 0.3 + 0.4 * brilho)}` }}>{prototipo.proposta.recebe}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Proposta (F026)                                                      */
/* ------------------------------------------------------------------ */

export function TelaProposta({ tRecebe, tPaga, tQuando, tTaxa }: { tRecebe: number; tPaga: number; tQuando: number; tTaxa: number }) {
  const { t } = useFilme();
  const pr = prototipo.proposta;
  const ex = preco.exemplo;
  const linha = (em: number) => {
    const a = ease.outCubic(prog(t, em - 0.1, em + 0.3));
    return { background: rgba("verde", 0.13 * a), borderColor: rgba("verde", 0.5 * a) };
  };
  const rot = { ...texto, fontSize: 22, fontWeight: 600, color: "var(--cor-texto-3)" } as const;
  const caixa = { borderRadius: 16, padding: "12px 16px", border: "1.5px solid transparent" } as const;
  return (
    <div className="absolute inset-0">
      <BarraStatus />
      <div style={{ position: "absolute", left: PAD - 12, right: PAD - 12, top: 64, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ ...caixa, ...linha(tRecebe) }}>
          <div style={rot}>{pr.recebeRotulo}</div>
          <div style={{ ...mono, fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em", color: COR.verde }}>{pr.recebe}</div>
        </div>
        <div style={{ ...caixa, ...linha(tPaga) }}>
          <div style={rot}>{pr.parcelasRotulo}</div>
          <div style={{ ...mono, fontSize: 42, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--cor-texto)" }}>{pr.parcelas}</div>
        </div>
        <div style={{ ...caixa, ...linha(tQuando) }}>
          <div style={rot}>{pr.vencimentosRotulo}</div>
          <div style={{ ...mono, fontSize: 24, fontWeight: 600, color: "var(--cor-texto)", marginTop: 4 }}>{pr.vencimentos.join(" · ")}</div>
        </div>
        <div style={{ ...caixa, background: "var(--cor-superficie-2)", opacity: 0.55 + 0.45 * surge(t, tTaxa, 0.4) }}>
          <div style={{ ...texto, fontSize: 22, fontWeight: 700, color: "var(--cor-texto)", lineHeight: 1.35 }}>
            {ex.taxa.rotulo} por semana
            <br />= {ex.efetivaMes.rotulo} ao mês
            <br />= {ex.juros.rotulo} de juros em {ex.sacado.rotulo}
          </div>
        </div>
        <div style={{ marginTop: 6, padding: "0 6px" }}>
          <div style={rot}>{pr.credoraRotulo}</div>
          <div style={{ ...texto, fontSize: 22, fontWeight: 700, color: "var(--cor-texto-2)", lineHeight: 1.3 }}>{pr.credora}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Painel: o limite volta e cresce (F031) — sem número novo            */
/* ------------------------------------------------------------------ */

export function TelaLimiteCresce({ tVolta, tCresce }: { tVolta: number; tCresce: number }) {
  const { t } = useFilme();
  const antigo = 0.72;
  const volta = ease.inOutCubic(prog(t, tVolta - 0.1, tVolta + 0.7));
  const cresce = spring(t - tCresce + 0.05, { k: 120, d: 15 });
  const fill = mix(antigo * 0.2, antigo, volta) + (1 - antigo) * Math.max(0, cresce);
  const brilho = t > tCresce ? Math.exp(-(t - tCresce) * 1.2) : 0;
  const H = 440;
  return (
    <div className="absolute inset-0">
      <BarraStatus />
      <div style={{ position: "absolute", left: PAD, right: PAD, top: 92 }}>
        <div style={{ ...texto, fontSize: 28, fontWeight: 700, color: "var(--cor-texto-2)" }}>Seu limite</div>
      </div>
      {/* coluna do limite: reenche e sobe */}
      <div style={{ position: "absolute", left: TELA.w / 2 - 70, top: 170, width: 140, height: H, borderRadius: 26, background: "var(--cor-superficie-2)", border: "1.5px solid rgb(255 255 255 / 0.08)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H * Math.min(1.02, fill), borderRadius: 24, background: `linear-gradient(180deg, ${rgba("verde", 1)} 0%, ${rgba("verde", 0.6)} 100%)`, boxShadow: `0 0 ${Math.round(24 + 40 * brilho)}px ${rgba("verde", 0.35 + 0.4 * brilho)}` }} />
      </div>
      {/* marca do limite antigo */}
      <div style={{ position: "absolute", left: TELA.w / 2 - 100, top: 170 + H * (1 - antigo) - 2, width: 200, height: 0, borderTop: "3px dashed rgb(242 244 247 / 0.55)", opacity: surge(t, tVolta + 0.4, 0.4) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", ...texto, fontSize: 26, fontWeight: 700, color: COR.verde, opacity: surge(t, tCresce + 0.25, 0.4) }}>{prototipo.painel.pagamento}</div>
    </div>
  );
}
