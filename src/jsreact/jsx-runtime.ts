import type { VNode } from "./jsreact";
export {Fragment} from "./jsreact";

export function jsx(type: VNode["type"], props: VNode["props"] | null, key: VNode["key"]): VNode {
  return { type, key, props: {...props, children: props?.children ?? null} };
}
export const jsxs = jsx;
