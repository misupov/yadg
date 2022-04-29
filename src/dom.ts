export function div(props?: { style?: Partial<CSSStyleDeclaration>; className?: string; children?: (HTMLElement | Text)[] }) {
  const result = document.createElement("div");
  if (props) {
    const { style, className, children } = props;
    if (style) {
      applyStyle(result, style);
    }
    if (className) {
      result.className = className;
    }
    children?.forEach((child) => result.appendChild(child));
  }
  return result;
}

export function text(data: string) {
  return document.createTextNode(data);
}

export function applyStyle(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, style);
}

export function formatRule(style: Partial<CSSStyleDeclaration>) {
  return Object.entries(style)
    .filter((r) => typeof r[1] === "string")
    .map((r) => `${kebabCase(r[0])}: ${r[1]}`)
    .join(";");
}

function kebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}
