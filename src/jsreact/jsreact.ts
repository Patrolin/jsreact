import * as CSS from "csstype";
export type CSSProperties = CSS.Properties<string | number>;

// IntrinsicProps
type JsxKey = Value;
type JSXProps = {children?: ReactNode, key?: JsxKey};
export type IntrinsicProps = JSXProps & {
  ref?: MutableRef<any> | ((value: any) => void);
  className?: string[] | string;
  cssVars?: Record<string, string | number>;
  style?: CSSProperties;
  onClick?: (event: MouseEvent) => void;
}
type DOMProps = IntrinsicProps & {[k: string]: any};


// ReactNode
export type FunctionComponent<P = {}> = (props: P extends {children: any} ? P & Omit<JSXProps, "children"> : P & JSXProps) => ValueOrVNode;
type ElementType = FunctionComponent<any> | string | FragmentElement | ForwardRefElement | ContextElement;
export interface VNode {
  type: ElementType;
  key: JsxKey;
  props: DOMProps;
  source?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
}
type Value =
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined
export type ValueOrVNode =
  | Value
  | VNode
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

// React.Component
export class Component {type: string};
// createElement()
const FRAGMENT_SYMBOL = Symbol.for("react.fragment")
type FragmentElement = { $$typeof: symbol };
export const Fragment: FragmentElement = { $$typeof: FRAGMENT_SYMBOL };
export function createElement(type: VNode["type"], props: VNode["props"] | null = null, ...children: ReactNode[]): VNode {
  const { key, ...rest } = props ?? {};
  return { type, key, props: {...rest, children} };
}
export function memo(component: FC, _arePropsEqual: (_a, _b: any) => boolean) {
  return component;
}
// forwardRef()
export const FORWARD_REF_SYMBOL = Symbol.for("react.forward_ref");
type ForwardRefElement<T = any> = { $$typeof: symbol; render: (props: T & JSXProps, ref: IntrinsicProps["ref"]) => VNode };
export function forwardRef<T>(render: ForwardRefElement<T>["render"]): FC<T> {
  return (props) => {
    console.log("ayaya.forwardRef()", props, render);
    return {
      type: { $$typeof: FORWARD_REF_SYMBOL, render },
      key: undefined,
      props,
    }
  }
}
type Or<T, C> = T | C;
function isCallback<T, C extends Function>(value: Or<T, C>): value is C {
  return typeof value === "function";
}
type RefValue<T> = MutableRef<T> | ((value: T) => void) | null | undefined;
export function useImperativeHandle<T>(ref: RefValue<T>, createHandle: () => T) {
  console.log("ayaya.useImperativeHandle", ref, createHandle)
  if (ref == null) return;
  if (isCallback(ref)) ref(createHandle());
  else ref.current = createHandle();
}
// createContext()
const CONTEXT_PROVIDER_SYMBOL = Symbol.for("react.context");
type ContextElement = { $$typeof: symbol, context: Context<any> };
type Context<T> = {
  _currentValue: T;
  Provider: FC<{value: T}>;
  Consumer: FC<{children: (value: T) => ReactNode}>;
}
export function createContext<T>(defaultValue: T): Context<T> {
  const context: Context<T> = {
    _currentValue: defaultValue,
    Provider: (props) => {
      console.log("ayaya.Provider", props)
      /* NOTE: key prop is handled automatically */
      return {type: {$$typeof: CONTEXT_PROVIDER_SYMBOL, context}, key: undefined, props};
    },
    Consumer: ({children}) => {
      console.log("ayaya.Consumer", children)
      if (typeof children !== "function") throw new Error("Context.Consumer expects a function as its child");
      const value = useContext(context);
      return {type: Fragment, key: undefined, props: {children: children(value)}};
    },
  }
  return context;
}
export function useContext<T>(context: Context<T>): T {
  console.log("ayaya.useContext", context);
  return context._currentValue;
}
type Without<T, U> = T extends U ? never : T;
export function isValidElement(value: any): value is Without<ElementType, Value> {
  //console.log("ayaya.isValidElement")
  return typeof value === "object" && "type" in value && ("props" in value || "$$typeof" in value.type);
}
export function cloneElement(vnode: ValueOrVNode): ValueOrVNode {
  console.log("ayaya.cloneElement")
  return vnode;
}
export const Children = {
  map(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any) {
    console.log("ayaya.Children.map")
    if (children == null) return null; // null or undefined
    if (!Array.isArray(children)) {
      return [fn.call(thisArg, children, 0)];
    }
    return children.map(fn, thisArg);
  },
}

