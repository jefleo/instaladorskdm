import { Celular } from "../components/prototipo";
import { PixRetentativas, PlanosPagamento } from "../components/viz";
import { useExibicao } from "./contexto";
import { Bloco, Cabecalho, Encaixe, Figura, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** 03 — O produto: protótipo (V07, 03), planos (V08, 03b) e Pix Automático (V09, 03c). */
export function Secao03Produto({ parte }: PropsSecao) {
  const secao = secaoPorId("03");
  const [b0, b1, b2, b3] = secao.blocos;
  const impressao = useExibicao() === "impressao";
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte} cabecalho="nenhum">
        <div className="dividir encher" style={{ ["--colunas" as string]: "minmax(0, 1fr) minmax(0, 720px)", ["--vao" as string]: "var(--esp-8)" }}>
          <div className="coluna justify-between">
            <Cabecalho secao={secao} parte={parte} />
            <div className="grade-2" style={{ ["--vao" as string]: "var(--esp-6) var(--esp-7)" }}>
              {b0 ? <Bloco bloco={b0} tom="verde" /> : null}
              {b1 ? <Bloco bloco={b1} tom="verde" /> : null}
              {b2 ? <Bloco bloco={b2} tom="azul" /> : null}
              {b3 ? <Bloco bloco={b3} tom="azul" /> : null}
            </div>
          </div>
          <Encaixe className="figura flex flex-col items-center" visual="V07">
            {impressao ? <Celular inicio="jornada" etapa={3} /> : <Celular inicio="conversa" />}
          </Encaixe>
        </div>
        <p className="sr-only-vapti">{secao.alts.V07}</p>
      </Slide>
    );
  }
  // 03b: planos de pagamento (V08). 03c: Pix Automático (V09). Uma ideia por tela, corpo ≥ 22 px.
  return (
    <Slide secao={secao} parte={parte}>
      {parte === 1 ? (
        <Figura secao={secao} visual="V08" proprio centro className="ampliar">
          <PlanosPagamento />
        </Figura>
      ) : (
        <Figura secao={secao} visual="V09" proprio centro className="ampliar">
          <PixRetentativas />
        </Figura>
      )}
    </Slide>
  );
}
