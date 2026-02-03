import * as CSS from "csstype";
export interface CSSProperties extends CSS.Properties<string | number> {}

type JsxKey = string | number | boolean;
export type IntrinsicProps = {
  key?: JsxKey;
  attribute?: Record<string, any>;
  className?: string[] | string;
  cssVars?: Record<string, any>;
  style?: CSSProperties;
  onClick?: (event: MouseEvent) => void;
}

export interface VNode {
  type: ElementType;
  key: string | number | boolean | undefined;
  props: Props;
  source?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null
}
type ElementType = FunctionComponent<any> | string | undefined;
export interface FunctionComponent<P = {}> {
  (props: P & IntrinsicProps & { children?: ReactNode }): LeafNode;
}
type Props = IntrinsicProps & {
  children?: ReactNode;
  [key: string]: any;
}
export type LeafNode =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
export type ReactNode =
  | LeafNode
  | ReactNode[]

type JSXProps = IntrinsicProps & {children?: ReactNode};

declare global {
  namespace JSX {
    type Element = LeafNode;
    interface IntrinsicElements {
      // TODO: maybe give types for input, label, img, link
      [tagName: string]: JSXProps;
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}
