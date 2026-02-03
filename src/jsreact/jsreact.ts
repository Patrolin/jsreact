import * as CSS from "csstype";
export type CSSProperties = CSS.Properties<string | number>;

// IntrinsicProps
type JsxKey = string | number | boolean | null | undefined;
export type IntrinsicProps = {
  key?: JsxKey;
  className?: string[] | string;
  cssVars?: Record<string, string | number>;
  style?: CSSProperties;
  onClick?: (event: MouseEvent) => void;
}
type TextProps = string | number | boolean | null | undefined;
type JSXProps = {children?: ReactNode};
type DOMProps = IntrinsicProps & JSXProps & {[key: string]: any};

export const Fragment = undefined;
export type ForwardRefVNode = {$$typeof: Symbol; propTypes: DOMProps; render: (props: DOMProps, ref: object) => VNode};
export function forwardRef(render: any) {
  return { $$typeof: Symbol.for("react.forward_ref"), render };
}
export function createElement(type: VNode["type"], props: VNode["props"], ...children: ReactNode[]): VNode {
  const { key, ...rest } = props;
  return { type, key, props: {...rest, children} };
}
export function isValidElement(value: any): value is VNode {
  return "type" in value && "props" in value;
}
export function cloneElement(vnode: ValueOrVNode): ValueOrVNode {
  return vnode;
}
export const Children = {
  map(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any) {
    if (children == null) return null; // null or undefined
    if (!Array.isArray(children)) {
      return [fn.call(thisArg, children, 0)];
    }
    return children.map(fn, thisArg);
  },
}

// ReactNode
export type FunctionComponent<P = {}> = (props: P & JSXProps) => ValueOrVNode;
type ElementType = FunctionComponent<any> | string | undefined | ForwardRefVNode;
export interface VNode {
  type: ElementType;
  key: JsxKey;
  props: DOMProps;
  children?: ReactNode | null;
  source?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
}
export type ValueOrVNode =
  | VNode
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined
export type ReactNode =
  | ValueOrVNode
  | ReactNode[]

// export types
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
export type FC<T = {}> = FunctionComponent<T>;
export const SYMBOL_FORWARD_REF = typeof Symbol === "function" && Symbol.for ? Symbol.for("react.forward_ref") : 0xead0;

// implementation
type Component = {
  /** user input */
  node: ValueOrVNode;
  /** HTML element derived from user input */
  element: Element | undefined;
  /** implementation detail */
  prevHookIndex: number;
  /** implementation detail */
  hookIndex: number;
  /** hook state */
  hooks: any[];
  /** implementation detail */
  ref: object;
  /** the key that the component was rendered as */
  key: string;
  /** implementation detail */
  childIndex: number;
  /** map<key, ChildState> - TODO: maybe use Map for performance? */
  children: Record<string, Component>;
  /** implementation detail */
  prevEventHandlers: Record<string, ((event: any) => void) | undefined>;
  /** implementation detail */
  root: Component;
  /* u1 willRerenderNextFrame, u1 gc */
  flags: number;
};
// apply intrinsic props
function camelCaseToKebabCase(camelCase: string) {
  // TODO: optimize this function
  const slices: string[] = [];
  let i = 0;
  let j = 0;
  for (; j < camelCase.length; j++) {
    const char = camelCase[j];
    if (char >= 'A' && char <= 'Z') {
      slices.push(camelCase.slice(i, j));
      i = j;
    }
  }
  slices.push(camelCase.slice(i, camelCase.length));
  return slices.join("-").toLowerCase();
}
type EventMapping = {name: string, type: string};
// TODO: more events
const EVENT_MAP: EventMapping[] = [
  {name: "onClick", type: "click"},
]
function applyJsxProps(component: Component, props: DOMProps) {
  const {element, prevEventHandlers} = component;
  if (element == null) return;
  if (element instanceof Text) {
    const value = props as unknown as TextProps;
    element.textContent = value != null ? String(value) : "";
    return;
  }
  // events
  for (let {name, type} of EVENT_MAP) {
    const prevEventHandler = prevEventHandlers[type];
    const eventHandler = props[name];
    prevEventHandlers[type] = eventHandler;
    if (prevEventHandler != null) element.removeEventListener(type, prevEventHandler);
    if (eventHandler != null) element.addEventListener(type, eventHandler);
  }
  // style
  const {style, cssVars, className, children, ...attribute} = props
  if (style != null) {
    for (let [k, v] of Object.entries(style)) {
      k = camelCaseToKebabCase(k);
      v = typeof v == "number" ? `${v}px` : v ?? null;
      (element as HTMLElement).style.setProperty(k, v);
    }
  }
  // cssVars
  if (cssVars) {
    for (let [k, v] of Object.entries(cssVars)) {
      v = typeof v == "number" ? `${v}px` : v ?? null;
      (element as HTMLElement).style.setProperty(`--${k}`, v);
    }
  }
  // className
  if (className) element.className = Array.isArray(className) ? className.join(" ") : className;
  // attribute
  for (let [key, value] of Object.entries(attribute)) {
    if (value != null) element.setAttribute(key, String(value ?? ""));
    else element.removeAttribute(key);
  }
}

