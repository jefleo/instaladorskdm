import { ContextoExibicao, slides } from "../sections";

const CSS_PAGINA = `
@page { size: 1920px 1080px; margin: 0; }
html, body { margin: 0; padding: 0; background: var(--cor-tinta); -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.pagina { position: relative; width: 1920px; height: 1080px; overflow: hidden; break-after: page; page-break-after: always; container-type: inline-size; container-name: secao; }
.pagina:last-child { break-after: auto; page-break-after: auto; }
`;

/** ?print=1 — todas as telas, uma por página de 1920×1080, modo claro, sem animação nem controles. */
export function Impressao() {
  return (
    <ContextoExibicao.Provider value="impressao">
      <style>{CSS_PAGINA}</style>
      <main>
        {slides.map((s) => (
          <div key={s.id} className="pagina" data-pagina={s.id}>
            {s.render()}
          </div>
        ))}
      </main>
    </ContextoExibicao.Provider>
  );
}
