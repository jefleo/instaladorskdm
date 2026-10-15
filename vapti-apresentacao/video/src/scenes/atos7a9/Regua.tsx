/**
 * Ato 8, F075–F082 — V20 Régua Vapti × Zippi.
 * F075: a câmera sobe até um horizonte; duas trilhas aparecem lá embaixo.
 * F076: a câmera desce até elas: trilha Zippi (cinza, fatos) com a chave "3 anos" até o 1º FIDC.
 * F077: a trilha Vapti (verde, projeção) se alinha embaixo, ano a ano; ressalva visível.
 * F078–F081: cada marco da Vapti acende com o seu cartão e o selo Projeção colado.
 * F082: uma janela iluminada se abre sobre os anos 4 a 6.
 */
import { captacao, regua, trilhas, zippi } from "../../../../src/data/vapti";
import {
  Camada,
  Camera,
  clamp01,
  COR,
  ease,
  envelope,
  Grade,
  Halo,
  prog,
  Respiracao,
  rgba,
  Selo,
  spring,
  Tracado,
  useFilme,
  useFrase,
} from "../../kit";
import { mix, tPalavra } from "./base";

/* Colunas = anos da régua 4.11 ("0", "1", "2", "3", "4–5", "6+"). */
const N = regua.length;
const COL0 = 380;
const COLW = 232;
const cx = (i: number) => COL0 + COLW * i + COLW / 2;
/** Deslocamento vertical do "chão" onde a régua mora (a câmera desce até ele). */
const MUNDO = 520;
const ZY = 350; // trilha Zippi (tela, em repouso)
const VY = 560; // trilha Vapti

/** Coluna de cada marco: Zippi pelo ano no texto da régua; Vapti pelo número do ano. */
const colZippi = (marco: string) => Math.max(0, regua.findIndex((r) => new RegExp(`^(\\d{4}–)?${marco}:`).test(r.zippi)));
const colAno = (a: number) => Math.max(0, regua.findIndex((r) => { const n = r.ano.match(/\d+/g)!.map(Number); return a >= n[0] && a <= (r.ano.includes("+") ? 99 : (n[1] ?? n[0])); }));
const ZIPPI = trilhas.zippi.map((m) => ({ ...m, col: colZippi(m.marco) }));
const VAPTI = trilhas.vapti.map((m) => {
  const n = m.marco.match(/\d+/g)!.map(Number);
  return { ...m, de: colAno(n[0]), ate: colAno(n[1] ?? n[0]), valor: m.texto.match(/R\$.*$/)?.[0] ?? "" };
});
const MARCOS_V = VAPTI.filter((m) => m.de === m.ate); // Ano 1, 2, 3, 4–5
const JANELA = VAPTI.find((m) => m.de !== m.ate)!; // Anos 4–6
const SAFRA = regua[1].vapti.match(/\d+ meses de safra/)?.[0] ?? "";
const RESSALVA = `Vapti: ${captacao.ressalva.replace(/^.*?são\s+/, "")}`;
/** "3 anos": do lançamento (2021) ao primeiro FIDC (2024), pelas datas da trilha. */
const ANOS_ZIPPI = `${Number(trilhas.zippi[1].marco) - Number(trilhas.zippi[0].marco)} anos`;
const FRASES_V = ["F078", "F079", "F080", "F081"] as const;