// implementation
type JsReactComponent = {
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
  /** the key that the component was rendered as */
  key: string;
  /** implementation detail */
  childIndex: number;
  /** map<key, ChildState> - TODO: maybe use Map for performance? */
  children: Record<string, JsReactComponent>;
  /** implementation detail */
  prevEventHandlers: Record<string, ((event: any) => void) | undefined>;
  /** implementation detail */
  root: JsReactComponent;
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
function applyJsxProps(component: JsReactComponent, props: DOMProps) {
  const {element, prevEventHandlers} = component;
  if (element == null) return;
  if (element instanceof Text) {
    const value = props as unknown as Value;
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
function renderJsxChildren(parent: JsReactComponent, child: ReactNode, childOrder: JsReactComponent[]) {
  // recurse
  if (Array.isArray(child)) {
    for (let c of child) renderJsxChildren(parent, c, childOrder);
    return;
  }
  // get component state
  let keyLeft = "Text";
  let keyRight;
  if (isVNode(child)) {
    keyLeft = typeof child.type === "string" ? child.type : (child.type as any)?.name ?? "";
    keyRight = child.key;
  }
  if (keyRight == null) {
    keyRight = parent.childIndex++;
  } else {
    keyRight = keyRight;
  }
  const key = `${keyLeft}_${keyRight}`;
  let component = parent.children[key];
  if (component == null) {
    component = {
      node: child,
      element: undefined,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
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
  let isContextElement = false;
  if (isVNode(leaf)) {
    if (typeof leaf.type === "function") leaf = leaf.type(leaf.props);
    else if (leaf.type != null && typeof leaf.type === "object") {
      switch (leaf.type.$$typeof) {
      case FRAGMENT_SYMBOL: {} break;
      case FORWARD_REF_SYMBOL: {
        const forwardRefVNode = leaf.type as ForwardRefElement;
        const {ref, ...rest} = leaf.props;
        // TODO: fix this??
        console.log("ayaya.beforef", forwardRefVNode, rest, ref)
        leaf = forwardRefVNode.render.call(forwardRefVNode, rest, ref);
        console.log("ayaya.afterf", {leaf, child})
      } break;
      case CONTEXT_PROVIDER_SYMBOL: {
        isContextElement = true;
      } break;
      default: {
        const message = "Not implemented: leaf type";
        console.error(message);
        throw leaf.type;
      }}
    }
  }
  const {prevHookIndex, hookIndex} = component;
  if (prevHookIndex !== 0 && hookIndex !== prevHookIndex) {
    throw new RangeError(`Components must have a constant number of hooks, got: ${hookIndex}, expected: ${prevHookIndex}`);
  }
  // create element
  if (!isVNode(leaf)) {
    leaf = {type: "Text", key: undefined, props: leaf as unknown as DOMProps};
  }
  let element = component.element;
  if (typeof leaf.type === "string") {
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
        const value = leaf.props as unknown as Value;
        element = new Text(String(value ?? "")) as unknown as Element;
      } else {
        element = document.createElement(leaf.type as string);
      }
      component.element = element;
    }
    applyJsxProps(component, leaf.props);
  }
  console.log("ayaya.leaf", {leaf, child, element});
  // loop if necessary
  if (element == null) {
    if (leaf !== child) {
      renderJsxChildren(component, leaf, childOrder);
      return;
    }
  }
  // set ref
  if (element != null) {
    const ref = isVNode(child) && child.props.ref;
    if (isCallback(ref)) ref(element);
    else if (ref) ref.current = element;
    // set childOrder
    childOrder.push(component);
    childOrder = [];
  }
  // render children
  let prevContextValue;
  let context: Context<any>;
  if (isContextElement) {
    context = (leaf!.type as ContextElement).context;
    prevContextValue = context._currentValue;
    context._currentValue = leaf!.props.value;
  }
  const children = leaf.props?.children;
  if (children != null) renderChildren(component, children, childOrder);
  if (isContextElement) context!._currentValue = prevContextValue;
}
function renderChildren(parent: JsReactComponent, children: ReactNode, childOrder: JsReactComponent[]) {
  renderJsxChildren(parent, children, childOrder);
  removeUnusedChildren(parent, parent.flags & 1);
  // reorder used children
  const parentElement = parent.element;
  if (parentElement != null) {
    //console.log("ayaya.parentElement", {a: parentElement, childOrder})
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
function removeUnusedChildren(parent: JsReactComponent, parentFlags: number) {
  for (let c of Object.values(parent.children)) {
    if (c.flags !== parentFlags) {
      c.element?.remove();
      c.root = null as any; // delete cyclic reference to help the garbage collector
      delete parent.children[c.key]; // delete old state
    }
    if (c.element == null) removeUnusedChildren(c, parentFlags);
  }
}
function _rerender(component: JsReactComponent) {
  const rootComponent = component.root;
  if ((rootComponent.flags & 2) === 0) {
    rootComponent.flags = rootComponent.flags | 2;
    requestAnimationFrame(() => {
      // NOTE: this may execute concurrently!
      const nextGcFlag = 1 - (component.flags & 1);
      rootComponent.flags = nextGcFlag;
      rootComponent.childIndex = 0;
      renderChildren(rootComponent, rootComponent.node, []);
    });
  }
}
export function renderRoot(vnode: ValueOrVNode, parent: HTMLElement) {
  const onLoad = () => {
    const rootComponent: JsReactComponent = {
      node: vnode,
      element: parent,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
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
let $component = {} as JsReactComponent;
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
export function useRef<T = undefined>(defaultState: T | (() => T) = undefined as T): MutableRef<T> {
  const prevHookCount = $component.hooks.length;
  const hook = useHook({current: undefined as T});
  if ($component.hookIndex > prevHookCount) {
    if (isCallback(defaultState)) hook.current = defaultState();
    else hook.current = defaultState;
  }
  console.log("ayaya.useRef", defaultState, hook);
  return hook;
}
export function useState<T>(defaultState: T | (() => T)): [T, (newValue: T) => void] {
  console.log("ayaya.useState", defaultState);
  const prevHookCount = $component.hooks.length;
  const hook = useHook({current: undefined as T});
  if ($component.hookIndex > prevHookCount) {
    if (isCallback(defaultState)) hook.current = defaultState();
    else hook.current = defaultState;
  }
  const setState = (newState: T) => {
    hook.current = newState;
    _rerender($component);
  }
  return [hook.current, setState];
}
function dependenciesDiffer(prevDeps: any[] | null, deps: any[] | null): boolean {
  // NOTE: `Object.is()` for correct NaN handling
  return prevDeps == null || deps == null || prevDeps.length !== deps.length || prevDeps.some((v, i) => !Object.is(v, deps[i]));
}
/** NOTE: prefer `useRef()` for better performance */
export function useEffect(callback: () => void, dependencies: any[] | null = null): void {
  console.log("ayaya.useEffect", callback, dependencies);
  const hook = useHook({prevDeps: null as any[] | null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    //callback();
    setTimeout(callback, 0);
  }
}
export function useLayoutEffect(callback: () => void, dependencies: any[] | null = null) {
  console.log("ayaya.useLayoutEffect", callback, dependencies);
  const hook = useHook({prevDeps: null as any[] | null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    callback();
  }
}
export function useMemo<T>(callback: () => T, dependencies: any[] | null = null): T {
  console.log("ayaya.useMemo", callback, dependencies);
  const hook = useHook({current: null as T, prevDeps: null as any[] | null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback();
  }
  return hook.current;
}
export function useCallback<T extends Function>(callback: T, _dependencies: any[] | null = null) {
  console.log("ayaya.useCallback", callback, _dependencies);
  const hook = useHook({current: (() => {}) as unknown as T})
  hook.current = callback; // NOTE: you already created the lambda, might as well use it...
  return hook.current;
}
export function useId(): string {
  console.log("ayaya.useId");
  const hook = useHook({ current: "" });
  if (hook.current === "") hook.current = String(Math.random());
  return hook.current;
}
// TODO: more hooks?
