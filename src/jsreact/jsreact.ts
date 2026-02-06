import { jsx } from "./jsx-runtime";
import type React from "react";

// env
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// types
export type MutableRef<T> = {current: T};
export type Ref<T> = MutableRef<T> | ((value: T) => void) | null;
export type Value = string | bigint | number | boolean | null | undefined | void;
export type JsxKey = Value;
export type JsxProps = {children?: ReactNode, key?: JsxKey};
export type DOMProps<R = any> = JsxProps & {
  ref?: Ref<R | null>;
  className?: string[] | string;
  style?: React.CSSProperties & {[k in `--${string}`]: number | string};
  htmlFor?: string;
  // TODO: more event types
  onClick?: (event: MouseEvent) => void;
  [k: string]: any;
};

export type PropsWithChildren<P = {}> = (P extends {children: any} ? P & Omit<JsxProps, "children"> : P) & JsxProps;
export type FunctionComponent<P = {}> = (props: PropsWithChildren<P>, context?: any) => ValueOrVNode;
export type FC<P = {}> = FunctionComponent<P>;
export type ForwardFn<P = {}, R = any> = React.ForwardRefRenderFunction<R, P>;

export type ForwardRefComponent<P = {}, R = any> = ForwardFn<P, R> & { $$typeof: symbol };
export type FragmentElement = { $$typeof: symbol };
export type Context<T> = React.Context<T> & {_currentValue: T};
export type Portal = React.ReactPortal;
export type ElementType = string | React.JSXElementConstructor<any>;
type Without<T, U> = T extends U ? never : T;
export type ReactNode = React.ReactNode;
export type ReactNodeSync = Without<ReactNode, Promise<any>>; // TODO: we could just support promises now
export type ValueOrVNode = Without<ReactNodeSync, Iterable<React.ReactNode>>;

// private types
type NamedExoticComponent<P = {}> = React.NamedExoticComponent<P>;
type UntypedNamedExoticComponent<P = {}> = {
  (props: P): ReactNode;
  $$typeof?: symbol;
  displayName?: NamedExoticComponent["displayName"];
}
type PortalVNode = Omit<React.ReactPortal, "key"> & { key?: React.ReactPortal["key"] };
type ReactElement<P = unknown, T extends string | React.JSXElementConstructor<any> = string | React.JSXElementConstructor<any>> = React.ReactElement<P, T>;
type VNode = Omit<ReactElement<DOMProps, ElementType>, "key"> & {
  key?: ReactElement["key"];
  source?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
};

