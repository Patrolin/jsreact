import { REACT_ELEMENT_TYPE, type VirtNode } from "./jsreact";
export { Fragment } from "./jsreact";

export function jsx(type: VirtNode["type"], props: VirtNode["props"] | null, key: VirtNode["key"]): VirtNode {
  return { $$typeof: REACT_ELEMENT_TYPE, type, key, props: {...props, children: props?.children} };
}
export const jsxs = jsx;
