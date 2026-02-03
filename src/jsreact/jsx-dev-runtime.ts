import { VNode } from "./jsreact";

export function jsxDEV(
  type: VNode["type"],
  props: VNode["props"] | null,
  key: VNode["key"],
  _isStaticChildren: boolean,
  source: VNode["source"],
  _self: any,
): VNode {
  return { type, key, props: {...props, children: props?.children ?? null}, source };
}
