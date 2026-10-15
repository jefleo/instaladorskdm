/**
 * Tela 2 — Plataforma: contratação em 7 etapas, da coleta de dados (fictícios,
 * somente leitura) ao "Pix recebido". A instituição parceira aparece como credora.
 */
import { useEffect, useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BellRing,
  CalendarX2,
  Check,
  Landmark,
  Lock,
  QrCode,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Icone, Wordmark } from "../base";
import { prototipo } from "../../content/ui";
import { preco, produto } from "../../data/vapti";
import {
  BotaoPrimario,
  BotaoSecundario,
  CampoLeitura,
  Cartao,
  Linha,
  Pilula,
  Rotulo,
  Tela,
  TituloTela,
  TopoApp,
  trans,
  useCelular,
} from "./pecas";

const e = prototipo.etapas;
const p = prototipo.proposta;
const TOTAL = e.lista.length;
const ULTIMA = TOTAL - 1;
const PARCELA = preco.exemplo.parcela.rotulo;

export interface TelaJornadaProps {
  etapa: number;
  irParaEtapa: (n: number) => void;
  aoConcluir: () => void;
}

export function TelaJornada({ etapa, irParaEtapa, aoConcluir }: TelaJornadaProps) {
  const { estatico } = useCelular();
  const atual = e.lista[etapa];
  const [aceito, setAceito] = useState(false);
  const [analisePronta, setAnalisePronta] = useState(estatico);

  const avancar = () => (etapa >= ULTIMA ? aoConcluir() : irParaEtapa(etapa + 1));
  const podeVoltar = etapa > 0 && etapa < ULTIMA;

  const topo = (
    <div className="px-[20px] pb-[12px]">
      <TopoApp
        titulo={<Wordmark tamanho={22} />}
        aoVoltar={podeVoltar ? () => irParaEtapa(etapa - 1) : undefined}
        rotuloVoltar={e.voltar}
        direita={<span className="whitespace-nowrap font-mono text-[12px] text-texto-3">{`${etapa + 1}/${TOTAL}`}</span>}
      />
      <BarraEtapas etapa={etapa} irParaEtapa={irParaEtapa} />
      <p className="mt-[10px] flex items-center gap-[8px] font-mono text-[12px] uppercase tracking-[0.12em] text-texto-2">
        <span className="text-verde">{String(etapa + 1).padStart(2, "0")}</span>
        <span className="traco-vupt" aria-hidden="true" style={{ width: 14, height: 3 }} />
        <span>{e.progresso(etapa + 1, TOTAL)}</span>
        <span className="text-texto-3">· {atual.nome}</span>
      </p>
    </div>
  );

  let rotuloBotao: string = atual.botao;
  let desabilitado = false;
  let secundario: ReactNode = null;
  if (etapa === 1) rotuloBotao = e.openFinance.botao;
  if (etapa === 2) desabilitado = !analisePronta;
  if (etapa === 4) desabilitado = !aceito;
  if (etapa === 5) {
    secundario = (
      <BotaoSecundario onClick={avancar} icone={QrCode} className="mt-[10px] h-[44px] border-transparent text-[15px] text-texto-2">
        {e.pix.alternativa}
      </BotaoSecundario>
    );
  }

  const rodape = (
    <>
      <BotaoPrimario onClick={avancar} disabled={desabilitado} icone={etapa === ULTIMA ? undefined : ArrowRight}>
        {rotuloBotao}
      </BotaoPrimario>
      {secundario}
    </>
  );

  return (
    <Tela topo={topo} rodape={rodape} className="px-[20px] pb-[20px] pt-[6px]">
      <motion.div
        key={etapa}
        initial={estatico ? false : { opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={trans(estatico, 0.3)}
      >
        {etapa === 0 ? <EtapaDados /> : null}
        {etapa === 1 ? <EtapaOpenFinance /> : null}
        {etapa === 2 ? <EtapaAnalise aoConcluir={() => setAnalisePronta(true)} /> : null}
        {etapa === 3 ? <EtapaProposta /> : null}
        {etapa === 4 ? <EtapaAceite aceito={aceito} setAceito={setAceito} /> : null}
        {etapa === 5 ? <EtapaPix /> : null}
        {etapa === 6 ? <EtapaRecebido /> : null}
      </motion.div>
    </Tela>
  );
}

/* ------------------------------------------------------------------ */
/* Barra de 7 etapas                                                   */
/* ------------------------------------------------------------------ */

function BarraEtapas({ etapa, irParaEtapa }: { etapa: number; irParaEtapa: (n: number) => void }) {
  const { estatico } = useCelular();
  return (
    <ol className="flex gap-[4px]" aria-label={e.progresso(etapa + 1, TOTAL)}>
      {e.lista.map((item, i) => {
        const feita = i < etapa;
        const atual = i === etapa;
        const voltavel = feita && etapa < ULTIMA;
        const barra = (
          <span className="relative block h-[5px] overflow-hidden rounded-full bg-superficie-3">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-verde"
              initial={false}
              animate={{ width: feita || atual ? "100%" : "0%", opacity: atual ? 1 : feita ? 0.85 : 0 }}
              transition={trans(estatico, 0.4)}
            />
          </span>
        );
        const status = feita ? "concluída" : atual ? "atual" : "a seguir";
        return (
          <li key={item.nome} className="flex-1" aria-current={atual ? "step" : undefined}>
            {voltavel ? (
              <button type="button" onClick={() => irParaEtapa(i)} className="block w-full rounded-full py-[6px]" title={item.nome}>
                {barra}
                <span className="sr-only-vapti">{`${item.nome} (${status})`}</span>
              </button>
            ) : (
              <span className="block py-[6px]">
                {barra}
                <span className="sr-only-vapti">{`${item.nome} (${status})`}</span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Etapas                                                              */
/* ------------------------------------------------------------------ */

function Cabeca({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mb-[18px]">
      <TituloTela>{titulo}</TituloTela>
      <p className="mt-[8px] font-texto text-[16px] leading-[1.42] text-texto-2">{texto}</p>
    </div>
  );
}

function EtapaDados() {
  const d = e.dados;
  return (
    <>
      <Cabeca titulo={d.titulo} texto={e.lista[0].texto} />
      <dl className="flex flex-col gap-[10px]">
        <CampoLeitura rotulo={d.nome} valor={prototipo.ficticio.nome} />
        <CampoLeitura rotulo={d.celular} valor={prototipo.ficticio.celular} />
      </dl>
      <p className="mt-[14px] flex items-start gap-[8px] font-texto text-[14px] leading-snug text-texto-3">
        <Icone icone={Lock} tamanho={16} className="mt-[2px] flex-none" />
        {d.nota}
      </p>
    </>
  );
}

function EtapaOpenFinance() {
  const o = e.openFinance;
  return (
    <>
      <Cabeca titulo={o.titulo} texto={e.lista[1].texto} />
      <Cartao>
        <div className="mb-[6px] flex items-center gap-[12px]">
          <span className="grid size-[42px] place-items-center rounded-[12px] bg-azul-suave text-azul">
            <Icone icone={Landmark} tamanho={22} />
          </span>
          <div>
            <Rotulo>{o.contaRotulo}</Rotulo>
            <p className="font-texto text-[16px] font-semibold text-texto">{o.conta}</p>
          </div>
        </div>
        <dl>
          <Linha rotulo={o.leituraRotulo} valor={<span className="font-texto text-[15px] font-semibold">{o.leitura}</span>} />
          <Linha rotulo={o.finalidadeRotulo} valor={<span className="font-texto text-[15px] font-semibold">{o.finalidade}</span>} />
        </dl>
      </Cartao>
      <p className="mt-[14px] flex items-start gap-[8px] font-texto text-[14px] leading-snug text-texto-3">
        <Icone icone={ShieldCheck} tamanho={16} className="mt-[2px] flex-none" />
        {prototipo.aviso}
      </p>
    </>
  );
}

/** Recebimentos semanais fictícios dos últimos 90 dias (só desenho, sem valores). */
const SEMANAS = Math.round(produto.janelaAnaliseDias.valor / 7);
const RECEBIMENTOS = Array.from({ length: SEMANAS }, (_, i) => 0.56 + 0.26 * Math.sin(i * 1.3 + 0.4) + 0.16 * Math.cos(i * 2.9));
const LINHA_FRACA = (() => {
  const ordenado = [...RECEBIMENTOS].sort((a, b) => a - b);
  return ordenado[Math.floor((produto.percentilPeriodoRuim.valor / 100) * (ordenado.length - 1))];
})();

function EtapaAnalise({ aoConcluir }: { aoConcluir: () => void }) {
  const { estatico } = useCelular();
  const a = e.analise;
  const [passo, setPasso] = useState(estatico ? a.passos.length : 0);

  useEffect(() => {
    if (estatico) {
      aoConcluir();
      return;
    }
    const timers = a.passos.map((_, i) => window.setTimeout(() => setPasso(i + 1), 650 * (i + 1)));
    const fim = window.setTimeout(aoConcluir, 650 * a.passos.length + 150);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(fim);
    };
  }, [estatico]);

  const pronto = passo >= a.passos.length;
  const W = 350;
  const H = 120;
  const larguraBarra = W / SEMANAS;
  const yFraca = H - LINHA_FRACA * (H - 8);

  return (
    <>
      <Cabeca titulo={e.lista[2].nome} texto={e.lista[2].texto} />
      <Cartao className="pb-[12px]">
        <Rotulo className="mb-[10px]">{a.grafico}</Rotulo>
        <svg viewBox={`0 0 ${W} ${H + 18}`} className="block w-full" role="img" aria-label={a.grafico}>
          {RECEBIMENTOS.map((v, i) => {
            const h = v * (H - 8);
            const fraca = v <= LINHA_FRACA + 1e-9;
            return (
              <motion.rect
                key={i}
                x={i * larguraBarra + 3}
                width={larguraBarra - 6}
                rx={3}
                initial={estatico ? false : { y: H, height: 0 }}
                animate={{ y: H - h, height: h }}
                transition={trans(estatico, 0.45, i * 0.04)}
                fill={passo >= 2 && fraca ? "var(--cor-azul)" : "var(--cor-superficie-3)"}
              />
            );
          })}
          {passo >= 2 ? (
            <motion.g initial={estatico ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={trans(estatico, 0.3)}>
              <line x1={0} x2={W} y1={yFraca} y2={yFraca} stroke="var(--cor-azul)" strokeWidth={1.5} strokeDasharray="5 4" />
              <text x={W} y={H + 15} textAnchor="end" fontFamily="var(--fonte-mono)" fontSize={12} fill="var(--cor-azul)">
                {a.semanaFraca}
              </text>
            </motion.g>
          ) : null}
        </svg>
      </Cartao>
      <ul className="mt-[16px] flex flex-col gap-[10px]" aria-live="polite">
        {a.passos.map((txt, i) => {
          const feito = passo > i;
          const ativo = passo === i;
          return (
            <li key={txt} className="flex items-center gap-[12px]">
              <span
                className={`grid size-[26px] flex-none place-items-center rounded-full border transition-colors duration-300 ${
                  feito ? "border-verde bg-verde text-[var(--cor-sobre-verde)]" : "border-borda-forte text-texto-3"
                }`}
              >
                {feito ? (
                  <Icone icone={Check} tamanho={15} strokeWidth={2} />
                ) : ativo && !estatico ? (
                  <motion.span
                    className="block size-[12px] rounded-full border-2 border-texto-3 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                ) : null}
              </span>
              <span className={`font-texto text-[15px] ${feito ? "text-texto" : "text-texto-3"}`}>{txt}</span>
            </li>
          );
        })}
      </ul>
      <p className={`mt-[16px] font-mono text-[13px] uppercase tracking-[0.12em] ${pronto ? "text-verde" : "text-texto-3"}`} role="status">
        {pronto ? a.pronto : a.andamento}
      </p>
    </>
  );
}

function EtapaProposta() {
  return (
    <>
      <div className="mb-[14px] flex items-center justify-between gap-[10px]">
        <TituloTela>{p.titulo}</TituloTela>
        <Pilula tom="verde">{p.nivel}</Pilula>
      </div>
      <p className="-mt-[6px] mb-[14px] font-texto text-[15px] text-texto-2">{e.lista[3].texto}</p>

      {/* Herói: o que entra e o que sai */}
      <div className="rounded-[20px] border border-verde-borda bg-verde-suave p-[16px]">
        <Rotulo className="text-texto-2">{p.recebeRotulo}</Rotulo>
        <p className="font-mono text-[46px] font-bold leading-[1] tracking-[-0.05em] text-verde">{p.recebe}</p>
        <div className="mt-[14px] border-t border-verde-borda pt-[12px]">
          <Rotulo className="text-texto-2">{p.parcelasRotulo}</Rotulo>
          <p className="font-mono text-[26px] font-bold leading-[1.1] tracking-[-0.04em] text-texto">{p.parcelas}</p>
          <p className="mt-[2px] font-texto text-[14px] text-texto-2">{p.parcelaDetalhe}</p>
        </div>
      </div>

      {/* Custo, sempre em reais e ao mês */}
      <dl className="mt-[12px] rounded-[20px] border border-borda bg-superficie px-[16px] py-[4px]">
        <Linha rotulo={p.taxaRotulo} valor={<span className="font-texto text-[14px] font-semibold">{p.taxa}</span>} />
        <Linha rotulo={p.efetivaRotulo} valor={p.efetiva} />
        <Linha rotulo={p.jurosRotulo} valor={p.juros} />
        <Linha rotulo={p.custoTotalRotulo} valor={p.custoTotal} forte />
      </dl>

      {/* Credora */}
      <div className="mt-[12px] rounded-[20px] border border-azul-borda bg-azul-suave p-[16px]">
        <div className="flex items-center gap-[12px]">
          <span className="grid size-[40px] flex-none place-items-center rounded-[12px] bg-superficie text-azul">
            <Icone icone={Landmark} tamanho={21} />
          </span>
          <div className="min-w-0">
            <Rotulo className="text-azul">{p.credoraRotulo}</Rotulo>
            <p className="font-texto text-[16px] font-bold leading-snug text-texto">{p.credora}</p>
          </div>
        </div>
        <p className="mt-[10px] font-texto text-[14px] leading-snug text-texto-2">{p.credoraNota}</p>
      </div>

      {/* Vencimentos */}
      <div className="mt-[12px] rounded-[20px] border border-borda bg-superficie p-[16px]">
        <Rotulo className="mb-[8px]">{p.vencimentosRotulo}</Rotulo>
        <ol className="grid grid-cols-4 gap-[6px]">
          {p.vencimentos.map((d) => (
            <li key={d} className="rounded-[10px] bg-superficie-2 px-[4px] py-[8px] text-center">
              <span className="block font-mono text-[14px] font-bold text-texto">{d}</span>
              <span className="block font-mono text-[12px] text-texto-3">{PARCELA}</span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

function EtapaAceite({ aceito, setAceito }: { aceito: boolean; setAceito: (v: boolean) => void }) {
  const id = useId();
  return (
    <>
      <Cabeca titulo={e.lista[4].nome} texto={e.aceite.contrato} />
      <Rotulo className="mb-[6px]">{e.aceite.resumo}</Rotulo>
      <dl className="rounded-[20px] border border-borda bg-superficie px-[16px] py-[4px]">
        <Linha rotulo={p.recebeRotulo} valor={p.recebe} tom="verde" />
        <Linha rotulo={p.parcelasRotulo} valor={p.parcelas} />
        <Linha rotulo={p.efetivaRotulo} valor={p.efetiva} />
        <Linha rotulo={p.jurosRotulo} valor={p.juros} />
        <Linha rotulo={p.custoTotalRotulo} valor={p.custoTotal} forte />
        <Linha rotulo={p.credoraRotulo} valor={<span className="font-texto text-[14px] font-semibold">{p.credora}</span>} />
      </dl>
      <label
        htmlFor={id}
        className={`mt-[14px] flex cursor-pointer items-start gap-[12px] rounded-[16px] border p-[14px] transition-colors duration-200 ${
          aceito ? "border-verde-borda bg-verde-suave" : "border-borda-forte bg-superficie"
        }`}
      >
        <input
          id={id}
          type="checkbox"
          checked={aceito}
          onChange={(ev) => setAceito(ev.target.checked)}
          className="mt-[2px] size-[22px] flex-none cursor-pointer accent-[var(--cor-verde)]"
        />
        <span className="font-texto text-[15px] leading-snug text-texto">{e.lista[4].texto}</span>
      </label>
    </>
  );
}

function EtapaPix() {
  const x = e.pix;
  const garantias = [
    { icone: BellRing, texto: x.aviso },
    { icone: CalendarX2, texto: x.cancelar },
    { icone: RefreshCw, texto: x.retentativas },
  ];
  return (
    <>
      <Cabeca titulo={e.lista[5].nome} texto={e.lista[5].texto} />
      <dl className="rounded-[20px] border border-borda bg-superficie px-[16px] py-[4px]">
        <Linha rotulo={x.valorRotulo} valor={PARCELA} />
        <Linha rotulo={x.datasRotulo} valor={<span className="text-[14px]">{p.vencimentos.join(" · ")}</span>} />
        <Linha rotulo={x.recebedorRotulo} valor={<span className="font-texto text-[14px] font-semibold">{x.recebedor}</span>} />
      </dl>
      <ul className="mt-[14px] flex flex-col gap-[10px]">
        {garantias.map((g) => (
          <li key={g.texto} className="flex items-start gap-[12px] font-texto text-[15px] leading-snug text-texto-2">
            <span className="grid size-[30px] flex-none place-items-center rounded-full bg-superficie-2 text-texto">
              <Icone icone={g.icone} tamanho={16} />
            </span>
            <span className="pt-[4px]">{g.texto}</span>
          </li>
        ))}
      </ul>
      <p className="mt-[14px] flex items-center gap-[10px] rounded-[14px] border border-verde-borda bg-verde-suave px-[14px] py-[10px] font-texto text-[14px] font-semibold text-verde">
        <Icone icone={TrendingUp} tamanho={18} className="flex-none" />
        {x.acelera}
      </p>
    </>
  );
}

function EtapaRecebido() {
  const { estatico } = useCelular();
  const r = e.recebido;
  return (
    <div className="flex flex-col items-center pt-[18px] text-center">
      <div className="relative grid size-[112px] place-items-center">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-verde-suave"
          initial={estatico ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={trans(estatico, 0.4)}
        />
        <svg viewBox="0 0 64 64" className="relative size-[76px]" aria-hidden="true">
          <motion.circle
            cx={32}
            cy={32}
            r={29}
            fill="none"
            stroke="var(--cor-verde)"
            strokeWidth={3}
            initial={estatico ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={trans(estatico, 0.5, 0.1)}
          />
          <motion.path
            d="M20 33 L28.5 41.5 L45 24"
            fill="none"
            stroke="var(--cor-verde)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={estatico ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={trans(estatico, 0.35, 0.5)}
          />
        </svg>
      </div>
      <TituloTela className="mt-[14px] text-[30px]">{e.lista[6].nome}</TituloTela>
      <motion.p
        className="mt-[6px] font-mono text-[56px] font-bold leading-none tracking-[-0.05em] text-verde"
        initial={estatico ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={trans(estatico, 0.4, 0.55)}
      >
        {p.recebe}
      </motion.p>
      <motion.span
        aria-hidden="true"
        className="traco-vupt mt-[14px]"
        style={{ width: 44, height: 7 }}
        initial={estatico ? false : { x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={trans(estatico, 0.4, 0.7)}
      />
      <p className="mt-[16px] max-w-[300px] font-texto text-[16px] leading-[1.42] text-texto-2">{e.lista[6].texto}</p>
      <dl className="mt-[18px] w-full rounded-[20px] border border-borda bg-superficie px-[16px] py-[4px] text-left">
        <Linha rotulo={r.deRotulo} valor={<span className="font-texto text-[14px] font-semibold">{r.de}</span>} />
        <Linha rotulo={r.paraRotulo} valor={<span className="font-texto text-[15px] font-semibold">{r.para}</span>} />
        <Linha rotulo={r.valorRotulo} valor={p.recebe} tom="verde" />
      </dl>
    </div>
  );
}
