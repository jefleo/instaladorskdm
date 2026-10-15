import { CascataFase1, CurvaMargemPerda, Simulador, TabelaCapital, TresFases } from "../components/viz";
import { TabelaFases } from "./visuais/Medidas";
import { Bloco, Encaixe, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 07 — Números: V15, V16, simulador, Tabela A, V17 e a tabela das três fases. Tudo projeção. */
export function Secao07Numeros({ parte }: PropsSecao) {
  const secao = secaoPorId("07");
  const [b0, b1, b2, b3] = secao.blocos;
  switch (parte) {
    case 0:
      return (
        <Slide secao={secao} parte={parte}>
          <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1.6fr) minmax(0, 1fr)" }}>
            <div className="coluna">
              <Figura secao={secao} visual="V15" proprio>
                <CascataFase1 />
              </Figura>
            </div>
            <div className="flex flex-col gap-[var(--esp-7)]">
              {b0 ? <Bloco bloco={b0} tom="verde" /> : null}
              {b3 ? <Bloco bloco={b3} tom="neutro" /> : null}
            </div>
          </div>
        </Slide>
      );
    case 1:
      return (
        <Slide secao={secao} parte={parte}>
          <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1.6fr) minmax(0, 1fr)" }}>
            <div className="coluna">
              <Figura secao={secao} visual="V16" proprio>
                <CurvaMargemPerda />
              </Figura>
            </div>
            <div className="flex flex-col gap-[var(--esp-7)]">
              {b1 ? <Bloco bloco={b1} tom="verde" /> : null}
              {b2 ? <Bloco bloco={b2} tom="coral" /> : null}
            </div>
          </div>
        </Slide>
      );
    case 2:
      return (
        <Slide secao={secao} parte={parte} cabecalho="linha">
          <Encaixe className="figura">
            <Simulador />
          </Encaixe>
        </Slide>
      );
    case 3:
      return (
        <Slide secao={secao} parte={parte} cabecalho="linha">
          <Encaixe className="figura">
            <TabelaCapital />
          </Encaixe>
        </Slide>
      );
    case 4:
      return (
        <Slide secao={secao} parte={parte}>
          <Figura secao={secao} visual="V17" proprio>
            <TresFases />
          </Figura>
        </Slide>
      );
    default:
      return (
        <Slide secao={secao} parte={parte}>
          <TabelaFases />
        </Slide>
      );
  }
}
