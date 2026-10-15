import { useId } from "react";
import { planoAcao, type IdAba } from "../content/plano";
import { useExibicao } from "./contexto";
import { Slide, secaoPorId, type PropsSecao } from "./Slide";
import {
  AbaImpressa,
  Abas,
  irParaTela,
  ORDEM_ABAS,
  Painel,
  PainelAquisicao,
  PainelCobranca,
  PainelPix,
  PlanoInterativo,
  ROTA_ABA,
  useTeclasAbas,
  VisaoGeral,
} from "./visuais/PlanoAcao";

/** Visão geral + uma tela por aba (11, 11b, 11c, 11d). */
export const partesPlanoAcao = 1 + planoAcao.abas.length;

/**
 * 11 — Plano de ação: como chegar às metas do piloto.
 *  - Apresentação: 11 é a visão geral; 11b, 11c e 11d são as abas. Clicar numa aba
 *    ou apertar 1, 2 ou 3 leva à tela da aba (as setas continuam navegando).
 *  - Leitura: uma tela só, com abas de verdade (setas, Home e End trocam a aba).
 *  - Impressão: uma página por aba, com tudo aberto.
 */
export function SecaoPlanoAcao({ parte }: PropsSecao) {
  const secao = secaoPorId("11");
  const exibicao = useExibicao();
  const palco = exibicao === "palco";
  const estatico = exibicao === "impressao";
  const base = useId();
  useTeclasAbas(palco);

  if (exibicao === "leitura") {
    if (parte > 0) return null;
    return (
      <Slide secao={secao} parte={parte}>
        <PlanoInterativo />
      </Slide>
    );
  }

  if (parte === 0) {
    return (
      <Slide secao={secao} parte={parte}>
        <VisaoGeral blocos={secao.blocos} interativo={palco} />
      </Slide>
    );
  }

  const aba: IdAba = ORDEM_ABAS[parte - 1] ?? "aquisicao";
  const idPainel = `${base}-painel`;
  return (
    <Slide secao={secao} parte={parte} cabecalho="linha">
      {estatico ? (
        <AbaImpressa id={aba} />
      ) : (
        <Abas ativa={aba} idBase={base} idPainel={idPainel} focoInicial={palco} aoEscolher={(id, teclado) => palco && irParaTela(ROTA_ABA[id], teclado)} />
      )}
      <Painel id={idPainel} rotuladoPor={estatico ? undefined : `${base}-${aba}`}>
        {aba === "aquisicao" ? <PainelAquisicao estatico={estatico} /> : aba === "cobranca" ? <PainelCobranca estatico={estatico} /> : <PainelPix />}
      </Painel>
    </Slide>
  );
}
