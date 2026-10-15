import { ReguaDuasTrilhas } from "../components/viz";
import { captacao } from "../data/vapti";
import { GestoraOlha, OQueSeVende, Valuation } from "./visuais/Crescimento";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 10 — Crescimento: régua em duas trilhas (V20), captação e o que se vende (V21). */
export function Secao10Crescimento({ parte }: PropsSecao) {
  const secao = secaoPorId("10");
  const [b0, b1, b2, b3] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <Figura secao={secao} visual="V20" proprio>
          <ReguaDuasTrilhas />
        </Figura>
      </Slide>
    );
  }
  if (parte === 1) {
    return (
      <Slide secao={secao} parte={parte} destaque={captacao.ressalva}>
        <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1fr) minmax(0, 1fr)" }}>
          <div className="flex flex-col gap-[var(--esp-6)]">
            {b0 ? <Bloco bloco={b0} tom="verde" /> : null}
            {b1 ? <Bloco bloco={b1} tom="verde" /> : null}
            <Valuation />
          </div>
          <GestoraOlha titulo={b2?.titulo ?? ""} />
        </div>
      </Slide>
    );
  }
  return (
    <Slide secao={secao} parte={parte} destaque={b3 ? <>{b3.titulo}</> : null}>
      <Figura secao={secao} visual="V21">
        <OQueSeVende />
      </Figura>
    </Slide>
  );
}
