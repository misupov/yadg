import { div, text } from "./dom";

export type Row = {
  index: number;
  top: number;
  gui: HTMLElement;
  update(x: number): void;
  setTop(top: number): void;
};

export function row(x: number): Row {
  let index = x;
  let top = 0;
  let xx: HTMLDivElement;
  const children: HTMLDivElement[] = [];
  children.push(
    xx = div({ className: "cell", children: [text(x.toString())] }),
  );
  for (let i = 0; i <= 200; i++) {
    children.push(div({ className: "cell", children: [text(i.toString())] }));
  }
  const gui = div({ className: "row", children });
  return {
    index,
    top,
    update: (newIndex: number) => {
      xx.textContent = newIndex.toString();
    },
    setTop: (newTop: number) => {
      top = newTop;
      gui.style.top = `${newTop}px`;
    },
    gui,
  };
}
