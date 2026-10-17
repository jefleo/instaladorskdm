/** Classifica o alvo de uma tecla para não roubar teclas de campos e controles. */
export type Alvo = "texto" | "controle" | "botao" | null;

const PAPEIS_CONTROLE = new Set(["slider", "spinbutton", "radio", "tab", "option", "menuitem", "listbox", "combobox", "textbox", "radiogroup", "tablist"]);
const PAPEIS_BOTAO = new Set(["button", "link", "switch", "checkbox"]);

export function classificarAlvo(t: EventTarget | null): Alvo {
  if (!(t instanceof HTMLElement)) return null;
  if (t.isContentEditable) return "texto";
  const tag = t.tagName;
  if (tag === "TEXTAREA") return "texto";
  if (tag === "SELECT") return "controle";
  if (tag === "INPUT") {
    const tipo = (t as HTMLInputElement).type;
    if (tipo === "range" || tipo === "radio" || tipo === "number") return "controle";
    if (["checkbox", "button", "submit", "reset"].includes(tipo)) return "botao";
    return "texto";
  }
  const papel = t.getAttribute("role");
  if (papel && PAPEIS_CONTROLE.has(papel)) return "controle";
  if (tag === "BUTTON" || tag === "A" || tag === "SUMMARY" || (papel && PAPEIS_BOTAO.has(papel))) return "botao";
  return null;
}