// render
function isVNode(leaf: ValueOrVNode): leaf is VNode {
  return leaf !== null && typeof leaf === "object";
}
function renderJsxChildren(parent: Component, child: ReactNode, childOrder: Component[]) {
  // recurse
  if (Array.isArray(child)) {
    for (let c of child) renderJsxChildren(parent, c, childOrder);
    return;
  }
  // get component state
  let key = isVNode(child) ? child.key : null;
  if (key == null) {
    key = `_${parent.childIndex++}`;
  } else {
    key = String(key);
  }
  let component = parent.children[key];
  if (component == null) {
    component = {
      node: child,
      element: undefined,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
      ref: {},
      key,
      childIndex: 0,
      children: {},
      prevEventHandlers: {},
      root: parent.root,
      flags: 1 - parent.flags,
    };
    parent.children[key] = component;
  }
  component.childIndex = 0;
  component.prevHookIndex = component.hookIndex;
  component.hookIndex = 0;
  component.flags = parent.flags;
  // run user code
  $component = component;
  component.node = child;
  let leaf = child;
  while (isVNode(leaf)) {
    if (typeof leaf.type === "function") leaf = leaf.type(leaf.props);
    else if ((leaf.type as ForwardRefVNode | undefined)?.$$typeof === SYMBOL_FORWARD_REF) {
      const forwardRefVNode = leaf.type as ForwardRefVNode;
      leaf = forwardRefVNode.render(leaf.props, component.ref);
    } else break;
  }
  if (!isVNode(leaf)) {
    leaf = {type: "Text", key: undefined, props: leaf as unknown as DOMProps};
  }
  const {prevHookIndex, hookIndex} = component;
  if (prevHookIndex !== 0 && hookIndex !== prevHookIndex) {
    throw new RangeError(`Components must have a constant number of hooks, got: ${hookIndex}, expected: ${prevHookIndex}`);
  }
  // create element
  let element = component.element;
  if (leaf.type) {
    if (element != null && (element?.tagName?.toLowerCase() ?? "Text") !== leaf.type) {
      let node = component.node;
      let source = "";
      if (isVNode(node)) {
        node = {...node};
        source = node.source != null ? `${node.source?.fileName}:${node.source?.lineNumber}` : "";
        delete node.key;
        delete node.source;
      }
      const error = (source ? `${source}: ` : "") + "Dynamic elements must have the key prop";
      if (source) {
        // NOTE: only runs in dev build
        document.body.innerHTML = `<h3 className="jsreact-error" style="font-family: Consolas, sans-serif">${error}.</h3>`;
      }
      console.error(`${error}:`, {before: component.element, next: node});
    };
    if (element == null) {
      if (leaf.type === "Text") {
        element = new Text(leaf.props.value) as unknown as Element;
      } else {
        element = document.createElement(leaf.type as string);
      }
      component.element = element;
    }
    applyJsxProps(component, leaf.props);
  }
  if (element != null) {
    childOrder.push(component);
    childOrder = [];
  }
  // render children
  const children = leaf.props.children;
  if (children != null) renderChildren(component, leaf.props.children, childOrder);
}
function renderChildren(parent: Component, children: ReactNode, childOrder: Component[]) {
  renderJsxChildren(parent, children, childOrder);
  // remove unused children
  for (let c of Object.values(parent.children)) {
    if (c.flags !== parent.flags) {
      c.element?.remove();
      c.root = null as any; // delete cyclic reference to help the garbage collector
      delete parent.children[c.key]; // delete old state
    }
  }
  // reorder used children
  const parentElement = parent.element;
  if (parentElement != null) {
    let prevElement = null as Element|null;
    for (let c of childOrder) {
      const childElement = c.element!;
      if (prevElement != null) {
        if (prevElement.nextSibling !== childElement) prevElement.after(childElement);
      } else {
        if (childElement.parentElement !== parentElement) parentElement.prepend(childElement)
      }
      prevElement = childElement;
    }
  }
}
function _rerender(component: Component) {
  const rootComponent = component.root;
  if ((rootComponent.flags & 2) === 0) {
    const nextGcFlag = 1 - (component.flags & 1);
    rootComponent.flags = nextGcFlag | 2;
    requestAnimationFrame(() => {
      rootComponent.flags = nextGcFlag;
      rootComponent.childIndex = 0;
      renderChildren(rootComponent, rootComponent.node, []);
    });
  }
}
export function renderRoot(vnode: ValueOrVNode, parent: HTMLElement) {
  const onLoad = () => {
    const rootComponent: Component = {
      node: vnode,
      element: parent,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
      ref: {},
      key: "",
      childIndex: 0,
      children: {},
      prevEventHandlers: {},
      root: undefined as any,
      flags: 0,
    };
    rootComponent.root = rootComponent;
    _rerender(rootComponent);
  }
  window.addEventListener("DOMContentLoaded", onLoad);
}

