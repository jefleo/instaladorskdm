import { createContext, useContext } from "react";

/**
 * Onde a seção está sendo desenhada:
 *  - palco: modo apresentação, 1920×1080 escalado;
 *  - miniatura: grade e janela de notas (palco reduzido, inerte);
 *  - impressao: ?print=1, 1920×1080 por página, modo claro;
 *  - leitura: rolagem contínua, sem escala, layout responsivo.
 */
export type Exibicao = "palco" | "miniatura" | "impressao" | "leitura";

export const ContextoExibicao = createContext<Exibicao>("palco");

export const useExibicao = () => useContext(ContextoExibicao);

/** Palco de tamanho fixo (apresentação, miniatura e impressão). */
export const ehPalco = (e: Exibicao) => e !== "leitura";
