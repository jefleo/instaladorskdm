/**
 * Tela 5 — Atraso, com tom humano: lembrete gentil, pagamento parcial, oferta de
 * reparcelamento e encargos informados com transparência. Fala só com o cliente.
 */
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, CalendarSync, Check, ChevronRight, Coins, Info, MessageCircleHeart, Scale } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icone, Wordmark } from "../base";
import { prototipo } from "../../content/ui";
import { BotaoPrimario, Pendente, Pilula, Rotulo, Tela, TituloTela, TopoApp, trans, useCelular } from "./pecas";

const a = prototipo.atraso;
type Escolha = "tudo" | "parte" | "reparcelar" | "pessoa";

export function TelaAtraso({ aoVoltar }: { aoVoltar: () => void }) {
  const { estatico } = useCelular();
  const [escolha, setEscolha] = useState<Escolha | null>(null);
  const alternar = (e: Escolha) => setEscolha((atual) => (atual === e ? null : e));

  const topo = (
    <div className="px-[8px]">
      <TopoApp titulo={<Wordmark tamanho={22} />} aoVoltar={aoVoltar} rotuloVoltar={a.voltar} />
    </div>
  );

  return (
    <Tela topo={topo} className="px-[18px] pb-[30px] pt-[6px]">
      <Pilula tom="coral" icone={CalendarClock}>
        {a.vencida}
      </Pilula>
      <TituloTela className="mt-[12px]">{a.titulo}</TituloTela>
      <p className="mt-[8px] font-texto text-[16px] leading-[1.42] text-texto-2">{a.lembrete}</p>

      {/* Linha do tempo do atraso: lembrete → tolerância → reparcelamento */}
      <ol className="mt-[14px] grid grid-cols-3 gap-[6px]">
        {a.linha.map((passo, i) => (
          <li key={passo.oque} className="relative">
            <span
              aria-hidden="true"
              className={`block h-[4px] rounded-full ${i === 0 ? "bg-texto-2" : "bg-superficie-3"}`}
            />
            <p className="mt-[6px] font-mono text-[12px] font-bold text-texto">{passo.quando}</p>
            <p className="font-texto text-[12px] leading-tight text-texto-3">{passo.oque}</p>
          </li>
        ))}
      </ol>

      <p className="mt-[12px] flex items-start gap-[8px] font-texto text-[14px] leading-snug text-texto-3">
        <Icone icone={Info} tamanho={16} className="mt-[2px] flex-none" />
        {a.bloqueio}
      </p>

      <Rotulo className="mb-[8px] mt-[18px]">{a.opcoesTitulo}</Rotulo>
      <div className="flex flex-col gap-[8px]" aria-live="polite">
        <BotaoPrimario onClick={() => alternar("tudo")}>{a.pagarTudo}</BotaoPrimario>
        <Retorno ativo={escolha === "tudo"} estatico={estatico} tom="verde">
          {a.pagoOk}
        </Retorno>

        <Opcao icone={Coins} titulo={a.pagarParte} sub={a.pagarParteExemplo} ativo={escolha === "parte"} onClick={() => alternar("parte")} />
        <Retorno ativo={escolha === "parte"} estatico={estatico} tom="verde">
          {a.pagarParteOk}
        </Retorno>

        <Opcao icone={CalendarSync} titulo={a.reparcelar} sub={a.reparcelarNota} ativo={escolha === "reparcelar"} onClick={() => alternar("reparcelar")} />
        <Retorno ativo={escolha === "reparcelar"} estatico={estatico}>
          <Pendente texto={a.reparcelarCondicoes} />
        </Retorno>

        <Opcao icone={MessageCircleHeart} titulo={a.falar} ativo={escolha === "pessoa"} onClick={() => alternar("pessoa")} />
        <Retorno ativo={escolha === "pessoa"} estatico={estatico}>
          {a.falarOk}
        </Retorno>
      </div>

      {/* Encargos, com transparência */}
      <section className="mt-[16px] rounded-[18px] border border-borda bg-superficie p-[14px]">
        <Rotulo className="mb-[6px] flex items-center gap-[6px]">
          <Icone icone={Scale} tamanho={13} />
          {a.encargosTitulo}
        </Rotulo>
        <p className="font-texto text-[14px] leading-snug text-texto-2">{a.encargos}</p>
        <p className="mt-[6px] font-texto text-[14px] font-semibold leading-snug text-texto">{a.multaExemplo}</p>
      </section>

      <ul className="mt-[12px] flex flex-col gap-[4px] font-texto text-[13px] leading-snug text-texto-3">
        <li>{a.horario}</li>
        <li>{a.terceiros}</li>
      </ul>
    </Tela>
  );
}

function Opcao({
  icone,
  titulo,
  sub,
  ativo,
  onClick,
}: {
  icone: LucideIcon;
  titulo: string;
  sub?: string;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ativo}
      className={`flex w-full items-center gap-[12px] rounded-[16px] border p-[12px] text-left transition-colors duration-200 ${
        ativo ? "border-borda-forte bg-superficie-2" : "border-borda bg-superficie hover:bg-superficie-2"
      }`}
    >
      <span className="grid size-[36px] flex-none place-items-center rounded-[11px] bg-superficie-3 text-texto">
        <Icone icone={icone} tamanho={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-texto text-[15px] font-bold text-texto">{titulo}</span>
        {sub ? <span className="block font-texto text-[13px] leading-snug text-texto-3">{sub}</span> : null}
      </span>
      <Icone icone={ChevronRight} tamanho={18} className={`flex-none text-texto-3 transition-transform duration-200 ${ativo ? "rotate-90" : ""}`} />
    </button>
  );
}

function Retorno({ ativo, estatico, tom, children }: { ativo: boolean; estatico: boolean; tom?: "verde"; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {ativo ? (
        <motion.div
          initial={estatico ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={estatico ? { opacity: 0, height: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
          transition={trans(estatico, 0.25)}
          className="overflow-hidden"
        >
          <p
            className={`flex items-start gap-[8px] rounded-[14px] px-[12px] py-[10px] font-texto text-[14px] leading-snug ${
              tom === "verde" ? "bg-verde-suave text-verde" : "bg-superficie-2 text-texto-2"
            }`}
          >
            {tom === "verde" ? <Icone icone={Check} tamanho={16} className="mt-[2px] flex-none" /> : null}
            <span>{children}</span>
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
