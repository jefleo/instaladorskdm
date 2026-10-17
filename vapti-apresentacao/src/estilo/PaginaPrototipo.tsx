import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { Icone, Wordmark } from "../components/base";
import { Celular, EscadaNiveis, type TelaInicial } from "../components/prototipo";

/** Página interna #/prototipo — bancada de teste do dev-prototipo. */

const secao = (largura: number): CSSProperties => ({
  containerType: "inline-size",
  containerName: "secao",
  width: largura,
  maxWidth: "100%",
});

const INICIOS: TelaInicial[] = ["conversa", "jornada", "painel", "niveis", "atraso"];

function Bloco({ id, titulo, largura, children }: { id: string; titulo: string; largura: number; children: ReactNode }) {
  return (
    <section id={id} className="border-t border-borda py-12">
      <p className="mb-6 px-4 font-mono text-[15px] uppercase tracking-[0.14em] text-texto-3">
        {titulo} · {largura}px
      </p>
      <div style={secao(largura)} className="mx-auto">
        {children}
      </div>
    </section>
  );
}

export function PaginaPrototipo() {
  const [claro, setClaro] = useState(() => document.documentElement.dataset.modo === "claro");
  useEffect(() => {
    const html = document.documentElement;
    if (claro) html.dataset.modo = "claro";
    else delete html.dataset.modo;
  }, [claro]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-tinta font-texto text-texto">
      <header className="flex flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-12">
        <div className="flex items-baseline gap-4">
          <Wordmark tamanho={44} />
          <span className="font-mono text-[15px] uppercase tracking-[0.14em] text-texto-3">Bancada do protótipo · página interna</span>
        </div>
        <button
          type="button"
          onClick={() => setClaro((v) => !v)}
          aria-pressed={claro}
          className="inline-flex items-center gap-3 rounded-full border border-borda-forte bg-superficie px-5 py-2 font-mono text-[15px] uppercase tracking-[0.08em]"
        >
          <Icone icone={claro ? Moon : Sun} tamanho="1.1em" />
          {claro ? "Ver escuro" : "Ver claro"}
        </button>
      </header>

      <Bloco id="celular-principal" titulo="Celular · tamanho real" largura={1680}>
        <Celular inicio="conversa" />
      </Bloco>

      <Bloco id="celular-compacto" titulo="Celular · compacto, cada tela inicial" largura={1680}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(540px,1fr))] gap-x-8 gap-y-14">
          {INICIOS.map((t) => (
            <Celular key={t} inicio={t} compacto />
          ))}
          <Celular inicio="jornada" etapa={3} compacto />
        </div>
      </Bloco>

      <Bloco id="escada" titulo="Escada de níveis (V10)" largura={1680}>
        <EscadaNiveis />
      </Bloco>

      <Bloco id="escada-estreita" titulo="Escada de níveis · coluna de 1000px, compacta" largura={1000}>
        <EscadaNiveis compacto />
      </Bloco>

      <Bloco id="celular-390" titulo="Celular · 390" largura={390}>
        <div className="px-4">
          <Celular inicio="jornada" />
        </div>
      </Bloco>

      <Bloco id="escada-390" titulo="Escada · 390" largura={390}>
        <div className="px-4">
          <EscadaNiveis />
        </div>
      </Bloco>
    </main>
  );
}