export function Regua() {
  const { t, ato } = useFilme();
  const f75 = useFrase("F075");
  const f76 = useFrase("F076");
  const f77 = useFrase("F077");
  const fv = FRASES_V.map((id) => useFrase(id));
  const f82 = useFrase("F082");
  const f83 = useFrase("F083");

  // Saída: a câmera atravessa a janela (F083)
  const atravessa = ease.inCubic(prog(t, f83.t0 - 0.25, f83.t0 + 0.65));
  if (atravessa >= 1) return null;

  const s1 = ease.inOutCubic(prog(t, f76.t0 - 0.1, f76.t0 + 1.25)); // desce até a régua
  const yZ = mix(840, ZY + MUNDO, s1);
  const yV = mix(910, VY + MUNDO, s1);
  const tTrilhas = f75.tE - 0.05;
  const xs = cx(0);
  const xe = cx(N - 1);
  const tE76 = f76.tE;
  const tLanc = tPalavra(f76.f, "lancamento", f76.t0, tE76 + 0.8);
  const tPrim = tPalavra(f76.f, "primeiro", tLanc, tE76 + 1.6);
  const tAlinha = f77.tE - 0.1;
  const dimZ = 1 - 0.35 * ease.inOutSine(prog(t, fv[0].t0, fv[0].t0 + 0.6));

  // Marcos da Vapti: ativam no "Ano N" e o cartão entra na ênfase
  const ativos = fv.map((f, i) => ({ f, tA: f.t0 - 0.05, tC: f.tE - 0.1, tFim: i < 3 ? fv[i + 1].t0 + 0.1 : f82.t0 + 0.15 }));
  const tJan = f82.tE - 0.35;
  const abre = ease.outCubic(prog(t, tJan, tJan + 0.7));

  return (
    <div className="absolute inset-0" style={{ opacity: 1 - atravessa, transform: `scale(${(1 + 1.6 * atravessa).toFixed(4)})`, transformOrigin: `${(cx(4) + cx(5)) / 2}px 520px` }}>
      <Camera
        chaves={[
          { t: ato.inicio - 0.4, y: 60, zoom: 1.12 },
          { t: f75.t0, y: 60, zoom: 1.12 },
          { t: f75.tE + 0.35, y: 0, zoom: 1.0, curva: ease.inOutSine },
          { t: f76.t0 - 0.1, y: 0, zoom: 1.0 },
          { t: f76.t0 + 1.25, y: MUNDO, zoom: 1.0, curva: ease.inOutCubic },
          { t: f76.t1, y: MUNDO, x: -30, zoom: 1.02, curva: ease.inOutSine },
          { t: f77.t0 + 1.0, y: MUNDO, x: 0, zoom: 1.0, curva: ease.inOutSine },
          { t: f82.t0, y: MUNDO, x: 0, zoom: 1.0 },
          { t: f82.tE + 0.5, y: MUNDO, x: 20, zoom: 1.015, curva: ease.inOutSine },
        ]}
        deriva={3}
        seed={8}
      >
        {/* céu e horizonte */}
        <Camada z={2}>
          <Halo tom="azul" x={960} y={560} w={2600} h={700} intensidade={0.1} />
          <Halo tom="verde" x={960} y={560} w={1500 + 500 * ease.outCubic(prog(t, f75.tE - 0.1, f75.tE + 1.2))} h={260} intensidade={0.05 + 0.14 * envelope(t, f75.tE - 0.1, f76.t0 + 1.2, 0.8, 0.8)} />
          <div style={{ position: "absolute", left: -200, top: 559, width: 2320, height: 2, background: `linear-gradient(90deg, transparent, ${rgba("texto", 0.35)} 30%, ${rgba("texto", 0.35)} 70%, transparent)`, opacity: 1 - 0.7 * s1 }} />
        </Camada>
        <Camada z={1.2} opacidade={mix(1, 0.32, s1)}>
          <Grade tipo="chao" horizonte={560} passo={70} em={ato.inicio - 0.3} dur={1.2} deriva={-8} opacidade={1.1} />
        </Camada>
        <Camada z={1.5}>
          <Respiracao tom="verde" x={960} y={560 + MUNDO * 0.4} raio={820} intensidade={0.07} periodo={8} opacidade={s1} />
        </Camada>

        {/* a régua */}
        <Camada z={0}>
          {/* guias das colunas: alinhamento ano a ano */}
          {Array.from({ length: N + 1 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: COL0 + COLW * i, top: MUNDO + 270, width: 1, height: 560, background: rgba("texto", 0.07), opacity: ease.outCubic(prog(t, tAlinha - 0.3 + i * 0.05, tAlinha + 0.3 + i * 0.05)) }} />
          ))}

          {/* trilhas */}
          <svg width={1920} height={2200} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} aria-hidden="true">
            <Tracado d={`M${xs - 60} ${yZ} L${xe + 60} ${yZ}`} em={tTrilhas} dur={1.1} tom="cinza" espessura={3} tracejado="10 9" />
            <Tracado d={`M${xs - 60} ${yV} L${cx(4)} ${yV}`} em={tTrilhas + 0.25} dur={1.0} tom="verde" espessura={6} brilho={0.6} />
            <Tracado d={`M${cx(4)} ${yV} L${xe + 60} ${yV}`} em={tTrilhas + 1.1} dur={0.4} tom="verde" espessura={4} tracejado="10 9" />
            {/* chave "3 anos" */}
            <Tracado
              d={`M${cx(0)} ${MUNDO + 268} Q${cx(0)} ${MUNDO + 248} ${cx(0) + 22} ${MUNDO + 248} L${(cx(0) + cx(3)) / 2 - 22} ${MUNDO + 248} Q${(cx(0) + cx(3)) / 2} ${MUNDO + 248} ${(cx(0) + cx(3)) / 2} ${MUNDO + 228} Q${(cx(0) + cx(3)) / 2} ${MUNDO + 248} ${(cx(0) + cx(3)) / 2 + 22} ${MUNDO + 248} L${cx(3) - 22} ${MUNDO + 248} Q${cx(3)} ${MUNDO + 248} ${cx(3)} ${MUNDO + 268}`}
              em={tE76 - 0.15}
              dur={0.7}
              tom="texto"
              espessura={3}
              opacidade={0.85 * dimZ}
            />
            {/* alinhamento FIDC × Ano 3 */}
            <Tracado d={`M${cx(3)} ${ZY + MUNDO + 18} L${cx(3)} ${VY + MUNDO - 18}`} em={tAlinha} dur={0.5} tom="texto" espessura={2} tracejado="5 7" opacidade={0.5} />
          </svg>
          <p className="font-mono" style={{ position: "absolute", left: (cx(0) + cx(3)) / 2 - 150, width: 300, top: MUNDO + 166, margin: 0, textAlign: "center", fontSize: 46, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--cor-texto)", opacity: ease.outCubic(prog(t, tE76 - 0.05, tE76 + 0.3)) * dimZ, transform: `scale(${(0.9 + 0.1 * spring(t - tE76, { k: 240, d: 18 })).toFixed(4)})` }}>
            {ANOS_ZIPPI}
          </p>

          {/* rótulos das trilhas */}
          <p style={{ position: "absolute", left: 150, top: ZY + MUNDO - 30, margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 48, letterSpacing: "-0.03em", color: COR.cinza, opacity: ease.outCubic(prog(t, f76.t0 + 0.6, f76.t0 + 1.1)) }}>
            {zippi.nome}
          </p>
          <p style={{ position: "absolute", left: 150, top: VY + MUNDO - 32, margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 48, letterSpacing: "-0.03em", color: COR.verde, textShadow: `0 0 24px ${rgba("verde", 0.35)}`, opacity: ease.outCubic(prog(t, f77.t0 + 0.05, f77.t0 + 0.5)) }}>
            Vapti
          </p>
          <div style={{ position: "absolute", left: 152, top: VY + MUNDO + 34 }}>
            <Selo tipo="projecao" em={f77.tE} tamanho={24} />
          </div>

          {/* marcos da Zippi (fatos, cinza, só texto) */}
          {ZIPPI.map((m, i) => {
            const em = i === 0 ? f76.t0 + 0.75 : i === 1 ? f76.t0 + 1.0 : f77.t0 + 0.1 + 0.2 * (i - 2);
            const a = ease.outCubic(prog(t, em, em + 0.4));
            const tTexto = i === 0 ? tLanc : i === 1 ? tPrim : em + 0.1;
            const at = ease.outCubic(prog(t, tTexto - 0.05, tTexto + 0.35));
            const x = cx(m.col);
            return (
              <div key={m.marco} style={{ opacity: dimZ }}>
                <p className="font-mono" style={{ position: "absolute", left: x - 100, width: 200, top: ZY + MUNDO - 64, margin: 0, textAlign: "center", fontSize: 32, fontWeight: 700, color: COR.cinza, opacity: a }}>
                  {m.marco}
                </p>
                <span style={{ position: "absolute", left: x - 14, top: ZY + MUNDO - 14, width: 28, height: 28, borderRadius: "50%", border: `3px solid ${COR.cinza}`, background: "var(--cor-tinta)", opacity: a, transform: `scale(${(0.6 + 0.4 * spring(t - em, { k: 260, d: 18 })).toFixed(4)})` }} />
                <p style={{ position: "absolute", left: x - 112, width: 224, top: ZY + MUNDO + 30, margin: 0, textAlign: "center", fontSize: 28, lineHeight: 1.2, fontWeight: 600, color: "var(--cor-texto-2)", opacity: at }}>
                  {m.texto}
                </p>
              </div>
            );
          })}

          {/* marcos da Vapti (projeção) */}
          {MARCOS_V.map((m, i) => {
            const em = tAlinha + 0.1 + i * 0.12;
            const a = ease.outCubic(prog(t, em, em + 0.35));
            const { f, tA, tC, tFim } = ativos[i];
            const aceso = clamp01((t - tA) * 4);
            const cartao = envelope(t, tC, tFim, 0.3, 0.35);
            const chip = ease.outCubic(prog(t, tFim, tFim + 0.4));
            const x = cx(m.de);
            const sC = spring(t - tC, { k: 220, d: 20 });
            const titulo = f.f.tela.split("·")[1]?.replace(/\(.*\)/, "").trim() ?? "";
            const tituloCap = titulo.charAt(0).toUpperCase() + titulo.slice(1);
            const condicao = f.f.tela.match(/\((.*)\)/)?.[1];
            const pCond = ease.outCubic(prog(t, f.tE - 0.05, f.tE + 0.4));
            return (
              <div key={m.marco}>
                <p className="font-mono" style={{ position: "absolute", left: x - 110, width: 220, top: VY + MUNDO - 66, margin: 0, textAlign: "center", fontSize: 30, fontWeight: 700, color: COR.verde, opacity: aceso * (t < tFim ? 1 : 0.7) }}>
                  {m.marco}
                </p>
                <span
                  style={{
                    position: "absolute",
                    left: x - 15,
                    top: VY + MUNDO - 15,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "3px solid var(--cor-tinta)",
                    background: aceso > 0 ? COR.verde : rgba("verde", 0.35),
                    boxShadow: aceso > 0 ? `0 0 ${Math.round(14 + 26 * (t < tFim ? 1 : 0.3))}px ${rgba("verde", 0.6)}` : undefined,
                    opacity: a,
                    transform: `scale(${(0.6 + 0.4 * spring(t - em, { k: 260, d: 18 }) + 0.25 * Math.exp(-Math.max(0, t - tA) * 4) * aceso).toFixed(4)})`,
                  }}
                />
                {/* cartão do marco ativo */}
                {cartao > 0.003 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: x - 160,
                      top: VY + MUNDO + 40,
                      width: 320,
                      padding: "20px 22px 22px",
                      borderRadius: 18,
                      background: "linear-gradient(180deg, rgb(33 41 52 / 0.96), rgb(22 27 34 / 0.97))",
                      border: `1.5px solid ${rgba("verde", 0.45)}`,
                      boxShadow: `0 30px 60px -30px rgb(0 0 0 / 0.9), 0 0 40px ${rgba("verde", 0.18)}`,
                      opacity: cartao,
                      transform: `translate(0, ${((1 - sC) * 24).toFixed(2)}px)`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      textAlign: "center",
                    }}
                  >
                    <p style={{ margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.03em" }}>{tituloCap}</p>
                    <p className="font-mono" style={{ margin: 0, fontSize: 38, fontWeight: 700, color: COR.verde, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{m.valor}</p>
                    {i === 0 && SAFRA ? <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--cor-texto-2)" }}>{SAFRA}</p> : null}
                    {condicao ? (
                      <p style={{ margin: "2px 0 0", fontSize: 30, lineHeight: 1.2, fontWeight: 700, color: "var(--cor-texto)", padding: "8px 14px", borderRadius: 12, border: `2px solid rgb(242 244 247 / ${(0.15 + 0.7 * pCond).toFixed(3)})`, background: `rgb(242 244 247 / ${(0.08 * pCond).toFixed(3)})`, boxShadow: pCond > 0 ? `0 0 ${Math.round(22 * pCond)}px rgb(242 244 247 / ${(0.15 * pCond).toFixed(3)})` : undefined }}>
                        {condicao}
                      </p>
                    ) : null}
                    <Selo tipo="projecao" em={tC + 0.15} tamanho={22} style={{ transformOrigin: "center" }} />
                  </div>
                ) : null}
                {/* depois: só o valor, discreto, colado ao marco */}
                {chip > 0.003 ? (
                  <p className="font-mono" style={{ position: "absolute", left: x - 112, width: 224, top: VY + MUNDO + 30, margin: 0, textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: "-0.05em", color: COR.verde, opacity: 0.75 * chip, lineHeight: 1.2 }}>
                    {m.valor}
                  </p>
                ) : null}
              </div>
            );
          })}

          {/* F082: a janela de venda */}
          {abre > 0.002 ? (
            <div
              style={{
                position: "absolute",
                left: COL0 + COLW * JANELA.de + 8,
                top: MUNDO + 196,
                width: COLW * (JANELA.ate - JANELA.de + 1) - 16,
                height: 620,
                borderRadius: 26,
                border: `2px solid ${rgba("verde", 0.7)}`,
                background: `linear-gradient(180deg, ${rgba("verde", 0.03)} 0%, ${rgba("verde", 0.11)} 100%)`,
                boxShadow: `0 0 70px ${rgba("verde", 0.22)}, inset 0 0 60px ${rgba("verde", 0.1)}`,
                opacity: abre,
                transform: `scaleX(${(0.06 + 0.94 * abre).toFixed(4)})`,
              }}
            >
              <Halo tom="verde" x={(COLW * 2 - 16) / 2} y={560} w={560} h={260} intensidade={0.35 * abre} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: ease.outCubic(prog(t, tJan + 0.35, tJan + 0.8)) }}>
                <p style={{ margin: 0, fontFamily: "var(--fonte-titulo)", fontWeight: 800, fontSize: 44, letterSpacing: "-0.03em" }}>{JANELA.texto}</p>
                <p className="font-mono" style={{ margin: 0, fontSize: 32, fontWeight: 700, color: COR.verde }}>{captacao.janela.anos}</p>
                <Selo tipo="projecao" em={tJan + 0.5} tamanho={22} style={{ transformOrigin: "center" }} />
              </div>
            </div>
          ) : null}

          {/* ressalva, sempre junto da trilha da Vapti */}
          <p style={{ position: "absolute", left: 150, top: MUNDO + 872, margin: 0, fontSize: 28, fontWeight: 500, color: "var(--cor-texto-2)", opacity: ease.outCubic(prog(t, f77.tE + 0.4, f77.tE + 0.9)) }}>
            {RESSALVA}
          </p>
        </Camada>
      </Camera>
    </div>
  );
}
