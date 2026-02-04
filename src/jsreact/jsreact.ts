import * as CSS from "csstype";
import { jsx } from "./jsx-runtime";
export type CSSProperties = CSS.Properties<string | number>;

// events
export type SyntheticEvent<T = Element, E = globalThis.Event> = Omit<E, "target" | "currentTarget"> & {
  target: T;
  currentTarget: T;
};
export type MouseEvent<T = Element> = SyntheticEvent<T, globalThis.MouseEvent>;
export type FocusEvent<T = Element> = SyntheticEvent<T, globalThis.FocusEvent>;
export type TouchEvent<T = Element> = SyntheticEvent<T, globalThis.TouchEvent>;
export type EventHandler<T> = (event: Event) => void;

// IntrinsicProps
type JsxKey = Value;
type JSXProps = {children?: ReactNode, key?: JsxKey};
export type RefAttributes<R = Element> = {ref?: Ref<R>}
export type ReactProps = JSXProps & RefAttributes<any>;
type DOMProps = ReactProps & {
  className?: string[] | string;
  cssVars?: Record<string, string | number>;
  style?: CSSProperties;
  htmlFor?: string;
  // TODO: more event types
  onClick?: (event: MouseEvent) => void;
  [k: string]: any;
};

// ReactNode
export type PropsWithChildren<P = {}> = P extends {children: any} ? P & Omit<JSXProps, "children"> : P & JSXProps;
export type FunctionComponent<P = {}> = (props: PropsWithChildren<P>) => ValueOrVNode;
type ForwardFn<P = {}, R = Element> = (props: PropsWithChildren<P>, ref: Ref<R>) => ValueOrVNode;
export type FC<P = {}> = FunctionComponent<P>;
export type ForwardRefExoticComponent<P = {}> = (props: PropsWithChildren<P & RefAttributes<any>>) => ValueOrVNode;

export type ElementType = FunctionComponent<any> | string | FragmentElement | ForwardRefElement | ContextElement | PortalElement;
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
  | void
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

