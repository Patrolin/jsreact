import { renderRoot, ValueOrVNode } from "./jsreact";

export function render(jsx: ValueOrVNode, element: HTMLElement) {
  renderRoot(jsx, element);
}
