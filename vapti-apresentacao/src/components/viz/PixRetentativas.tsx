import { ArrowDown, ArrowRight, Bell, CalendarClock, CalendarRange, Check, Repeat, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { produto } from "../../data/vapti";
import { viz } from "../../content/ui";
import { Icone } from "../base";
import { entrada, Figura, useViz, type VizProps } from "./comum";

const ICONES = [ShieldCheck, Bell, CalendarClock, Repeat];

/** V09 — Pix Automático (só no plano semanal): autorização única, cobrança programada 2 a 10 dias antes, até 3 novas tentativas (1 ✕, 2 ✕, 3 ✓). Sem logotipo: só texto. */
export function PixRetentativas({ compacto = false, legenda = true, className }: VizProps = {}) {
  const { ref, largura, ativo, animar } = useViz();
  const horizontal = !compacto && largura >= 1100;
  const n = produto.pixRetentativas.valor;
  const tentativas = Array.from({ length: n }, (_, i) => i + 1);

  const Seta = () => (
    <span className="grid flex-none place-items-center text-texto-3" aria-hidden="true" style={horizontal ? { width: "2.2em" } : { height: "1.8em" }}>
      <Icone icone={horizontal ? ArrowRight : ArrowDown} tamanho="1.2em" />
    </span>
  );

  return (
    <Figura visual="V09" titulo={viz.pix.titulo} legenda={legenda} className={className}>
      <div ref={ref} className="w-full font-texto">
        <ol className={`m-0 flex list-none p-0 ${horizontal ? "flex-row items-stretch" : "flex-col"}`}>
          {viz.pix.passos.map((p, i) => {
            const ultimo = i === viz.pix.passos.length - 1;
            return (
              <li key={p.titulo} className={`flex ${horizontal ? "min-w-0 flex-row" : "flex-col"}`} style={{ flex: horizontal ? (ultimo ? "1.5 1 0" : "1 1 0") : undefined }}>
                <div
                  className={`flex w-full min-w-0 flex-col rounded-3 border-2 bg-superficie p-[0.9em] ${i === 1 ? "border-azul-borda" : "border-borda-forte"}`}
                  style={entrada(ativo, animar, "subir", i * 70, 300)}
                >
                  <p className="flex items-center gap-[0.45em] font-mono text-apoio text-texto-3">
                    <Icone icone={ICONES[i]} tamanho="1.1em" className={i === 1 ? "text-azul" : "text-texto-2"} />
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-[0.3em] font-titulo text-corpo-g font-bold leading-tight text-texto">{p.titulo}</p>
                  <p className="mt-[0.3em] text-apoio leading-snug text-texto-2">{p.texto}</p>
                  {ultimo ? (
                    <ul className="mt-[0.7em] flex list-none flex-wrap gap-[0.5em] p-0">
                      {tentativas.map((k) => {
                        const ok = k === n;
                        return (
                          <li
                            key={k}
                            className={`inline-flex items-center gap-[0.4em] rounded-2 border px-[0.6em] py-[0.35em] text-apoio font-semibold ${
                              ok ? "border-verde-borda bg-verde-suave text-verde" : "border-coral-borda bg-coral-suave text-coral"
                            }`}
                            style={entrada(ativo, animar, "fade", 320 + k * 70, 250)}
                          >
                            <Icone icone={ok ? Check : X} tamanho="1em" strokeWidth={2.5} />
                            <span className="font-mono">{k}</span>
                            <span className="text-texto-2">{ok ? viz.pix.passou : viz.pix.falhou}</span>
                            <span className="sr-only-vapti">{viz.pix.tentativa(k)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
                {!ultimo ? <Seta /> : null}
              </li>
            );
          })}
        </ol>
        <div className={`mt-[1em] flex flex-wrap items-center gap-[1em] ${horizontal ? "pl-[calc(25%-1.5em)]" : ""}`}>
          <div
            className="flex items-start gap-[0.6em] rounded-3 border-2 border-coral-borda bg-coral-suave px-[0.9em] py-[0.7em]"
            style={entrada(ativo, animar, "subir", 360, 300)}
          >
            <Icone icone={TriangleAlert} tamanho="1.2em" className="mt-[0.1em] flex-none text-coral" />
            <p className="text-apoio leading-snug text-texto-2">
              <strong className="font-semibold text-texto">{viz.pix.cancelamento.titulo}</strong> {viz.pix.cancelamento.texto}
            </p>
          </div>
          <p className="text-apoio text-texto-3">{viz.pix.alternativa}</p>
        </div>
        <div className={`mt-[1em] grid gap-[1em] ${horizontal ? "grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]" : "grid-cols-1"}`}>
          <div
            className="flex items-start gap-[0.6em] rounded-3 border-2 border-azul-borda bg-azul-suave px-[0.9em] py-[0.7em]"
            style={entrada(ativo, animar, "subir", 420, 300)}
          >
            <Icone icone={CalendarRange} tamanho="1.2em" className="mt-[0.1em] flex-none text-azul" />
            <p className="text-apoio leading-snug text-texto-2">
              <strong className="font-semibold text-texto">{viz.pix.soSemanal.titulo}</strong> {viz.pix.soSemanal.texto}
            </p>
          </div>
          <div className="flex flex-col gap-[0.4em] text-apoio leading-snug text-texto-3" style={entrada(ativo, animar, "fade", 480, 300)}>
            <p>{viz.pix.custo}</p>
            <p>{viz.pix.calendario}</p>
          </div>
        </div>
      </div>
    </Figura>
  );
}
