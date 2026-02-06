import { REACT_ELEMENT_TYPE, type VNode } from "./jsreact";
export {Fragment} from "./jsreact";

export function jsxDEV(
  type: VNode["type"],
  props: VNode["props"] | null,
  key: VNode["key"],
  _isStaticChildren: boolean,
  source: VNode["source"],
  _self: any,
): VNode {
  return { $$typeof: REACT_ELEMENT_TYPE, type, key, props: {...props, children: props?.children ?? null}, source };
}
