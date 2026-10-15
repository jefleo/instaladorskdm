import { PrecoComparativo } from "../components/viz";
import { Bloco, Cabecalho, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 06 — Preço (V14) e a conta por trás dele. */
export function Secao06Preco({ parte }: PropsSecao) {
  const secao = secaoPorId("06");
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte} cabecalho="nenhum">
        <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 620px) minmax(0, 1fr)", ["--vao" as string]: "var(--esp-8)" }}>
          <div className="coluna">
            <Cabecalho secao={secao} parte={parte} />
          </div>
          <div className="coluna">
            <Figura secao={secao} visual="V14" proprio>
              <PrecoComparativo />
            </Figura>
          </div>
        </div>
      </Slide>
    );
  }
  return (
    <Slide secao={secao} parte={parte} corpoClassName="justify-center">
      <div className="grade-2" style={{ ["--vao" as string]: "var(--esp-7) var(--esp-8)" }}>
        {secao.blocos.map((b, i) => (
          <Bloco key={b.titulo ?? i} bloco={b} tom={i === 3 ? "coral" : i === 2 ? "cinza" : "verde"} grande />
        ))}
      </div>
    </Slide>
  );
}
