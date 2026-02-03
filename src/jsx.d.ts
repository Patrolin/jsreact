import * as CSS from "csstype";
export type CSSProperties = CSS.Properties<string | number>;

// IntrinsicProps
type JsxKey = string | number | boolean;
export type IntrinsicProps = {
  key?: JsxKey;
  className?: string[] | string;
  cssVars?: Record<string, string | number>;
  style?: CSSProperties;
  onClick?: (event: MouseEvent) => void;
}
type TextProps = {value: any};
type JSXProps = IntrinsicProps & {children?: ReactNode};
type DOMProps = JSXProps & {[key: string]: any};

// ReactNode
export type FunctionComponent<P = {}> = (props: P & JSXProps) => ValueOrVNode;
type ElementType = FunctionComponent<any> | string | undefined;
export interface VNode {
  type: ElementType;
  key: string | number | boolean | undefined;
  props: DOMProps;
  source?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
}
export type ValueOrVNode =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
export type ReactNode =
  | ValueOrVNode
  | ReactNode[]

// exports
declare global {
  namespace JSX {
    type Element = ValueOrVNode;
    interface IntrinsicElements {
      // TODO: give types for input, label, img, link
      [tagName: string]: DOMProps;
    }
    interface ElementChildrenAttribute {children: {}}
  }
}