// React.Component
export function Component(props, context, updater): ReactNode {
  if (context != null || updater != null) throw new Error("Not implemented: Component(...)");
  console.log(props, context, updater);
  return Fragment(props);
}
export const version = 19;
// createElement()
type TextProps = {value: Value};
const FRAGMENT_SYMBOL = Symbol.for("react.fragment")
type FragmentElement = { $$typeof: symbol };
export function Fragment(props: JSXProps): VNode {
  // NOTE: key is handled automatically
  return { type: { $$typeof: FRAGMENT_SYMBOL }, key: undefined, props };
};
export function createElement(type: VNode["type"], props: VNode["props"] | null = null, ...children: ReactNode[]): VNode {
  //console.log("ayaya.createElement", type, props, children);
  const { key, ...rest } = props ?? {};
  const jsxProps = {
    children: children.length === 1 ? children[0] : children,
    ...rest, // NOTE: some people (MUI) pass children inside props...
  }
  return jsx(type, jsxProps, key);
}
export function memo(component: FC, _arePropsEqual: (_a, _b: any) => boolean) {
  return component;
}
// forwardRef()
export const FORWARD_REF_SYMBOL = Symbol.for("react.forward_ref");
type ForwardRefElement<P = {}, R = Element> = { $$typeof: symbol; render: ForwardFn<P, R> };
export function forwardRef<R = Element, P = {}>(render: ForwardFn<P, R>): FC<P> {
  return (props) => {
    return {
      type: { $$typeof: FORWARD_REF_SYMBOL, render },
      key: undefined,
      props,
    };
  }
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
  //console.log("ayaya.useContext", context);
  return context._currentValue;
}
// createPortal()
const PORTAL_SYMBOL = Symbol.for("react.portal");
type PortalElement = {$$typeof: Symbol; to: Element};
export function createPortal(children: ReactNode, node: Element): VNode {
  return {type: {$$typeof: PORTAL_SYMBOL, to: node}, key: undefined, props: {children}};
}
type Without<T, U> = T extends U ? never : T;
export function isValidElement(value: any): value is Without<ElementType, Value> {
  console.log("ayaya.isValidElement", value)
  return typeof value === "object" && "type" in value && ("props" in value || "$$typeof" in value.type);
}
export function cloneElement(vnode: ReactNode, childProps: DOMProps): ValueOrVNode {
  console.log("ayaya.cloneElement")
  if (Array.isArray(vnode)) throw "Not implemented: cloneElement(array)";
  if (isVNode(vnode)) {return {...vnode, props: childProps}}
  return vnode;
}
export const Children = {
  map(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any) {
    console.log("ayaya.Children.map")
    if (children == null) return null;
    if (Array.isArray(children)) return children.map(fn, thisArg);
    else return [fn.call(thisArg, children, 0)];
  },
  forEach(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any) {
    if (children == null || typeof children === "boolean") return null;
    if (Array.isArray(children)) children.forEach(fn, thisArg);
    else fn.call(thisArg, children, 0);
  }
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
function applyJsxProps(component: JsReactComponent, props: DOMProps) {
  const {element, prevEventHandlers} = component;
  if (element == null) return;
  if (element instanceof Text) {
    let value = (props as TextProps).value;
    const type = typeof value;
    if (type !== "number" && type !== "bigint") value = value || "";
    element.textContent = String(value);
    return;
  }
  // style
  const {ref, key, htmlFor, style, cssVars, className, children, ...rest} = props;
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
  // attribute/events
  for (let [key, value] of Object.entries(rest)) {
    if (key.startsWith("on") && key.length > 2) {
      const type = key.slice(2).toLowerCase();
      const prevEventHandler = prevEventHandlers[type];
      const eventHandler = props[key];
      prevEventHandlers[type] = eventHandler;
      if (prevEventHandler != null) element.removeEventListener(type, prevEventHandler);
      if (eventHandler != null) element.addEventListener(type, eventHandler);
    } else {
      if (value != null) element.setAttribute(key, String(value ?? ""));
      else element.removeAttribute(key);
    }
  }
  if (htmlFor) {
    element.setAttribute("for", htmlFor);
  }
}

// render
function isVNode(leaf: ValueOrVNode): leaf is VNode {
  return leaf !== null && typeof leaf === "object";
}
function renderJsxChildren(parent: JsReactComponent, child: VNode | VNode[], childOrder: JsReactComponent[]) {
  // recurse
  if (Array.isArray(child)) {
    for (let c of child) renderJsxChildren(parent, c, childOrder);
    return;
  }
  // get component state
  if (!isVNode(child)) {
    const textProps: TextProps = {value: child};
    child = {type: "Text", key: undefined, props: textProps};
  }
  let keyLeft = typeof child.type === "string" ? child.type : (child.type as any)?.name ?? "";
  let keyRight = child.key;
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
  let leaf: ValueOrVNode = child;
  let isContextElement = false;
  let isPortalElement = false;
  if (isVNode(leaf)) {
    if (typeof leaf.type === "function") {
      leaf = leaf.type(leaf.props);
    } else if (leaf.type != null && typeof leaf.type === "object") {
      switch (leaf.type.$$typeof) {
      case FRAGMENT_SYMBOL: {} break;
      case FORWARD_REF_SYMBOL: {
        const forwardRefVNode = leaf.type as ForwardRefElement;
        const {ref, ...rest} = leaf.props;
        //console.log("ayaya.beforef", child, rest, ref)
        leaf = forwardRefVNode.render.call(forwardRefVNode, rest, ref);
        //console.log("ayaya.afterf", {leaf, child})
      } break;
      case CONTEXT_PROVIDER_SYMBOL: {
        isContextElement = true;
      } break;
      case PORTAL_SYMBOL: {
        const portalElement = leaf.type as PortalElement;
        component.element = portalElement.to;
        isPortalElement = true;
      } break;
      default: {
        console.error(leaf.type);
        throw new Error("Not implemented: leaf type");
      }}
    }
  }
  // if a function component returns Value, then we turn it into a VNode again...
  if (!isVNode(leaf)) {
    const textProps: TextProps = {value: leaf};
    leaf = {type: "Text", key: undefined, props: textProps};
  }
  // debug
  const {prevHookIndex, hookIndex} = component;
  if (prevHookIndex !== 0 && hookIndex !== prevHookIndex) {
    throw new RangeError(`Components must have a constant number of hooks, got: ${hookIndex}, expected: ${prevHookIndex}`);
  }
  // create element
  let isElementNew = false;
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
      console.error(`${error}:`, {before: component.element, next: node});
      if (source) throw error; // NOTE: only runs in dev build
    };
    if (element == null) {
      isElementNew = true;
      if (leaf.type === "Text") {
        element = new Text() as unknown as Element;
      } else {
        element = document.createElement(leaf.type as string);
      }
      component.element = element;
    }
    applyJsxProps(component, leaf.props);
  }
  // loop if necessary
  if (element != null) {
    // set ref = element
    if (isElementNew) {
      const ref = isVNode(child) ? child.props.ref : undefined;
      if (isCallback(ref)) ref(element);
      else if (ref) ref.current = element;
    }
    // set childOrder
    if (!isPortalElement) childOrder.push(component);
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
  let children = leaf.props?.children;
  if (leaf !== child && (typeof leaf.type === "function" || (leaf.type as any)?.$$typeof)) {
    children = leaf;
  }
  console.log("ayaya.leaf.leaf", leaf);
  if (children != null) renderChildren(component, children as VNode | VNode[], childOrder);
  if (isContextElement) context!._currentValue = prevContextValue;
}
function renderChildren(parent: JsReactComponent, children: VNode | VNode[], childOrder: JsReactComponent[]) {
  renderJsxChildren(parent, children, childOrder);
  console.log("ayaya.render.parentElement", {a: parent, childOrder})
  removeUnusedChildren(parent, parent.flags & 1);
  // reorder used children
  const parentElement = parent.element;
  if (parentElement != null && !(parentElement instanceof Text)) {
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
      console.log("ayaya.c", c);
      // set ref = null
      const child = c.node;
      const ref = isVNode(child) ? child.props.ref : undefined;
      if (isCallback(ref)) ref(null);
      else if (ref) ref.current = null;
      // remove the element
      c.element?.remove();
      c.root = null as any; // delete cyclic reference to help the garbage collector
      delete parent.children[c.key]; // delete old state
    }
    if (c.element == null) removeUnusedChildren(c, parentFlags);
  }
}
// debug tools
let renderCount = 0;
const MAX_RENDER_COUNT: number | null = null;
const ENABLE_WHY_DID_YOU_RENDER = true;
function whoami() {
  const stacktrace = new Error().stack ?? "";
  return "\n" + stacktrace.split("\n").slice(3).join("\n");
}
// entry
function _rerender(component: JsReactComponent) {
  if (ENABLE_WHY_DID_YOU_RENDER) {
    console.log("Rerender caused by:", whoami());
  }
  if (MAX_RENDER_COUNT != null && renderCount++ > MAX_RENDER_COUNT) {
    throw new Error("Infinite loop!");
  }
  const rootComponent = component.root;
  if ((rootComponent.flags & 2) === 0) {
    rootComponent.flags = rootComponent.flags | 2;
    requestAnimationFrame(() => {
      // NOTE: this may execute concurrently!
      const nextGcFlag = 1 - (component.flags & 1);
      rootComponent.flags = nextGcFlag;
      rootComponent.childIndex = 0;
      try {
        renderChildren(rootComponent, rootComponent.node as any, []);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          document.body.innerHTML = `<h3 class="jsreact-error" style="font-family: Consolas, sans-serif; white-space: pre-wrap">${error.stack}.</h3>`;
        }
        throw error;
      }
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
export type MutableRef<T> = {current: T};
export type Ref<T> = MutableRef<T> | ((value: T) => void);
export type ForwardedRef<T> = Ref<T> | undefined;
function isCallback<T, C extends Function>(value: T | C): value is C {
  return typeof value === "function";
}
export function useImperativeHandle<T>(ref: Ref<T> | null | undefined, createHandle: () => T, dependencies?: any[]) {
  const hook = useHook({prevDeps: null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    if (ref == null) return;
    if (isCallback(ref)) ref(createHandle());
    else ref.current = createHandle();
  }
}
export function useRef<T = undefined>(initialValue: T = undefined as T): MutableRef<T> {
  const prevHookCount = $component.hooks.length;
  const hook = useHook({current: undefined as T});
  if ($component.hookIndex > prevHookCount) {
    hook.current = initialValue as T;
  }
  console.log("ayaya.useRef", initialValue, hook);
  return hook;
}
export function useState<T = undefined>(initialState?: T | (() => T)): [T, (newValue: T) => void] {
  console.log("ayaya.useState", {initialState});
  const prevHookCount = $component.hooks.length;
  type SetStateFunction = (newState: T | ((state: T) => T)) => void;
  const hook = useHook({current: undefined as T, setState: (() => {}) as SetStateFunction});
  if ($component.hookIndex > prevHookCount) {
    if (isCallback(initialState)) hook.current = initialState();
    else hook.current = initialState as T;
    hook.setState = (newState: T | ((state: T) => T)) => {
      const prevValue = hook.current;
      if (isCallback(newState)) hook.current = newState(hook.current);
      else hook.current = newState;
      if (!Object.is(hook.current, prevValue)) {
        console.log("ayaya.setState()", prevValue, hook.current)
        _rerender($component);
      }
    }
  }
  return [hook.current, hook.setState];
}
function dependenciesDiffer(prevDeps: any[] | null | undefined, deps: any[] | null | undefined): boolean {
  // NOTE: `Object.is()` for correct NaN handling
  return prevDeps == null || deps == null || prevDeps.length !== deps.length || prevDeps.some((v, i) => !Object.is(v, deps[i]));
}
/** NOTE: prefer `useRef()` for better performance */
export function useEffect(callback: () => void, dependencies?: any[]): void {
  console.log("ayaya.useEffect", {callback, dependencies});
  const hook = useHook({prevDeps: null as any[] | null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    //callback();
    setTimeout(callback, 0);
  }
}
export function useLayoutEffect(callback: () => void, dependencies?: any[]) {
  console.log("ayaya.useLayoutEffect", {callback, dependencies});
  const hook = useHook({prevDeps: null as any[] | null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    //callback();
    setTimeout(callback, 0); // TODO: run after inserted?
  }
}
export function useMemo<T>(callback: () => T, dependencies?: any[]): T {
  console.log("ayaya.useMemo", {callback, dependencies});
  const hook = useHook({current: null as T, prevDeps: null as any[] | null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    console.log("ayaya.useMemo.2")
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback();
  }
  return hook.current;
}
export function useCallback<T extends Function>(callback: T, _dependencies?: any[]) {
  console.log("ayaya.useCallback", {callback, _dependencies});
  const hook = useHook({current: (() => {}) as unknown as T})
  hook.current = callback; // NOTE: you already created the lambda, might as well use it...
  return hook.current;
}
export function useId(idProp): string {
  if (idProp) throw `Not implemented: idProp`
  console.log("ayaya.useId");
  const hook = useHook({ current: "" });
  if (hook.current === "") hook.current = String(Math.random());
  return hook.current;
}
export function useDebugValue<T>(value: T, formatter?: (value: T) => any) {
  // TODO: maybe store the debug value?
}
// TODO: more hooks?
