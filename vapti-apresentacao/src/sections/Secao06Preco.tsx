import { PrecoComparativo } from "../components/viz";
import { Bloco, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 06 — Preço (V14). */
export function Secao06Preco({ parte }: PropsSecao) {
  const secao = secaoPorId("06");
  return (
    <Slide secao={secao} parte={parte}>
      <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1.5fr) minmax(0, 1fr)" }}>
        <div className="coluna">
          <Figura secao={secao} visual="V14" proprio>
            <PrecoComparativo />
          </Figura>
        </div>
        <div className="flex flex-col gap-[var(--esp-6)]">
          {secao.blocos.map((b, i) => (
            <Bloco key={b.titulo ?? i} bloco={b} tom={i === 3 ? "coral" : i === 2 ? "cinza" : "verde"} />
          ))}
        </div>
      </div>
    </Slide>
  );
}
