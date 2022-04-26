import { GridOptions } from "./types";
import { YadgGrid } from "./yadgGrid";

export * from './types';

export class Yadg {
  private root: HTMLElement;

  constructor(root: HTMLElement, options: GridOptions) {
    this.root = root;
    const yg = document.createElement("yadg-grid") as YadgGrid;
    yg.setOptions(options);
    this.root.innerHTML = "";
    this.root.appendChild(yg);
  }
}

if (!window.customElements.get("yadg-grid")) {
  window.customElements.define("yadg-grid", YadgGrid);
}
