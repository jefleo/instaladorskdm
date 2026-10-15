import { useEffect, useRef } from "react";
import { FileText, Presentation, Printer } from "lucide-react";
import { Icone, Wordmark } from "../components/base";
import { aviso, config } from "../data/vapti";
import { modos } from "../content/ui";
import { ContextoExibicao, slides } from "../sections";

/** Modo leitura: todas as telas em rolagem contínua, sem escala, layout responsivo. */
export function Leitura({ indice, onApresentar, onVisivel }: { indice: number; onApresentar: () => void; onVisivel: (i: number) => void }) {
  const principal = useRef<HTMLElement>(null);
  const visivelRef = useRef(onVisivel);
  visivelRef.current = onVisivel;

  // Abre na tela da rota.
  useEffect(() => {
    if (indice > 0) document.getElementById(`s-${slides[indice].id}`)?.scrollIntoView();
  }, []);

  // Acompanha a tela visível para a rota (ao voltar à apresentação, continua dali).
  useEffect(() => {
    const raiz = principal.current;
    if (!raiz) return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            const i = slides.findIndex((s) => `s-${s.id}` === e.target.id);
            if (i >= 0) visivelRef.current(i);
          }
        }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    raiz.querySelectorAll("section[id^='s-']").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="leitura">
      <a href="#conteudo" className="pular">
        {modos.pularConteudo}
      </a>
      <header className="leitura-topo">
        <Wordmark tamanho={30} />
        <nav className="flex flex-wrap items-center justify-end gap-2" aria-label={modos.leitura}>
          <a className="botao-shell" href="?print=1" target="_blank" rel="noopener">
            <Icone icone={Printer} tamanho={18} />
            <span className="leitura-topo__texto">{modos.imprimir}</span>
          </a>
          <a className="botao-shell" href="?resumo=1" target="_blank" rel="noopener">
            <Icone icone={FileText} tamanho={18} />
            <span className="leitura-topo__texto">{modos.resumo}</span>
          </a>
          <button type="button" className="botao-shell botao-shell--primario" onClick={onApresentar}>
            <Icone icone={Presentation} tamanho={18} />
            <span>{modos.apresentar}</span>
          </button>
        </nav>
      </header>
      <main id="conteudo" ref={principal} tabIndex={-1}>
        <ContextoExibicao.Provider value="leitura">
          {slides.map((s) => (
            <section key={s.id} id={`s-${s.id}`} className="leitura-secao" aria-label={s.parte === 0 ? s.secao.nome : undefined}>
              {s.render()}
            </section>
          ))}
        </ContextoExibicao.Provider>
      </main>
      <footer className="leitura-rodape">
        <Wordmark tamanho={28} />
        <p className="leitura-rodape__aviso">{aviso}</p>
        <p className="font-mono text-[13px] text-texto-3">{config.versao}</p>
      </footer>
    </div>
  );
}
