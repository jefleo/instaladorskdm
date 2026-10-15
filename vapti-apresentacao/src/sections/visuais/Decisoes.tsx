import { Calculator, Handshake, Landmark } from "lucide-react";
import { Card } from "../../components/base";
import { decisoes } from "../../data/vapti";
import type { Secao } from "../../content/tipos";
import { Item } from "../Slide";

/** V23 — as cinco decisões pedidas hoje. */
export function CincoDecisoes({ rotulo }: { rotulo?: string }) {
  return (
    <ol className="border-b border-borda" aria-label={rotulo}>
      {decisoes.lista.map((d, i) => (
        <li key={d.titulo} className="decisao border-t border-borda py-[0.62em]">
          <span className="font-mono font-bold text-verde" style={{ fontSize: "var(--fs-kpi-p)", lineHeight: 0.9, letterSpacing: "-0.04em" }}>
            {i + 1}
          </span>
          <h3 className="font-titulo font-bold text-texto" style={{ fontSize: "var(--fs-subtitulo)", lineHeight: 1.12, letterSpacing: "-0.02em" }}>
            {d.titulo}
          </h3>
          <p className="text-corpo text-texto-2" style={{ lineHeight: 1.38 }}>
            {d.texto}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Perguntas ao advogado, ao contador e pendências com a parceira. */
export function PerguntasEspecialistas({ secao }: { secao: Secao }) {
  const [bAdv, bCont, bParc] = secao.blocos;
  const colunas = [
    { titulo: bAdv?.titulo ?? "", icone: Landmark, itens: decisoes.advogado },
    { titulo: bCont?.titulo ?? "", icone: Calculator, itens: decisoes.contador },
    { titulo: bParc?.titulo ?? "", icone: Handshake, itens: decisoes.pendenciasProduto },
  ];
  return (
    <div className="grade-3" style={{ ["--vao" as string]: "var(--esp-6)" }}>
      {colunas.map((c) => (
        <Card key={c.titulo} titulo={c.titulo} icone={c.icone} como="section" className="h-full">
          <ul className="space-y-[0.5em]" style={{ lineHeight: 1.38 }}>
            {c.itens.map((t) => (
              <Item key={t} tom="azul">
                {t}
              </Item>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
