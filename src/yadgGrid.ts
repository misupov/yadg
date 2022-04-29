import { div, formatRule, text } from "./dom";
import { Row, row } from "./row";
import { GridOptions } from "./types";

export class YadgGrid extends HTMLElement {
  sr: ShadowRoot;
  styleSheet?: HTMLStyleElement;
  header: HTMLDivElement;
  viewport: HTMLDivElement;
  gridOptions?: GridOptions;
  scrollPane: HTMLDivElement;
  rows: Row[] = [];
  rowHeight: number = 0;
  invisibleRows: Row[] = [];
  map: any;
  prevViewport?: { top: number; bottom: number };

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: "closed" });

    this.sr.appendChild(
      div({
        className: "grid",
        children: [
          (this.header = div({ className: "header" })),
          (this.viewport = div({
            className: "viewport",
            children: [(this.scrollPane = div({ className: "scrollPane" }))],
          })),
        ],
      })
    );
    this.header.appendChild(text("567"));
    for (let i = 0; i < 60; i++) {
      const r = row(i);
      r.setTop(-10000);
      this.rows.push(r);
      this.scrollPane.appendChild(r.gui);
      this.invisibleRows.push(r);
    }
    this.viewport.onscroll = (e) => {
      // requestAnimationFrame(() => {
      this.redraw();
      // })
    };
  }

  setOptions(options: GridOptions) {
    this.gridOptions = options;
  }

  connectedCallback() {
    this.updateStyles();

    this.rowHeight = this.rows[0].gui.getBoundingClientRect().height;
    this.redraw();
  }

  private redraw() {
    const rowVisible = Math.ceil(this.viewport.clientHeight / this.rowHeight);
    const first = Math.trunc(this.viewport.scrollTop / this.rowHeight);
    const last = first + rowVisible;
    for (let i = 0; i < rowVisible; i++) {
      const r1 = this.map.get(first + i);
      const r = this.invisibleRows.pop()!;
      r.update(i + first);
      r.setTop(i * this.rowHeight + Math.trunc(this.viewport.scrollTop / this.rowHeight) * this.rowHeight);
    }
    this.prevViewport = {
      top: this.viewport.scrollTop,
      bottom: this.viewport.scrollTop + this.scrollPane.clientHeight,
    };
    this.scrollPane.style.height = 500000 + "px";
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
        height: "500px",
        position: "relative",
      };
      const gridStyle = { ...defaultGridStyle, ...theme };
      this.styleSheet.sheet!.insertRule(`.grid {${formatRule(gridStyle)}}`);
      const { header, viewport, scrollPane } = theme;
      const headerStyle = { ...defaultHeaderStyle, ...header };
      this.styleSheet.sheet!.insertRule(`.header {${formatRule(headerStyle)}}`);
      const viewportStyle = { ...defaultViewportStyle, ...viewport };
      this.styleSheet.sheet!.insertRule(`.viewport {${formatRule(viewportStyle)}}`);
      const scrollPaneStyle = { ...defaultScrollPaneStyle, ...scrollPane };
      this.styleSheet.sheet!.insertRule(`.scrollPane {${formatRule(scrollPaneStyle)}}`);
      this.styleSheet.sheet!.insertRule(`.row {display: flex; position: absolute;will-change:top}`);
      this.styleSheet.sheet!.insertRule(`.cell {width: 50px;flex-shrink:0}`);
    }
  }
}
