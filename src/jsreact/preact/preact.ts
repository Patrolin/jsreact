import { createRoot, JsReactNode } from "../jsreact";
export type * from "../jsreact";

export function render(node: JsReactNode, parent: HTMLElement) {
  createRoot(parent).render(node);
}
export type VNode<P = {}> = React.ReactElement<P>;