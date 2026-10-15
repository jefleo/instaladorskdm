import { useCallback, useEffect, useState } from "react";
import { indicePorId, slides } from "../sections";

/** Lê "#/07b" → índice da tela (0 se inválido). */
export function indiceDoHash(hash = window.location.hash): number {
  const id = hash.replace(/^#\/?/, "");
  const i = indicePorId(id);
  return i >= 0 ? i : 0;
}

/** Tela atual pela rota por hash. Atualiza o hash sem empilhar histórico. */
export function useRota() {
  const [indice, setIndice] = useState(() => indiceDoHash());
  useEffect(() => {
    const aoMudar = () => setIndice(indiceDoHash());
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);
  const irPara = useCallback((i: number) => {
    const alvo = Math.min(slides.length - 1, Math.max(0, i));
    const hash = `#/${slides[alvo].id}`;
    if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
    setIndice(alvo);
  }, []);
  return [indice, irPara] as const;
}
