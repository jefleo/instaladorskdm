import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ContextoExibicao, type Exibicao } from "../sections";

export const LARGURA = 1920;
export const ALTURA = 1080;

/** Palco fixo de 1920×1080 escalado para caber no pai (letterbox na cor tinta). */
export function Palco({ children, exibicao = "palco", rotulo }: { children: ReactNode; exibicao?: Exibicao; rotulo?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => {
      const { width, height } = el.getBoundingClientRect();
      setEscala(Math.max(0, Math.min(width / LARGURA, height / ALTURA)));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="palco-moldura">
      <div
        className="palco"
        role="region"
        aria-label={rotulo}
        style={{ transform: `translate(-50%, -50%) scale(${escala})`, visibility: escala ? "visible" : "hidden" }}
      >
        <ContextoExibicao.Provider value={exibicao}>{children}</ContextoExibicao.Provider>
      </div>
    </div>
  );
}

/** Miniatura inerte de uma tela (grade e janela de notas). */
export function Miniatura({ largura, children }: { largura: number; children: ReactNode }) {
  const escala = largura / LARGURA;
  return (
    <div className="miniatura" style={{ width: largura, height: Math.round(ALTURA * escala) }} inert>
      <div className="palco-fixo" style={{ transform: `scale(${escala})` }}>
        <ContextoExibicao.Provider value="miniatura">{children}</ContextoExibicao.Provider>
      </div>
    </div>
  );
}

/** Miniatura que ocupa a largura do pai. */
export function MiniaturaFluida({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setLargura(el.getBoundingClientRect().width);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="w-full" style={{ aspectRatio: "16 / 9" }}>
      {largura ? <Miniatura largura={largura}>{children}</Miniatura> : null}
    </div>
  );
}
