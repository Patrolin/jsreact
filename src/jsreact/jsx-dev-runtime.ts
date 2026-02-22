import { REACT_ELEMENT_TYPE, type VirtNode } from "./jsreact";
export { Fragment } from "./jsreact";

export function jsxDEV(
  type: VirtNode["type"],
  props: VirtNode["props"] | null,
  key: VirtNode["key"],
  _isStaticChildren: boolean,
  source: VirtNode["source"],
  _self: any,
): VirtNode {
  return { $$typeof: REACT_ELEMENT_TYPE, type, key, props: {...props, children: props?.children}, source };
}
