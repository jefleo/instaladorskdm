import { useState } from "react";
import { Apresentacao } from "./Apresentacao";
import { Leitura } from "./Leitura";
import { lerModo, salvarModo, type Modo } from "./preferencias";
import { indiceDoHash, useRota } from "./rota";
import { slides } from "../sections";

/** Site: modo apresentação (padrão) ou modo leitura; escolha lembrada no navegador. */
export function Site() {
  const [modo, setModo] = useState<Modo>(lerModo);
  const [indice, irPara] = useRota();
  const trocar = (m: Modo) => {
    salvarModo(m);
    if (m === "apresentacao") irPara(indiceDoHash());
    setModo(m);
    window.scrollTo(0, 0);
  };
  if (modo === "leitura") return <Leitura indice={indice} onApresentar={() => trocar("apresentacao")} onVisivel={(i) => window.history.replaceState(null, "", `#/${slides[i].id}`)} />;
  return <Apresentacao indice={indice} irPara={irPara} onLeitura={() => trocar("leitura")} />;
}
