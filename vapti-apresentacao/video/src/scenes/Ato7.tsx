/**
 * Ato 7 — Eficiência e riscos (F067–F074). Tom franco.
 * F067–F069 (V18): custo por saque com lupa; R$ 1,05 → R$ 0,20 com 30 balões virando "4 a 6";
 * funil de quatro camadas e a consulta caindo em degraus (estimativas com selo).
 * F070–F074 (V19): a luz vira coral discreto; cada risco vira a sua mitigação, com o mesmo peso visual.
 */
import { Camada, Camera, Grade, useFilme } from "../kit";
import { Eficiencia } from "./atos7a9/Eficiencia";
import { Riscos } from "./atos7a9/Riscos";

export const frases: string[] = ["F067", "F068", "F069", "F070", "F071", "F072", "F073", "F074"];

export default function Ato7() {
  const { t, ato } = useFilme();
  return (
    <div className="absolute inset-0" style={{ background: "var(--cor-tinta)" }}>
      {/* fundo contínuo do ato: quadriculado que desliza devagar */}
      <Camera de={{ x: 0 }} para={{ x: 220 }} t0={ato.inicio} t1={ato.fim}>
        <Camada z={2}>
          <Grade tipo="quadriculado" passo={88} opacidade={0.75} area={{ x: -200, y: -100, w: 2600, h: 1300 }} em={ato.inicio - 0.4} dur={1} />
        </Camada>
      </Camera>
      {t < ato.fim + 1 ? <Eficiencia /> : null}
      <Riscos />
    </div>
  );
}
