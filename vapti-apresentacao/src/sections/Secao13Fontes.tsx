import { fontes } from "../data/vapti";
import { CardFinal } from "./visuais/Capa";
import { ListaFontes } from "./visuais/Medidas";
import { Bloco, Slide, secaoPorId, type PropsSecao } from "./Slide";

/** Divisão das fontes em duas telas: a segunda divide espaço com o aviso (até 10 fontes). */
const CORTE = Math.max(Math.ceil(fontes.length / 2) + 1, fontes.length - 10);

/** 14 — Card final (V24), fontes com links e aviso. */
export function Secao13Fontes({ parte }: PropsSecao) {
  const secao = secaoPorId("14");
  const [bAviso, bComoLer] = secao.blocos;
  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte} cabecalho="nenhum">
        <CardFinal legenda={secao.legendas.V24} />
      </Slide>
    );
  }
  if (parte === 1) {
    return (
      <Slide secao={secao} parte={parte} subtitulo>
        <ListaFontes de={0} ate={CORTE} />
      </Slide>
    );
  }
  return (
    <Slide secao={secao} parte={parte} destaque={bComoLer ? <Bloco bloco={bComoLer} estilo="simples" /> : null}>
      <ListaFontes de={CORTE} ate={fontes.length} />
      {bAviso ? (
        <div className="mt-auto rounded-3 border border-borda-forte bg-superficie p-[0.9em_1.1em]">
          <Bloco bloco={bAviso} estilo="simples" />
        </div>
      ) : null}
    </Slide>
  );
}
