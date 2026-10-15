import { useEffect, useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Icone } from "../components/base";
import { atalhos, modos } from "../content/ui";
import { slides } from "../sections";
import { Miniatura } from "./Palco";

/** Grade (G): miniaturas de todas as telas. Clique ou Enter vai à tela. */
export function Grade({ atual, onIr, onFechar }: { atual: number; onIr: (i: number) => void; onFechar: () => void }) {
  const lista = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const b = lista.current?.querySelectorAll<HTMLButtonElement>(".miniatura-botao")[atual];
    b?.focus();
    b?.scrollIntoView({ block: "center" });
  }, [atual]);

  const mover = (e: KeyboardEvent<HTMLOListElement>) => {
    const botoes = Array.from(lista.current?.querySelectorAll<HTMLButtonElement>(".miniatura-botao") ?? []);
    const i = botoes.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const topo0 = botoes[0].offsetTop;
    const colunas = Math.max(1, botoes.filter((b) => b.offsetTop === topo0).length);
    const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: colunas, ArrowUp: -colunas, Home: -i, End: botoes.length - 1 - i }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    botoes[Math.min(botoes.length - 1, Math.max(0, i + delta))]?.focus();
  };

  return (
    <div className="grade-sobreposta" role="dialog" aria-modal="true" aria-label={modos.grade}>
      <div className="flex items-center justify-between gap-4 px-8 pb-4 pt-6">
        <h2 className="font-titulo text-[32px] font-bold text-texto">{modos.grade}</h2>
        <button type="button" className="botao-shell botao-shell--icone" onClick={onFechar} aria-label={atalhos.fechar}>
          <Icone icone={X} tamanho={22} />
        </button>
      </div>
      <ol ref={lista} className="grade-miniaturas px-8 pb-10" onKeyDown={mover}>
        {slides.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className={`miniatura-botao ${i === atual ? "miniatura-botao--atual" : ""}`}
              onClick={() => onIr(i)}
              aria-current={i === atual ? "true" : undefined}
              aria-label={modos.irParaSlide(s.id, s.secao.titulo)}
            >
              <Miniatura largura={300}>{s.render()}</Miniatura>
              <span className="mt-2 flex items-baseline gap-2 text-left text-[15px]">
                <span className="font-mono text-verde">{s.id}</span>
                <span className="truncate text-texto-2">{s.secao.nome}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