// legacy Component class
export class Component<P = {}, S = {}, _SS = any> {
  props: Readonly<P>;
  state: Readonly<S>;
  static contextType?: Context<any>;
  get context() {return useContext((this.constructor as any).contextType)}
  private $$setState: (newState: S) => void;
  private $$component: JsReactComponent;
  constructor(props: P, _context: null) {this.props = props};
  setState(state: Partial<S> | ((prevState: Readonly<S>, props: Readonly<P>) => Partial<S> | null)) {
    let diff: Partial<S>;
    if (typeof state === "function") {
      diff = state(this.state, this.props) ?? {};
    } else {
      diff = state;
    }
    this.$$setState({...this.state, ...diff});
  }
  forceUpdate() {rerender(this.$$component)}
  render(): ReactNode {return null};
}
/*export function Component(props, context, updater): ReactNode {
  if (context != null || updater != null) throw new Error("Not implemented: Component(...)");
  console.log(props, context, updater);
  return Fragment(props);
}*/
export const version = 19;
// createElement()
type TextProps = {value: Value};
const FRAGMENT_SYMBOL = Symbol.for("react.fragment");
export const Fragment = makeExoticComponent(FRAGMENT_SYMBOL);
export function createElement(type: VNode["type"], props: VNode["props"] | null = null, ...children: ReactNode[]): VNode {
  //console.log("ayaya.createElement", type, props, children);
  const { key, ...rest } = props ?? {};
  const jsxProps = {
    children: children.length === 1 ? children[0] : children,
    ...rest, // NOTE: some people (MUI) pass children inside props...
  }
  return jsx(type, jsxProps, key as VNode["key"]);
}
export function memo(component: FC, _arePropsEqual: (_a, _b: any) => boolean) {
  return component;
}
// forwardRef()
export const FORWARD_REF_SYMBOL = Symbol.for("react.forward_ref");
export function forwardRef<R = any, P = {}>(render: ForwardFn<P, R>): ForwardRefComponent<P, R> {
  const forwardRefComponent = render as ForwardRefComponent<P, R>;
  forwardRefComponent.displayName = render["displayName"] || render.name || "forwardRefComponent";
  forwardRefComponent.$$typeof = FORWARD_REF_SYMBOL;
  return forwardRefComponent;
}
// createContext()
const CONTEXT_PROVIDER_SYMBOL = Symbol.for("react.context");
const CONTEXT_CONSUMER_SYMBOL = Symbol.for("react.consumer");
function makeExoticComponent<P = {}>(
  $$typeof: symbol,
  render?: UntypedNamedExoticComponent<PropsWithChildren<P>>,
): NamedExoticComponent<P> {
  if (render == null) {
    render = (props) => props.children;
    render.displayName = String($$typeof);
  } else {
    render.displayName = render.displayName || render.name || String($$typeof);
  }
  render.$$typeof = $$typeof;
  return render as NamedExoticComponent<P>;
}
export function createContext<T>(defaultValue: T): Context<T> {
  const context = makeExoticComponent(CONTEXT_PROVIDER_SYMBOL, (props) => {
    return {type: {$$typeof: CONTEXT_PROVIDER_SYMBOL, context}, key: undefined, props} as unknown as ValueOrVNode;
  }) as Context<T>;
  context._currentValue = defaultValue;
  context.Provider = context;
  context.Consumer = makeExoticComponent(CONTEXT_CONSUMER_SYMBOL, ({children}) => {
    console.log("ayaya.Consumer", children)
    if (typeof children !== "function") throw new Error("Context.Consumer expects a function as its child");
    const value = useContext(context);
    return children(value);
  });
  return context;
}
export function useContext<T>(context: Context<T>): T {
  //console.log("ayaya.useContext", context);
  return context._currentValue;
}
// createPortal()
const PORTAL_SYMBOL = Symbol.for("react.portal");
export function createPortal(children: ReactNode, node: Element, key?: JsxKey): PortalVNode {
  return {
    type: makeExoticComponent(PORTAL_SYMBOL),
    key: key as VNode["key"],
    props: node,
    children,
  };
}
export function isValidElement(value: any): value is Without<ElementType, Value> {
  console.log("ayaya.isValidElement", value)
  return typeof value === "object" && "type" in value && ("props" in value || "$$typeof" in value.type);
}
export function cloneElement(vnode: ReactNodeSync, childProps: DOMProps): ValueOrVNode {
  console.log("ayaya.cloneElement")
  if (isIterable(vnode)) throw new Error("Not implemented: cloneElement(array)");
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
  /** implementation detail */
  flags: number;
};
const FLAGS_WILL_RENDER_NEXT_FRAME = 4;
const FLAGS_IS_RENDERING = 2;
const FLAGS_GC = 1;
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
function applyDOMProps(component: JsReactComponent, props: DOMProps) {
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
  const {ref, key, htmlFor, style, className, children, ...rest} = props;
  if (style != null) {
    for (let [k, v] of Object.entries(style)) {
      k = camelCaseToKebabCase(k);
      v = typeof v == "number" ? `${v}px` : v ?? null;
      (element as HTMLElement).style.setProperty(k, v);
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
function isIterable(value: ReactNode): value is Iterable<ReactNode> {
  return typeof value !== "string" && typeof value?.[Symbol.iterator] === "function";
}
function isVNode(leaf: ValueOrVNode): leaf is ReactElement {
  return leaf !== null && typeof leaf === "object";
}
function isComponentClass(type: ReactElement["type"]): type is (new(props: any, context: any) => Component<any, any>) {
  return typeof type === "function" && type.prototype != null && typeof type.prototype.render === "function";
}
function setRef<T>(ref: Ref<T> | undefined | null, value: T) {
  if (isCallback(ref)) ref(value);
  else if (ref) ref.current = value;
}
function jsreact$renderJsxChildren(parent: JsReactComponent, child: ReactNodeSync, childOrder: JsReactComponent[]) {
  // recurse
  if (isIterable(child)) {
    for (let c of child) jsreact$renderJsxChildren(parent, c as ReactNodeSync, childOrder);
    return;
  }
  // get component state
  let keyLeft: Value;
  let keyRight: string;
  if (isVNode(child)) {
    keyLeft = child.key;
    const childType = child.type;
    if (typeof childType === "string") {
      keyRight = childType;
    } else {
      const displayName = (childType as NamedExoticComponent).displayName;
      const $$typeof = (childType as NamedExoticComponent).$$typeof;
      keyRight = displayName || childType.name || String($$typeof);
    }
  } else {
    keyRight = typeof child + "$";
  }
  if (keyLeft == null) {
    keyLeft = parent.childIndex++;
  } else {
    keyLeft = keyLeft;
  }
  const key = `${keyLeft}_${keyRight}`;
  let component = parent.children[key];
  const isComponentNew = component == null;
  if (isComponentNew) {
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
      flags: 0,
    };
    parent.children[key] = component;
  }
  component.childIndex = 0;
  component.prevHookIndex = component.hookIndex;
  component.hookIndex = 0;
  component.flags = parent.flags & FLAGS_GC; // NOTE: parent.flags can get set concurrently, so we need to filter them here
  // run user code
  $component = component;
  component.node = child;
  let leaf: ReactNodeSync = child;
  let isContext = false;
  let desiredElementType = "";
  if (!isVNode(leaf)) {
    // Value
    const hasText = typeof leaf === "string" || typeof leaf === "number" || typeof leaf === "bigint";
    if (!hasText) return;
    desiredElementType = "Text";
  } else {
    const leafType = leaf.type;
    if (typeof leafType === "function") {
      // function
      const $$typeof = leafType["$$typeof"];
      switch ($$typeof) {
      case undefined: {
        if (isComponentClass(leafType)) {
          if ("contextTypes" in leaf) throw "Not implemented: legacy Component.contextTypes";
          const instance = new leafType(leaf.props, null);
          const [state, setState] = useState(instance.state ?? {});
          instance.state = state; // NOTE: Component class state does not update while rendering!
          instance["$$setState"] = setState;
          instance["$$component"] = component;
          leaf = instance.render() as ReactNodeSync;
          console.log("ayaya.Class", leaf)
        } else {
          leaf = (leafType as FunctionComponent)(leaf.props as JsxProps); // function component
        }
      } break;
      case FORWARD_REF_SYMBOL: {
        const {ref = null, ...rest} = leaf.props as DOMProps;
        leaf = (leafType as unknown as ForwardRefComponent)(rest, ref) as ValueOrVNode;
      } break;
      case FRAGMENT_SYMBOL: {} break;
      case CONTEXT_PROVIDER_SYMBOL: {
        isContext = true;
      } break;
      case PORTAL_SYMBOL: {
        const portal = leaf as Portal;
        console.log("ayaya.leaf.portal", portal, leaf);
        leaf = portal.children as ReactNodeSync;
        component.element = portal.props as Element;
        childOrder = [];
      } break;
      default:
        throw String($$typeof);
      }
    } else if (typeof leafType === "string") {
      // HTML element
      desiredElementType = leafType;
    } else {
      throw leafType;
    }
  }
  // assert number of hooks is constant
  const {prevHookIndex, hookIndex} = component;
  if (prevHookIndex !== 0 && hookIndex !== prevHookIndex) {
    throw new RangeError(`Components must have a constant number of hooks, got: ${hookIndex}, expected: ${prevHookIndex}`);
  }
  if (desiredElementType) {
    const currentElement = component.element;
    // assert don't need key prop
    if (currentElement != null && (currentElement?.tagName?.toLowerCase() ?? "Text") !== desiredElementType) {
      console.log("ayaya.assertKey", {desiredElementType});
      let node: Partial<ValueOrVNode> = child;
      let source = "";
      if (isVNode(child)) {
        const vnode = {...child} as VNode;
        source = vnode.source != null ? `${vnode.source?.fileName}:${vnode.source?.lineNumber}` : "";
        delete vnode.key;
        delete vnode.source;
        node = vnode;
      }
      const error = (source ? `${source}: ` : "") + "Dynamic elements must have the key prop";
      console.error(`${error}:`, {before: component.element, next: node});
      if (source) throw error; // NOTE: only runs in dev build
    }
    // use the element
    const isElementNew = currentElement == null;
    if (desiredElementType === "Text") {
      if (isElementNew) component.element = new Text() as unknown as Element;
      (component.element as unknown as Text).textContent = String(leaf);
      childOrder.push(component); // set childOrder
    } else {
      if (isElementNew) component.element = document.createElement(desiredElementType);
      applyDOMProps(component, (leaf as VNode).props);
      if (isElementNew) setRef((child as VNode).props.ref, component.element);
      // set childOrder
      childOrder.push(component);
      childOrder = [];
    }
  }
  // render children
  let prevContextValue;
  let context: Context<any>;
  if (isContext) {
    context = ((leaf as VNode).type as Context<any>);
    prevContextValue = context._currentValue;
    context._currentValue = (leaf as VNode).props.value;
  }
  const children: ReactNodeSync = leaf === child ? (leaf as VNode)?.props?.children as ReactNodeSync : leaf;
  console.log("ayaya.leaf", {...(isVNode(child) ? child : {props: {value: child}}), key}, {leaf, component, parent});
  if (children != null) jsreact$renderChildren(component, children, childOrder);
  if (isContext) context!._currentValue = prevContextValue;
}
function jsreact$renderChildren(parent: JsReactComponent, children: ReactNodeSync, childOrder: JsReactComponent[]) {
  jsreact$renderJsxChildren(parent, children, childOrder);
  removeUnusedChildren(parent, parent.flags & FLAGS_GC);
  // reorder used children
  const parentElement = parent.element;
  if (parentElement != null) console.log("ayaya.parentElement", {a: parent.element, children: childOrder.map(v => v.element)})
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
function removeUnusedChildren(parent: JsReactComponent, parentGcFlag: number) {
  //console.log("ayaya.gc.parent", {
  //  parent: parent.key,
  //  parentGcFlag,
  //  children: Object.values(parent.children).map(v =>  v.key)
  //})
  //console.log("ayaya.gc.hit", parent);
  for (let component of Object.values(parent.children)) {
    const $$typeof = (component.node as any)?.type?.$$typeof;
    const isUnused = component.flags !== parentGcFlag;
    if (isUnused) delete parent.children[component.key]; // delete old state
    if ($$typeof) {
      removeUnusedChildren(component, parentGcFlag); // recurse into Fragment or similar
    } else if (isUnused) {
      //console.log("ayaya.gc", {key: component.key, $$typeof, component, parent});
      const element = component.element;
      if (element != null) {
        // set ref = null
        const child = component.node;
        const ref = isVNode(child) ? (child.props as DOMProps).ref : undefined;
        setRef(ref, null);
        // remove the element
        element.remove();
      }
    }
  }
}
// debug tools
const ENABLE_WHY_DID_YOU_RENDER = ".render.leaf.parent.gc.popper.component.";
function whoami() {
  // NOTE: firefox is trash, so we have to print one level lower than we would like...
  if (Error.captureStackTrace) {
    const stacktrace = {} as unknown as {stack: string};
    Error.captureStackTrace(stacktrace, whoami);
    const lines = stacktrace.stack;
    return lines.slice(lines.indexOf("\n") + 1);
  } else {
    const stacktrace = new Error().stack ?? "";
    let lines = stacktrace.split("\n").slice(2);
    if (lines.length > 3) lines = [...lines.slice(0, 3), lines[0].startsWith("  ") ? "  ..." : "..."];
    return lines.join("\n");
  }
}
function prettifyError(prefix: any, error: string|undefined|null) {
  let lines = (error ?? "").split("\n");
  const acc: string[] = [];
  if (lines[0].includes("Error")) {
    acc.push(lines[0]);
    lines = lines.slice(1);
  } else {
    acc.push(String(prefix));
  }
  let haveEllipsis = false;
  for (let line of lines) {
    if (line === "") continue;
    if (line.includes("jsreact$")) {
      if (!haveEllipsis) {
        acc.push("    ...");
        haveEllipsis = true;
      }
    } else {
      haveEllipsis = false;
      acc.push(line.startsWith(" ") ? line : "    " + line);
    };
  }
  return acc.join("\n");
}
let renderCount = 0;
const MAX_RENDER_COUNT: number | null = null;
// entry
function rerender(component: JsReactComponent) {
  let whyDidYouRender: string|undefined;
  if (ENABLE_WHY_DID_YOU_RENDER) {
    const prefix = typeof ENABLE_WHY_DID_YOU_RENDER === "string" ? ENABLE_WHY_DID_YOU_RENDER : "";
    whyDidYouRender = prettifyError(`${prefix}Render caused by:`, whoami());
  }
  let infiniteLoop: boolean | string = MAX_RENDER_COUNT != null && renderCount++ > MAX_RENDER_COUNT;
  if (infiniteLoop) infiniteLoop = whoami();
  const rootComponent = component.root;
  const jsreact$doTheRender = () => {
    try {
      if (whyDidYouRender) console.log(whyDidYouRender);
      if (infiniteLoop) throw `Infinite loop (${MAX_RENDER_COUNT}):\n${infiniteLoop}`;
      rootComponent.childIndex = 0;
      rootComponent.hooks = [];
      rootComponent.flags = FLAGS_IS_RENDERING | (1 - (rootComponent.flags & FLAGS_GC));
      jsreact$renderChildren(rootComponent, rootComponent.node as any, []);
      for (let layoutEffectCallback of rootComponent.hooks) {
        layoutEffectCallback();
      }
      rootComponent.flags = rootComponent.flags & ~FLAGS_IS_RENDERING;
    } catch (error) {
      console.log("error", {error})
      if (!IS_PRODUCTION) {
        let message = error;
        if (message instanceof Error) message = prettifyError(error, error.stack ?? "");
        document.body.innerHTML = `<h3 class="jsreact-error" style="font-family: Consolas, sans-serif; white-space: pre-wrap">Uncaught ${message}</h3>`;
      }
      throw error;
    }
  }
  const jsreact$renderLater = () => {
    if (rootComponent.flags & FLAGS_IS_RENDERING) requestAnimationFrame(jsreact$renderLater);
    else jsreact$doTheRender();
  }
  //console.log(".render", rootComponent.flags.toString(2).padStart(3, "0"));
  if ((rootComponent.flags & FLAGS_IS_RENDERING) === 0) {
    jsreact$doTheRender();
  } else if ((rootComponent.flags & FLAGS_WILL_RENDER_NEXT_FRAME) === 0) {
    rootComponent.flags = rootComponent.flags | FLAGS_WILL_RENDER_NEXT_FRAME;
    requestAnimationFrame(jsreact$renderLater);
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
      key: "root",
      childIndex: 0,
      children: {},
      prevEventHandlers: {},
      root: undefined as any,
      flags: 0,
    };
    rootComponent.root = rootComponent;
    console.log("ayaya.root", rootComponent);
    rerender(rootComponent);
  }
  window.addEventListener("DOMContentLoaded", onLoad);
}

// hooks
/** the current component */
let $component = {} as JsReactComponent;
export const useRerender = () => () => rerender($component);
export function useHook<T extends object>(defaultState: T = {} as T): T {
  const index = $component.hookIndex++;
  if (index >= $component.hooks.length) {
    if ($component.prevHookIndex === 0) $component.hooks.push(defaultState);
    else throw new RangeError(`Components must have a constant number of hooks, got: ${$component.hookIndex}, expected: ${$component.prevHookIndex}`);
  }
  return $component.hooks[index];
}
function isCallback<T, C extends Function>(value: T | C): value is C {
  return typeof value === "function";
}
export function useImperativeHandle<T>(ref: Ref<T> | undefined, createHandle: () => T, dependencies?: any[]) {
  const hook = useHook({prevDeps: null});
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    setRef(ref, createHandle());
  }
}
export function useRef<T = undefined>(initialValue?: T): MutableRef<T> {
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
      if (isCallback(newState)) newState = newState(hook.current);
      if (!Object.is(hook.current, newState)) {
        hook.current = newState;
        console.log("ayaya.$component", $component)
        rerender($component);
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
  const hook = useHook({ prevDeps: null as any[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    setTimeout(callback, 0);
  }
}
//const LAYOUT_EFFECT_SYMBOL = Symbol.for("useLayoutEffect()");
export function useLayoutEffect(callback: () => void, dependencies?: any[]) {
  console.log("ayaya.useLayoutEffect", {callback, dependencies});
  const hook = useHook({ prevDeps: null as any[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    $component.root.hooks.push(callback);
  }
}
export function useMemo<T>(callback: () => T, dependencies?: any[]): T {
  console.log("ayaya.useMemo", {callback, dependencies});
  const hook = useHook({ current: null as T, prevDeps: null as any[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    console.log("ayaya.useMemo.2")
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback();
  }
  return hook.current;
}
export function useCallback<T extends Function>(callback: T, _dependencies?: any[]) {
  console.log("ayaya.useCallback", {callback, _dependencies});
  const hook = useHook({ current: (() => {}) as unknown as T })
  hook.current = callback; // NOTE: you already created the lambda, might as well use it...
  return hook.current;
}
export function useId(idProp): string {
  if (idProp) throw new Error(`Not implemented: idProp`);
  console.log("ayaya.useId");
  const hook = useHook({ current: "" });
  if (hook.current === "") hook.current = String(Math.random());
  return hook.current;
}
export function useDebugValue<T>(value: T, formatter?: (value: T) => any) {
  // TODO: maybe store the debug value?
}
// TODO: more hooks?
