import { VNode } from "./jsx";

export function jsx(type: VNode["type"], props: VNode["props"] | null, key: VNode["key"]): VNode {
  return { type, key, props: props ?? {} };
}
export const jsxs = jsx;
export const Fragment = undefined;
