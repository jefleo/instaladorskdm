/**
 * Tela 4 — Níveis Entrada → Ouro: taxa semanal com a efetiva ao mês e os juros
 * de R$ 400, como chega, quando o limite volta e as regras de subida e descida.
 */
import { motion } from "motion/react";
import { ArrowUp, ArrowDown, RefreshCw, Umbrella } from "lucide-react";
import { Icone } from "../base";
import { prototipo } from "../../content/ui";
import { niveis } from "../../data/vapti";
import { Pendente, Pilula, Rotulo, Tela, TituloTela, TopoApp, trans, useCelular } from "./pecas";

const nv = prototipo.niveis;
const es = prototipo.escada;
const ATUAL = "bronze";

export function TelaNiveis({ aoVoltar }: { aoVoltar: () => void }) {
  const { estatico } = useCelular();
  const topo = (
    <div className="px-[8px]">
      <TopoApp titulo={<span className="font-texto text-[16px] font-bold text-texto">{nv.titulo}</span>} aoVoltar={aoVoltar} rotuloVoltar={nv.voltar} />
    </div>
  );

  return (
    <Tela topo={topo} className="px-[16px] pb-[30px]">
      <div className="px-[4px] pb-[14px] pt-[6px]">
        <TituloTela>{nv.titulo}</TituloTela>
        <p className="mt-[6px] font-texto text-[15px] leading-snug text-texto-2">{nv.subtitulo}</p>
      </div>

      <ol className="relative flex flex-col gap-[8px]">
        {niveis.map((n, i) => {
          const atual = n.id === ATUAL;
          const volta = n.limiteVolta.toLowerCase();
          const devolve = n.limiteVolta !== niveis[0].limiteVolta;
          return (
            <motion.li
              key={n.id}
              initial={estatico ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={trans(estatico, 0.3, i * 0.06)}
              aria-current={atual ? "true" : undefined}
              className={`rounded-[18px] border p-[14px] ${atual ? "border-verde-borda bg-verde-suave" : "border-borda bg-superficie"}`}
            >
              <div className="flex items-start justify-between gap-[10px]">
                <div className="min-w-0">
                  <p className="flex items-center gap-[8px]">
                    <span className="font-mono text-[12px] text-texto-3">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`font-titulo text-[21px] font-extrabold tracking-[-0.03em] ${atual ? "text-verde" : "text-texto"}`}>{n.nome}</span>
                  </p>
                  <p className="mt-[1px] font-texto text-[13px] leading-snug text-texto-2">{n.comoChega}</p>
                </div>
                {atual ? <Pilula tom="verde">{nv.atual}</Pilula> : null}
              </div>

              <dl className="mt-[10px] grid grid-cols-3 gap-[6px]">
                <Mini valor={n.taxaSemanal.rotulo} rotulo={es.porSemana} />
                <Mini valor={n.efetivaMes.rotulo} rotulo={es.aoMes} />
                <Mini valor={n.jurosExemplo.rotulo} rotulo={es.jurosEm} />
              </dl>

              <div className="mt-[8px] flex flex-wrap gap-[6px]">
                <span className={`inline-flex items-center gap-[6px] font-texto text-[13px] ${devolve ? "text-verde" : "text-texto-3"}`}>
                  <Icone icone={RefreshCw} tamanho={13} />
                  {`${es.limiteVolta}: ${volta}`}
                </span>
                {n.extra ? (
                  <span className="inline-flex items-center gap-[6px] font-texto text-[13px] font-semibold text-verde">
                    <Icone icone={Umbrella} tamanho={13} />
                    {n.extra}
                  </span>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>

      <Regras titulo={nv.subida.titulo} itens={nv.subida.itens} icone="sobe" />
      <Regras titulo={nv.descida.titulo} itens={nv.descida.itens} icone="desce" />
    </Tela>
  );
}

function Mini({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="flex flex-col-reverse justify-end rounded-[10px] bg-tinta/60 px-[8px] py-[6px]">
      <dt className="font-texto text-[11px] leading-tight text-texto-3">{rotulo}</dt>
      <dd className="font-mono text-[17px] font-bold leading-tight tracking-[-0.03em] text-texto">{valor}</dd>
    </div>
  );
}

function Regras({ titulo, itens, icone }: { titulo: string; itens: readonly string[]; icone: "sobe" | "desce" }) {
  return (
    <section className="mt-[14px] rounded-[18px] border border-borda bg-superficie p-[14px]">
      <Rotulo className="mb-[8px] flex items-center gap-[6px]">
        <Icone icone={icone === "sobe" ? ArrowUp : ArrowDown} tamanho={13} />
        {titulo}
      </Rotulo>
      <ul className="flex flex-col gap-[6px]">
        {itens.map((t) => (
          <li key={t} className="flex gap-[8px] font-texto text-[14px] leading-snug text-texto-2">
            <span aria-hidden="true" className="mt-[0.62em] h-[2px] w-[8px] flex-none bg-texto-3" />
            <span>
              <Pendente texto={t} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
