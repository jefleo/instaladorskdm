import { useEffect, useState } from "react";
import { config } from "./data/vapti";
import { PaginaEstilo } from "./estilo/PaginaEstilo";
import { PaginaViz } from "./estilo/PaginaViz";
import { PaginaPrototipo } from "./estilo/PaginaPrototipo";

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
  return <main style={{ padding: 48 }}>{config.marca}</main>;
}
