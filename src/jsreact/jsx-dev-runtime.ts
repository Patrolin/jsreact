import { VNode } from "./jsx";

export function jsxDEV(
  type: VNode["type"],
  props: VNode["props"] | null,
  key: VNode["key"],
  _isStaticChildren: boolean,
  source: VNode["source"],
  _self: any,
): VNode {
  console.log()
  return { type, key, props: props ?? {}, source };
}
export const Fragment = undefined;
