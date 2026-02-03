import type { VNode } from "./jsx.d.ts";

export function jsxDEV(
  type: VNode["type"],
  props: VNode["props"] | null,
  key: VNode["key"],
  _isStaticChildren: boolean,
  source: VNode["source"],
  _self: any,
): VNode {
  return { type, key, props: props ?? {}, source };
}
export const Fragment = undefined;
