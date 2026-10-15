/** Preferências do leitor (só conveniência; tudo funciona sem localStorage). */
export type Modo = "apresentacao" | "leitura";
const CHAVE = "vapti:modo";

export function lerModo(): Modo {
  try {
    const v = window.localStorage.getItem(CHAVE);
    if (v === "leitura" || v === "apresentacao") return v;
  } catch {
    /* armazenamento bloqueado */
  }
  // Sem escolha salva: apresentação; em tela de celular, leitura.
  return typeof window !== "undefined" && window.innerWidth < 720 ? "leitura" : "apresentacao";
}

export function salvarModo(m: Modo) {
  try {
    window.localStorage.setItem(CHAVE, m);
  } catch {
    /* armazenamento bloqueado */
  }
}
