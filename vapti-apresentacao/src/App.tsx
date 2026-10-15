import { useEffect, useState } from "react";
import { PaginaEstilo } from "./estilo/PaginaEstilo";
import { PaginaViz } from "./estilo/PaginaViz";
import { PaginaPrototipo } from "./estilo/PaginaPrototipo";
import { isNotas, isPrint, isResumo } from "./lib/modo";
import { Impressao } from "./shell/Impressao";
import { JanelaNotas } from "./shell/JanelaNotas";
import { Resumo } from "./shell/Resumo";
import { Site } from "./shell/Site";
import "./shell/shell.css";

// Impressão e resumo saem sempre em modo claro.
if (isPrint || isResumo) document.documentElement.dataset.modo = "claro";

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const aoMudar = () => setHash(window.location.hash);
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  if (hash === "#/estilo") return <PaginaEstilo />;
  if (hash === "#/viz") return <PaginaViz />;
  if (hash === "#/prototipo") return <PaginaPrototipo />;
  if (isResumo) return <Resumo />;
  if (isPrint) return <Impressao />;
  if (isNotas) return <JanelaNotas />;
  return <Site />;
}
