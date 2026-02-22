import { createRoot, ValueOrVNode } from "../jsreact";
export type * from "../jsreact";

export function render(valueOrVnode: ValueOrVNode, parent: HTMLElement) {
  createRoot(parent).render(valueOrVnode);
}
export type VNode<P = {}> = React.ReactElement<P>;