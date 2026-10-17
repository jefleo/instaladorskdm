import { FluxoBaas } from "../components/viz";
import { caminhos } from "../data/vapti";
import { RegrasBaas, TresCaminhos } from "./visuais/Estrutura";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 05 — Estrutura: três caminhos (V12), fluxo BaaS (V13) e regras da Resolução Conjunta nº 16. */
export function Secao05Estrutura({ parte }: PropsSecao) {
  const secao = secaoPorId("05");
  const [b0, b1, b2, b3] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <Figura secao={secao} visual="V12">
          <TresCaminhos />
        </Figura>
      </Slide>
    );
  }
  if (parte === 1) {
    return (
      <Slide secao={secao} parte={parte} destaque={caminhos.correcao}>
        <Figura secao={secao} visual="V13" proprio>
          <FluxoBaas />
        </Figura>
      </Slide>
    );
  }
  return (
    <Slide secao={secao} parte={parte}>
      <div className="grade-4" style={{ ["--vao" as string]: "var(--esp-6)" }}>
        {b0 ? <Bloco bloco={b0} tom="neutro" /> : null}
        {b1 ? <Bloco bloco={b1} tom="azul" /> : null}
        {b2 ? <Bloco bloco={b2} tom="verde" /> : null}
        {b3 ? <Bloco bloco={b3} tom="verde" /> : null}
      </div>
      <div className="mt-auto">
        <RegrasBaas />
      </div>
    </Slide>
  );
}
