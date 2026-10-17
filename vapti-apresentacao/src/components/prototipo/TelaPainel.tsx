/**
 * Tela 3 — Painel do cliente: saldo e limite, próxima parcela, nível e progresso,
 * semanas em dia (com a tolerância do trimestre) e linha do tempo do limite.
 */
import { motion } from "motion/react";
import { ArrowRight, Check, Medal, RefreshCw, ShieldCheck } from "lucide-react";
import { Icone } from "../base";
import { prototipo } from "../../content/ui";
import { niveis } from "../../data/vapti";
import { BotaoSecundario, Pilula, Rotulo, Tela, TituloTela, trans, useCelular } from "./pecas";

const pn = prototipo.painel;
const f = prototipo.ficticio;
const [, nBronze, nPrata] = niveis;

export function TelaPainel({ aoVerNiveis }: { aoVerNiveis: () => void }) {
  const { estatico } = useCelular();

  const topo = (
    <div className="flex h-[60px] items-center justify-between px-[20px]">
      <TituloTela className="text-[26px]">{pn.titulo}</TituloTela>
      <Pilula tom="verde" icone={Medal}>
        {pn.nivel}
      </Pilula>
    </div>
  );

  return (
    <Tela topo={topo} className="px-[16px] pb-[30px] pt-[4px]">
      <div className="flex flex-col gap-[10px]">
        {/* Saldo e limite */}
        <section className="rounded-[22px] border border-borda-forte bg-superficie-2 p-[16px]" aria-label={pn.saldoRotulo}>
          <div className="flex items-start justify-between gap-[12px]">
            <div>
              <Rotulo>{pn.saldoRotulo}</Rotulo>
              <p className="mt-[2px] font-mono text-[40px] font-bold leading-none tracking-[-0.05em] text-texto">{pn.saldo}</p>
            </div>
            <div className="text-right">
              <Rotulo>{pn.limiteRotulo}</Rotulo>
              <p className="mt-[2px] font-mono text-[22px] font-bold leading-tight tracking-[-0.04em] text-verde">{f.limiteAtual}</p>
            </div>
          </div>
          <div className="mt-[14px] flex flex-wrap items-center justify-between gap-[8px] border-t border-borda pt-[12px]">
            <span className="flex items-center gap-[7px] font-texto text-[14px] text-texto-2">
              <Icone icone={RefreshCw} tamanho={15} />
              {pn.limiteVolta}
            </span>
          </div>
        </section>

        {/* Próxima parcela */}
        <section className="rounded-[22px] border border-borda bg-superficie p-[16px]" aria-label={pn.proximaParcelaRotulo}>
          <Rotulo>{pn.proximaParcelaRotulo}</Rotulo>
          <div className="mt-[4px] flex flex-wrap items-center justify-between gap-[8px]">
            <p className="font-mono text-[21px] font-bold tracking-[-0.03em] text-texto">{pn.proximaParcela}</p>
            <Pilula tom="verde" icone={Check}>
              {pn.pagamento}
            </Pilula>
          </div>
        </section>

        {/* Nível e progresso */}
        <section className="rounded-[22px] border border-borda bg-superficie p-[16px]" aria-label={pn.nivelRotulo}>
          <div className="flex items-baseline justify-between">
            <Rotulo>{pn.nivelRotulo}</Rotulo>
            <span className="font-mono text-[13px] text-texto-3">{pn.progresso}</span>
          </div>
          <div className="mt-[10px] flex gap-[5px]" aria-hidden="true">
            {Array.from({ length: nPrata.ciclos }, (_, i) => {
              const cheio = i < f.ciclosQuitados;
              return (
                <span key={i} className="relative h-[10px] flex-1 overflow-hidden rounded-[3px] bg-superficie-3">
                  <motion.span
                    className="absolute inset-0 origin-left bg-verde"
                    initial={estatico ? false : { scaleX: 0 }}
                    animate={{ scaleX: cheio ? 1 : 0 }}
                    transition={trans(estatico, 0.35, 0.15 + i * 0.08)}
                  />
                </span>
              );
            })}
          </div>
          <div className="mt-[6px] flex font-mono text-[12px] text-texto-3" aria-hidden="true">
            <span style={{ width: `${(nBronze.ciclos / nPrata.ciclos) * 100}%` }} className="text-right">
              {nBronze.nome}
            </span>
            <span className="flex-1 text-right">{nPrata.nome}</span>
          </div>
          <p className="mt-[8px] font-texto text-[17px] font-bold text-verde">{pn.faltam}</p>
          <p className="mt-[2px] font-texto text-[13px] leading-snug text-texto-2">{pn.proximoNivel}</p>
        </section>

        {/* Linha do tempo + semanas em dia */}
        <section className="rounded-[22px] border border-borda bg-superficie p-[16px]" aria-label={pn.linhaTempo.titulo}>
          <Rotulo>{pn.linhaTempo.titulo}</Rotulo>
          <div className="mt-[12px] grid grid-cols-[auto_1fr_auto] items-center gap-[10px]">
            <div>
              <p className="font-texto text-[12px] text-texto-3">{pn.limiteInicialRotulo}</p>
              <p className="font-mono text-[18px] font-bold tracking-[-0.03em] text-texto-2">{f.limiteInicial}</p>
            </div>
            <div className="relative flex h-[26px] items-center" aria-hidden="true">
              <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-[var(--cor-borda-forte)] to-[var(--cor-verde)]" />
              <span className="relative flex w-full justify-evenly">
                {Array.from({ length: f.ciclosQuitados }, (_, i) => {
                  const marco = i + 1 === nBronze.ciclos;
                  return (
                    <span
                      key={i}
                      title={pn.ciclo(i + 1)}
                      className={`grid place-items-center rounded-full border-2 border-superficie font-mono text-[10px] font-bold ${
                        marco ? "size-[24px] bg-verde text-[var(--cor-sobre-verde)]" : "size-[18px] bg-borda-forte text-texto"
                      }`}
                    >
                      {marco ? <Icone icone={Medal} tamanho={13} /> : i + 1}
                    </span>
                  );
                })}
              </span>
            </div>
            <div className="text-right">
              <p className="font-texto text-[12px] text-texto-3">{pn.limiteAtualRotulo}</p>
              <p className="font-mono text-[18px] font-bold tracking-[-0.03em] text-verde">{f.limiteAtual}</p>
            </div>
          </div>
          <p className="sr-only-vapti">{`${pn.linhaTempo.limiteInicial}. ${pn.linhaTempo.limiteAtual}. ${pn.linhaTempo.semanas}.`}</p>

          <div className="mt-[14px] border-t border-borda pt-[12px]">
            <div className="flex items-center justify-between">
              <p className="font-texto text-[15px] font-bold text-texto">{pn.sequencia}</p>
            </div>
            <div className="mt-[8px] flex items-center gap-[5px]" aria-hidden="true">
              {Array.from({ length: f.semanasEmDia }, (_, i) => (
                <motion.span
                  key={i}
                  className="grid h-[24px] flex-1 place-items-center rounded-[6px] bg-verde-suave text-verde"
                  initial={estatico ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={trans(estatico, 0.3, 0.3 + i * 0.06)}
                >
                  <Icone icone={Check} tamanho={14} />
                </motion.span>
              ))}
              <span className="grid h-[24px] flex-1 place-items-center rounded-[6px] border border-dashed border-borda-forte text-texto-3">
                <Icone icone={ShieldCheck} tamanho={14} />
              </span>
            </div>
            <p className="mt-[8px] flex items-center gap-[6px] font-texto text-[13px] text-texto-2">
              <Icone icone={ShieldCheck} tamanho={15} className="flex-none text-texto-3" />
              {pn.tolerancia}
            </p>
          </div>
        </section>

        <BotaoSecundario onClick={aoVerNiveis} icone={ArrowRight} className="mt-[2px] flex-row-reverse">
          {pn.verNiveis}
        </BotaoSecundario>
      </div>
    </Tela>
  );
}