// hooks
/** the current component */
let $component = {} as Component;
export const useRerender = () => () => _rerender($component);
export function useHook<T extends object>(defaultState: T = {} as T): T {
  const index = $component.hookIndex++;
  if (index >= $component.hooks.length) {
    if ($component.prevHookIndex === 0) $component.hooks.push(defaultState);
    else throw new RangeError(`Components must have a constant number of hooks, got: ${$component.hookIndex}, expected: ${$component.prevHookIndex}`);
  }
  return $component.hooks[index];
}
type MutableRef<T> = {current: T};
export function useRef<T>(defaultState: T): MutableRef<T> {
  return useHook({current: defaultState});
}
export function useState<T>(defaultState: T): [T, (newValue: T) => void] {
  const ref = useRef(defaultState);
  const setState = (newState: T) => {
    ref.current = newState;
    _rerender($component);
  }
  return [ref.current, setState];
}
function dependenciesDiffer(prevDeps: any[] | null, deps: any[] | null): boolean {
  // NOTE: `Object.is()` for correct NaN handling
  return prevDeps == null || deps == null || prevDeps.length !== deps.length || prevDeps.some((v, i) => !Object.is(v, deps[i]));
}
/** NOTE: prefer `useRef()` for better performance */
export function useEffect(callback: () => void, dependencies: any[] | null = null): void {
  const ref = useHook({prevDeps: null as any[] | null});
  if (dependenciesDiffer(ref.prevDeps, dependencies)) {
    ref.prevDeps = [...(dependencies ?? [])];
    setTimeout(callback, 0);
  }
}
export function useMemo<T>(callback: () => T, dependencies: any[] | null = null): T {
  const ref = useHook({current: null as T, prevDeps: null as any[] | null});
  if (dependenciesDiffer(ref.prevDeps, dependencies)) {
    ref.prevDeps = [...(dependencies ?? [])];
    ref.current = callback();
  }
  return ref.current;
}
export function useCallback<T extends Function>(callback: T, _dependencies: any[] | null = null) {
  const ref = useHook({current: (() => {}) as unknown as T})
  ref.current = callback; // NOTE: you already created the lambda, might as well use it...
  return ref.current;
}
export function useId(): string {
  const ref = useHook({ current: "" });
  if (ref.current === "") ref.current = String(Math.random());
  return ref.current;
}
// TODO: more hooks?
//export function useContext() {}
//function throwNotImplemented(fnName: string): never {
//  throw new Error(`React.${fnName} is not implemented in jsreactaa`);
//}
//export const createContext = () => throwNotImplemented("createContext");
//export const useReducer = () => throwNotImplemented("useReducer");
