import { div, formatRule, text } from "./dom";
import { GridOptions } from "./types";

export class YadgGrid extends HTMLElement {
  sr: ShadowRoot;
  styleSheet?: HTMLStyleElement;
  header: HTMLDivElement;
  viewport: HTMLDivElement;
  gridOptions?: GridOptions;
  scrollPane: HTMLDivElement;

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: "closed" });

    this.sr.appendChild(
      div({
        className: "grid",
        children: [
          this.header = div({ className: "header" }),
          this.viewport = div({
            className: "viewport",
            children: [this.scrollPane = div({ className: "scrollPane", children: [text("1234567")] })],
          }),
        ],
      }),
    );
    this.header.appendChild(text("567"));
  }

  setOptions(options: GridOptions) {
    this.gridOptions = options;
  }

  connectedCallback() {
    this.updateStyles();
  }

  private updateStyles() {
    const theme = this.gridOptions?.theme;
    if (theme) {
      if (this.styleSheet) {
        this.sr.removeChild(this.styleSheet);
      }
      this.styleSheet = document.createElement("style");
      this.sr.appendChild(this.styleSheet);
      const defaultGridStyle: Partial<CSSStyleDeclaration> = {
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
      };
      const defaultHeaderStyle: Partial<CSSStyleDeclaration> = {};
      const defaultViewportStyle: Partial<CSSStyleDeclaration> = {
        flexGrow: "1",
        overflow: "overlay",
      };
      const defaultScrollPaneStyle: Partial<CSSStyleDeclaration> = {
        flexGrow: "1",
        width: "500px",
        height: "50000px",
      };
      const gridStyle = { ...defaultGridStyle, ...theme };
      this.styleSheet.sheet!.insertRule(`.grid {${formatRule(gridStyle)}}`);
      const { header, viewport, scrollPane } = theme;
      const headerStyle = { ...defaultHeaderStyle, ...header };
      this.styleSheet.sheet!.insertRule(`.header {${formatRule(headerStyle)}}`);
      const viewportStyle = { ...defaultViewportStyle, ...viewport };
      this.styleSheet.sheet!.insertRule(
        `.viewport {${formatRule(viewportStyle)}}`,
      );
      const scrollPaneStyle = { ...defaultScrollPaneStyle, ...scrollPane };
      this.styleSheet.sheet!.insertRule(
        `.scrollPane {${formatRule(scrollPaneStyle)}}`,
      );
    }
  }
}
