import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Icone } from "../components/base";
import { atalhos } from "../content/ui";

/** Ajuda de atalhos (?). */
export function Ajuda({ onFechar }: { onFechar: () => void }) {
  const fechar = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    fechar.current?.focus();
    return () => anterior?.focus?.();
  }, []);
  return (
    <div className="ajuda-fundo" onClick={onFechar}>
      <div
        className="ajuda-caixa"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ajuda-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="ajuda-titulo" className="font-titulo text-[30px] font-bold text-texto">
            {atalhos.titulo}
          </h2>
          <button ref={fechar} type="button" className="botao-shell botao-shell--icone" onClick={onFechar} aria-label={atalhos.fechar}>
            <Icone icone={X} tamanho={22} />
          </button>
        </div>
        <dl className="mt-5 divide-y divide-borda">
          {atalhos.itens.map((a) => (
            <div key={a.acao} className="flex items-center justify-between gap-6 py-3">
              <dt className="flex flex-wrap gap-2">
                {a.teclas.map((t) => (
                  <kbd key={t} className="tecla">
                    {t}
                  </kbd>
                ))}
              </dt>
              <dd className="text-right text-[17px] text-texto-2">{a.acao}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[15px] text-texto-3">{atalhos.passador}</p>
        <p className="mt-1 text-[15px] text-texto-3">{atalhos.slider}</p>
      </div>
    </div>
  );
}
