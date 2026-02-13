import type React from "react";

// utils
/** Replace `document.body` with the `message` while avoiding XSS. */
function replaceDocumentWithError(message: string, throwError: boolean) {
  for (let child of document.body.childNodes) child.remove();
  const h3 = document.createElement("h3");
  h3.className = "jsreact-error";
  h3.style.fontFamily = "Consolas, sans-serif";
  h3.style.whiteSpace = "pre-wrap";
  h3.innerText = message;
  document.body.append(h3);
  if (throwError) throw new Error(message);
}
/** NOTE: bundler-agnostic env */
const env = typeof import.meta !== "undefined" && import.meta.env
  ? import.meta.env
  : (typeof process !== "undefined" ? process.env : {});
function mapEnvString<T = string|undefined>(value: string|undefined, mapping: (v: string|undefined) => T = v => v as T): T {return mapping(value)}
function parseEnvNumber(name: string, value: string|undefined): number|undefined {
  if ((value ?? "") === "") return undefined;
  const number = parseInt(value ?? "");
  if (!Number.isNaN(number)) return number;
  replaceDocumentWithError(`Invalid number in env: ${name}=${value}`, true);
}
function parseEnvBoolean(name: string, value: string|undefined): boolean|undefined {
  if ((value ?? "") === "") return undefined;
  if (value === "1" || value === "true" || value === "yes" || value === "y" || value === "Y") return true;
  if (value === "0" || value === "false" || value === "no" || value === "n" || value === "N") return true;
  replaceDocumentWithError(`Invalid boolean in env: ${name}=${value}`, true);
}

// env
const IS_PRODUCTION = parseEnvBoolean("JSREACT_IS_PRODUCTION", env.JSREACT_IS_PRODUCTION) ?? (env.MODE === "production");
const WHY_DID_YOU_RENDER_PREFIX = mapEnvString(env.JSREACT_WHY_DID_YOU_RENDER_PREFIX);
const INFINITE_LOOP_COUNT = parseEnvNumber("JSREACT_INFINITE_LOOP_COUNT", env.JSREACT_INFINITE_LOOP_COUNT);
const INFINITE_LOOP_PAUSE = parseEnvBoolean("JSREACT_INFINITE_LOOP_PAUSE", env.JSREACT_INFINITE_LOOP_PAUSE) ?? false;
const SLOW_EVENT_HANDLERS = parseEnvBoolean("JSREACT_SLOW_EVENT_HANDLERS", env.JSREACT_SLOW_EVENT_HANDLERS) ?? false;

// types
export type MutableRef<T> = {current: T};
export type Ref<T> = MutableRef<T> | ((value: T) => void) | null;
export type Value = string | bigint | number | boolean | null | undefined | void;
export type JsxKey = Value;
export type JsxProps = {children?: ReactNode, key?: JsxKey};
export type DOMProps<R = any> = JsxProps & React.DOMAttributes<R> & {
  ref?: Ref<R | null>;
  className?: string[] | string;
  style?: React.CSSProperties & {[k in `--${string}`]: number | string};
  htmlFor?: string;
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
export type ReactNodeSync = Without<ReactNode, Promise<any>>; /* TODO: we could just support promises now */
export type ValueOrVNode = Without<ReactNodeSync, Iterable<React.ReactNode>>;

// private types
type NamedExoticComponent<P = {}> = React.NamedExoticComponent<P>;
type UntypedNamedExoticComponent<P = {}> = {
  (props: P): ReactNode;
  $$typeof?: symbol;
  displayName?: NamedExoticComponent["displayName"];
}
type PortalVNode = Omit<React.ReactPortal, "key"> & { $$typeof: symbol; key?: React.ReactPortal["key"]; props: Element };
type ReactElement<P = unknown, T extends string | React.JSXElementConstructor<any> = string | React.JSXElementConstructor<any>> = React.ReactElement<P, T>;
export const REACT_ELEMENT_TYPE = Symbol.for("react.element");
export type VNode = Omit<ReactElement<DOMProps, ElementType>, "key"> & {
  $$typeof: symbol;
  key?: ReactElement["key"];
  source?: {
    fileName: string;
    lineNumber: number;
    columnNumber: number;
  } | null;
};

// legacy Component class - must be callable as both `new Component()` and `Component()`
const LEGACY_COMPONENT_STATIC_SUPPORTED: Record<string, boolean> = {
  contextType: true,
  contextTypes: false,
  defaultProps: true,
  getDerivedStateFromProps: true,
  getDerivedStateFromError: false,
};
const LEGACY_COMPONENT_SUPPORTED: Record<string, boolean> = {
  componentDidCatch: false,
  componentDidMount: true,
  componentDidUpdate: true,
  componentWillMount: false,
  componentWillReceiveProps: false,
  componentWillUpdate: false,
  componentWillUnmount: true,
  forceUpdate: true,
  getSnapshotBeforeUpdate: false,
  render: true,
  setState: true,
  shouldComponentUpdate: false,
  UNSAFE_componentWillMount: false,
  UNSAFE_componentWillReceiveProps: false,
  UNSAFE_componentWillUpdate: false,
};
type ComponentClassStatic<P = {}, S = {}, _SS = any> = {
  readonly contextType?: Context<any>;
  readonly defaultProps?: Partial<P>;
  getDerivedStateFromProps(props: P, state: S): Partial<P> | null;
};
type ComponentClass<P = {}, S = {}, SS = any> = React.Component<P, S, SS>;
type Writable<T> = { -readonly [K in keyof T]: T[K] };
export function Component<P = {}, _S = {}, _SS = any>(props: P, _context: any) {
  if (_context != null) throw new Error("Not implemented: Component(props, context)");
  this.props = props;
  this.state = this.state ?? {};
}
Component.prototype.setState = function<P = {}, S = {}, SS = any>(
  this: ComponentClass<P, S, SS>,
  _newState: S | Pick<S, keyof S> | ((prevState: Readonly<S>, props: Readonly<P>) => S | Pick<S, keyof S> | null) | null,
  _callback: any,
) {
  throw new Error("BUG: Component.setState is not set");
}
Component.prototype.forceUpdate = function<P = {}, S = {}, SS = any>(this: ComponentClass<P, S, SS>): void {
  throw new Error("BUG: Component.forceUpdate is not set");
}
Component.prototype.render = function(): ReactNode {return null}
function isComponentClass(type: ReactElement["type"]): type is (new(props: any, context: any) => React.Component<any, any>) {
  return typeof type === "function" && type.prototype != null && typeof type.prototype.render === "function";
}
/** NOTE: legacy api, we don't care if it's wrong for multiple roots (does React even support multiple roots?) */
function findDOMNode_Component(componentClass: ComponentClass, component: JsReactComponent) {
  if (component.legacyComponent === componentClass) return component;
  for (let c of Object.values(component.children)) {
    const search = findDOMNode_Component(componentClass, c);
    if (search != null) return search;
  }
}
function findDOMNode_firstElement(component: JsReactComponent) {
  const element = component.element;
  if (element != null) return element;
  const firstChild = Object.values(component.children)[0];
  if (firstChild == null) return null;
  return findDOMNode_firstElement(firstChild);
}
export function findDOMNode(componentClass: ComponentClass) {
  const component = findDOMNode_Component(componentClass, $component.root);
  return findDOMNode_firstElement(component);
}
/** NOTE: libraries use this to detect React features... */
export const version = 19;
export function isValidElement(value: any): value is ReactElement<any, any> {
  return value != null && typeof value === "object" && (value as Partial<VNode>).$$typeof === REACT_ELEMENT_TYPE;
}
export function createElement(type: VNode["type"], props: VNode["props"] | null = null, ...argChildren: ReactNode[]): VNode {
  props = props ?? {};
  const { key, ...rest } = props;
  const children = "children" in props
    ? props.children
    : argChildren.length === 1 ? argChildren[0] : (argChildren.length === 0 ? null : argChildren);
  return { $$typeof: REACT_ELEMENT_TYPE, type, key: key as VNode["key"], props: {...rest, children} };
}
export function cloneElement(vnode: ReactNodeSync, childProps: DOMProps | null): ValueOrVNode {
  if (isIterable(vnode)) throw new Error("Not implemented: cloneElement(array)");
  if (isValidElement(vnode)) {return {...vnode, props: {...vnode.props as object, ...childProps}}}
  return vnode;
}
const MEMO_SYMBOL = Symbol.for("react.memo");
type MemoComponent = NamedExoticComponent & {$$arePropsEqual: (a: object, b: object) => boolean};
export function memo(component: FC, arePropsEqual?: (a: object, b: object) => boolean) {
  if (component instanceof Component) {
    console.warn("Not implemented: React.memo(ComponentClass)");
    return component;
  };
  (component as MemoComponent).$$arePropsEqual = arePropsEqual ?? ((a: object, b: object): boolean => {
    return Object.keys(a).some(k => Object.is(a[k], b[k])) || Object.keys(b).some(k => Object.is(a[k], b[k]));
  })
  return makeExoticComponent(MEMO_SYMBOL, component);
}
// Fragment
function makeExoticComponent<P = {}>($$typeof: symbol, render?: UntypedNamedExoticComponent<PropsWithChildren<P>>): NamedExoticComponent<P> {
  if (render == null) {
    render = (props) => props.children;
    Object.defineProperty(render, "name", { value: "", configurable: true });
  }
  render.$$typeof = $$typeof;
  return render as NamedExoticComponent<P>;
}
const FRAGMENT_SYMBOL = Symbol.for("react.fragment");
export const Fragment = makeExoticComponent(FRAGMENT_SYMBOL);
// forwardRef()
export const FORWARD_REF_SYMBOL = Symbol.for("react.forward_ref");
export function forwardRef<R = any, P = {}>(render: ForwardFn<P, R>): ForwardRefComponent<P, R> {
  const forwardRefComponent = render as ForwardRefComponent<P, R>;
  forwardRefComponent.displayName = render.displayName || render.name;
  forwardRefComponent.$$typeof = FORWARD_REF_SYMBOL;
  return forwardRefComponent;
}
// createContext()
const CONTEXT_PROVIDER_SYMBOL = Symbol.for("react.context");
const CONTEXT_CONSUMER_SYMBOL = Symbol.for("react.consumer");
export function createContext<T>(defaultValue: T): Context<T> {
  const context = makeExoticComponent(CONTEXT_PROVIDER_SYMBOL) as Context<T>;
  context._currentValue = defaultValue;
  context.Provider = context;
  context.Consumer = makeExoticComponent(CONTEXT_CONSUMER_SYMBOL, ({children}) => {
    if (typeof children !== "function") throw new Error("Context.Consumer expects a function as its child");
    const value = useContext(context);
    return children(value);
  });
  return context;
}
export function useContext<T>(context: Context<T>): T {
  return context._currentValue;
}
// createPortal()
const PORTAL_SYMBOL = Symbol.for("react.portal");
export function createPortal(children: ReactNode, node: Element, key?: VNode["key"]): PortalVNode {
  return { $$typeof: REACT_ELEMENT_TYPE, type: makeExoticComponent(PORTAL_SYMBOL), key, props: node, children };
}
// React.Children
function Children$forEach(children: ReactNode, fn: (child: ReactNode) => void) {
  if (isIterable(children)) {
    for (let c of children) Children$forEach(c, fn);
  } else fn(children);
}
function Children$toArrayExcludingNullsy(children: ReactNode, out: ReactNode[]) {
  if (isIterable(children)) {
    for (let c of children) Children$toArrayExcludingNullsy(c, out);
  } else if (children != null) out.push(children);
}
function Children$toArrayExcludingNullsyAndBoolean(children: ReactNode, out: ReactNode[]) {
  if (isIterable(children)) {
    for (let c of children) Children$toArrayExcludingNullsyAndBoolean(c, out);
  } else if (children != null && typeof children != "boolean") out.push(children);
}
export const Children = {
  count(children: ReactNode): number {
    let index = 0;
    Children$forEach(children, (_child) => {index++});
    return index;
  },
  forEach(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any): undefined {
    let index = 0;
    Children$forEach(children, (child) => {fn.call(thisArg, child, index++)});
  },
  map(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any): ReactNode {
    if (children == null) return children; /* NOTE: special case per the spec */
    let index = 0;
    const acc: ReactNode[] = [];
    Children$forEach(children, (child) => {
      Children$toArrayExcludingNullsy(fn.call(thisArg, child, index++), acc);
    });
    return acc;
  },
  only(children: ReactNode): ReactNode {
    if (!isValidElement(children)) throw new Error("Children.only expects a single valid React element");
    return children;
  },
  toArray(children: ReactNode): ReactNode[] {
    const acc: ReactNode[] = [];
    Children$toArrayExcludingNullsyAndBoolean(children, acc);
    return acc;
  },
}

// implementation
type JsReactComponent = {
  /** user input */
  node: ValueOrVNode;
  /** the HTML or SVG element derived from JSX */
  element: Element | SVGElement | undefined;
  /** used to implement ComponentClass */
  legacyComponent: ComponentClass<any, any> | RootHooks | undefined;
  /** used to catch errors */
  prevHookIndex: number;
  /** used by `useId()` on RootComponent, else used to catch errors */
  hookIndex: number;
  /** `prevClassNames: string[]` for ElementComponent, else `hooks: Hook[]` */
  hooks: Hook[] | string[];
  /** the key that the component was rendered as */
  key: string;
  /** used to generate default keys for children */
  childIndex: number;
  /** map<key, ChildState> - TODO: maybe use Map for performance? */
  children: Record<string, JsReactComponent>;
  /** used to implement HTML event listeners */
  prevEventHandlers: Record<string, PrevEventHandler|undefined>;
  /** used to implement hooks and rerender() */
  root: JsReactComponent;
  /** used to implement rerender() */
  flags: number;
};
type PrevEventHandler = {
  raw: ((event: any) => void) | null | undefined;
  react: ((event: any) => void) | null | undefined;
};
const FLAGS_TAB_LOST_FOCUS = 16;
const FLAGS_RERENDERED_THIS_FRAME = 8;
const FLAGS_IS_RENDERING = 4;
const FLAGS_WILL_RERENDER = 2;
const FLAGS_GC = 1;
function _printFlags(flags: number) {
  const acc: string[] = [];
  if (flags & FLAGS_GC) acc.push("FLAGS_GC");
  if (flags & FLAGS_WILL_RERENDER) acc.push("FLAGS_WILL_RERENDER");
  if (flags & FLAGS_IS_RENDERING) acc.push("FLAGS_IS_RENDERING");
  if (flags & FLAGS_RERENDERED_THIS_FRAME) acc.push("FLAGS_RERENDERED_THIS_FRAME");
  if (flags & FLAGS_TAB_LOST_FOCUS) acc.push("FLAGS_TAB_LOST_FOCUS");
  return `{${acc.join(", ")}}`;
};
void _printFlags; /* disable unused warning */
// apply DOM props
function setFromHereString(str: string, splitChar = "\n"): Set<string> {return new Set(str.trim().split(splitChar))}
const PASSIVE_EVENTS = setFromHereString(`touchstart,touchmove,wheel`, ',');
const HTML_BOOLEAN_ATTRIBUTES = setFromHereString(`
hidden
inert
disabled
readonly
required
checked
multiple
selected
autofocus
formnovalidate
autoplay
controls
loop
muted
playsinline
open
async
defer
nomodule
reversed
allowfullscreen
itemscope
default
ismap
`);
const UNITLESS_CSS_PROPS = setFromHereString(`
animation
animationIterationCount
boxFlex
boxFlexGroup
boxOrdinalGroup
columnCount
columns
fillOpacity
flex
flexGrow
flexShrink
floodOpacity
fontSizeAdjust
fontVariationSettings
gridArea
gridColumn
gridColumnEnd
gridColumnStart
gridRow
gridRowEnd
gridRowStart
hyphenateLimitChars
initialLetter
lineClamp
lineHeight
mathDepth
maxLines
MsHyphenateLimitChars
msHyphenateLimitChars
MsHyphenateLimitLines
msHyphenateLimitLines
opacity
order
orphans
readingOrder
scale
shapeImageThreshold
stopOpacity
strokeDasharray
strokeDashoffset
strokeMiterlimit
strokeOpacity
strokeWidth
tabSize
WebkitLineClamp
webkitLineClamp
widows
zIndex
`);
type EventHandler<T = Event> = ((event: T, ...args: any[]) => void) | null | undefined;
type SyntheticEvent = Event & {
  nativeEvent: Event;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  persist: () => void;
  isPersistent: () => boolean;
};
function makeReactEventHandler(callback: EventHandler): EventHandler<SyntheticEvent> {
  if (callback == null) return callback;
  return (event: SyntheticEvent) => {
    event.nativeEvent = event;
    event.isDefaultPrevented = () => event.defaultPrevented;
    event.isPropagationStopped = () => event.cancelBubble ?? false;
    callback(event);
  }
}
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function applyDOMProps(component: JsReactComponent, desiredElementType: string, props: DOMProps, isSvgElement: boolean) {
  const {prevEventHandlers} = component;
  let element = component.element;
  if (element == null) {
    if (isSvgElement) element = document.createElementNS(SVG_NAMESPACE, desiredElementType);
    else element = document.createElement(desiredElementType);
    component.element = element;
  }
  // style
  const {ref, key, htmlFor, style, className, children, ...rest} = props;
  if (style != null) {
    for (let [k, v] of Object.entries(style)) {
      /* NOTE: pass through `--${string}` and `-${string}` directly, else add "px" to non-unitless numbers. */
      if (k.startsWith("-")) (element as HTMLElement).style.setProperty(k, v);
      else if (UNITLESS_CSS_PROPS.has(k)) (element as HTMLElement).style[k] = v;
      else (element as HTMLElement).style[k] = (typeof v === "number" ? `${v}px` : v);
    }
  }
  // className
  const prevClassList = component.hooks as string[];
  const newClassList = Array.isArray(className) ? className : (className ? className.split(" ") : []);
  for (let newClass of newClassList) element.classList.add(newClass);
  const newClassList_set = new Set(newClassList);
  for (let prevClass of prevClassList) {
    if (!newClassList_set.has(prevClass)) element.classList.remove(prevClass);
  }
  component.hooks = newClassList;
  // attributes/events
  for (let [key, value] of Object.entries(rest)) {
    if (key.startsWith("on") && key.length > 2) {
      const type = key.slice(2).toLowerCase();
      const prevEventHandler = prevEventHandlers[type];
      const rawEventHandler = props[key];
      const reactEventHandler = makeReactEventHandler(rawEventHandler);
      prevEventHandlers[type] = {raw: rawEventHandler, react: reactEventHandler};
      if (prevEventHandler?.raw == rawEventHandler) continue;
      if (prevEventHandler?.react != null) element.removeEventListener(type, prevEventHandler.react);
      if (reactEventHandler != null) {
        element.addEventListener(type, reactEventHandler, { passive: PASSIVE_EVENTS.has(type) });
      }
    } else {
      if (HTML_BOOLEAN_ATTRIBUTES.has(key)) {
        /* NOTE: considered true if present with any value */
        if (value) element.setAttribute(key, String(value ?? ""));
        else element.removeAttribute(key);
      } else {
        /* NOTE: considered true if the value is set to "true" */
        if (value != null) element.setAttribute(key, String(value ?? ""));
        else element.removeAttribute(key);
      }
    }
  }
  if (htmlFor != null) element.setAttribute("for", htmlFor);
  else element.removeAttribute("for");
}

// render
function isIterable(value: ReactNode): value is Iterable<ReactNode> {
  return typeof value !== "string" && typeof value?.[Symbol.iterator] === "function";
}
function setRef<T>(ref: Ref<T> | undefined | null, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
function jsreact$renderJsxChildren(parent: JsReactComponent, child: ReactNodeSync, childOrder: JsReactComponent[], parentIsSvgElement: boolean) {
  // recurse
  if (isIterable(child)) {
    for (let c of child) jsreact$renderJsxChildren(parent, c as ReactNodeSync, childOrder, parentIsSvgElement);
    return;
  }
  // get component state
  let keyLeft: Value;
  let keyRight: string;
  if (isValidElement(child)) {
    keyLeft = child.key;
    const childType = child.type;
    if (typeof childType === "string") {
      keyRight = childType;
    } else {
      const displayName = (childType as NamedExoticComponent).displayName;
      const $$typeof = (childType as NamedExoticComponent).$$typeof;
      keyRight = displayName || childType.name
      if ($$typeof) keyRight = keyRight ? `${keyRight}_${String($$typeof)}` : String($$typeof);
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
  if (component == null) {
    component = {
      node: undefined,
      element: undefined,
      legacyComponent: undefined,
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
  component.flags = parent.flags & FLAGS_GC; /* NOTE: parent.flags can get set concurrently, so we need to filter them here */
  // run user code
  $component = component;
  let leaf: ReactNodeSync = child;
  let desiredElementType = "";
  let context: Context<any> | undefined;
  let prevContextValue: any;
  if (!isValidElement(leaf)) {
    // Value
    if (typeof leaf === "boolean" || leaf == null) return;
    desiredElementType = "Text";
  } else {
    const leafType = leaf.type;
    if (typeof leafType === "function") {
      // function
      const $$typeof = (leafType as NamedExoticComponent).$$typeof;
      switch ($$typeof) {
      case MEMO_SYMBOL:
        const prevNode = component.node as VNode|undefined;
        if (prevNode != null && (leafType as MemoComponent).$$arePropsEqual(prevNode.props, leaf.props as object)) {
          return; /* NOTE: since we never call `jsreact$renderChildren()`, we don't have to set `FLAGS_GC` for descendants */
        }
      case CONTEXT_PROVIDER_SYMBOL:
      case CONTEXT_CONSUMER_SYMBOL:
      case FRAGMENT_SYMBOL:
      case undefined: {
        if ($$typeof === CONTEXT_PROVIDER_SYMBOL) {
          context = leafType as Context<any>;
          prevContextValue = context._currentValue;
          context._currentValue = (leaf as VNode).props.value;
        }
        if (isComponentClass(leafType)) {
          // class props
          for (let key of Object.keys(leafType)) {
            if (LEGACY_COMPONENT_STATIC_SUPPORTED[key] === false) {
              console.error("Component has:", Object.keys(leafType).filter(v => v in LEGACY_COMPONENT_STATIC_SUPPORTED))
              throw `Not implemented: Component.${key}`;
            }
          }
          const {contextType, defaultProps, getDerivedStateFromProps} = leafType as unknown as ComponentClassStatic;
          let instance = component.legacyComponent as Writable<ComponentClass>;
          const instanceProps = {...defaultProps, ...leaf.props as object};
          const instanceIsNew = instance == null;
          if (instanceIsNew) {
            instance = new leafType(instanceProps, null) as Writable<ComponentClass>;
            component.legacyComponent = instance as ComponentClass;
          }
          instance.context = contextType != null ? useContext(contextType) : undefined;
          // instance props
          for (let key of Object.keys(leafType.prototype)) {
            if (LEGACY_COMPONENT_SUPPORTED[key] === false) {
              console.error("Component has:", Object.keys(leafType.prototype).filter(v => v in LEGACY_COMPONENT_SUPPORTED))
              throw `Not implemented: Component.${key}`;
            }
          }
          // get prevState
          const prevProps = instance.props;
          const prevState = instance.state;
          // get next state
          const stateRef = useRef(prevState ?? {});
          instance.props = instanceProps;
          instance.state = stateRef.current;
          // getDerivedStateFromProps()
          if (getDerivedStateFromProps != null) {
            const diff = getDerivedStateFromProps(instance.props, stateRef.current);
            instance.state = stateRef.current = {...stateRef.current, ...diff};
          }
          // getSnapshotBeforeUpdate()
          const snapshot = undefined;
          // componentDidMount(), componentDidUpdate()
          useLegacyComponentUpdate(() => {
            if (instanceIsNew) instance.componentDidMount?.();
            else instance.componentDidUpdate?.(prevProps, prevState, snapshot);
          });
          // render
          instance.forceUpdate = () => {rerender(component)};
          instance.setState = (newState, callback) => {
            const state = stateRef.current;
            let diff = newState;
            if (typeof diff === "function") diff = diff(state, instance.props);
            const nextState = {...state, ...diff};
            if (Object.keys(nextState).some(k => !Object.is(nextState[k], state[k]))) {
              stateRef.current = nextState;
              rerender(component);
            }
            useLegacySetStateCallback(callback);
          };
          leaf = instance.render() as ReactNodeSync;
          // componentWillUnmount()
          useLegacyWillUnmount(instance.componentWillUnmount);
        } else {
          // FunctionComponent
          leaf = (leafType as FunctionComponent)(leaf.props as JsxProps);
        }
      } break;
      case FORWARD_REF_SYMBOL: {
        const {ref = null, ...rest} = leaf.props as DOMProps;
        leaf = (leafType as unknown as ForwardRefComponent)(rest, ref) as ValueOrVNode;
      } break;
      case PORTAL_SYMBOL: {
        const portal = leaf as Portal;
        leaf = portal.children as ReactNodeSync;
        component.element = portal.props as Element; /* NOTE: I don't think anyone is portaling into an svg element here */
        childOrder = [];
      } break;
      default: {
        throw new Error(String($$typeof));
      }}
      if (leaf instanceof Promise) {throw new Error("Promise<ReactNode> is not supported yet.")}
      // assert number of hooks is constant
      const {prevHookIndex, hookIndex} = component;
      if (prevHookIndex !== 0 && hookIndex !== prevHookIndex) {
        throw new RangeError(`Components must have a constant number of hooks, got: ${hookIndex}, expected: ${prevHookIndex}`);
      }
    } else if (typeof leafType === "string") {
      desiredElementType = leafType; /* HTML or SVG element */
    } else {
      throw new Error(leafType);
    }
  }
  component.node = child;
  if (desiredElementType) {
    const currentElement = component.element;
    // assert don't need key prop
    if (currentElement != null && (currentElement?.tagName?.toLowerCase() ?? "Text") !== desiredElementType) {
      let node: Partial<ValueOrVNode> = child;
      let source = "";
      if (isValidElement(child)) {
        const vnode = {...child} as VNode;
        source = vnode.source != null ? `${vnode.source?.fileName}:${vnode.source?.lineNumber}` : "";
        delete vnode.key;
        delete vnode.source;
        node = vnode;
      }
      const error = (source ? `${source}: ` : "") + "Dynamic elements must have the key prop";
      console.error(`${error}:`, {before: component.element, next: node});
      if (source) throw new Error(error); /* NOTE: only runs in dev build */
    }
    // create/use the element
    const isElementNew = currentElement == null;
    if (desiredElementType === "Text") {
      let element: Text;
      if (isElementNew) {
        element = new Text();
        component.element = element as unknown as Element;
      } else {
        element = component.element as unknown as Text;
      }
      const newText = String(leaf);
      if (newText !== element.textContent) element.textContent = newText;
      childOrder.push(component);
    } else {
      const isSvgElement = parentIsSvgElement || desiredElementType === "svg";
      applyDOMProps(component, desiredElementType, (leaf as VNode).props, isSvgElement);
      parentIsSvgElement = isSvgElement && (desiredElementType !== "foreignObject");
      if (isElementNew) setRef((child as VNode).props.ref, component.element);
      childOrder.push(component);
      childOrder = [];
    }
  }
  // render children
  const children: ReactNodeSync = leaf === child ? (leaf as VNode)?.props?.children as ReactNodeSync : leaf;
  //console.log("ayaya.leaf", {key, children});
  jsreact$renderChildren(component, children, childOrder, parentIsSvgElement);
  if (context != null) context._currentValue = prevContextValue;
}
function jsreact$renderChildren(parent: JsReactComponent, children: ReactNodeSync, childOrder: JsReactComponent[], parentIsSvgElement: boolean) {
  if (children != null) jsreact$renderJsxChildren(parent, children, childOrder, parentIsSvgElement);
  unmountUnusedChildren(parent, parent.flags & FLAGS_GC, true);
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
function unmountUnusedChildren(parent: JsReactComponent, parentGcFlag: number, removeChildrenFromDOM: boolean) {
  //console.log("ayaya.gc.parent", {
  //  parent: parent.key,
  //  parentGcFlag,
  //  children: Object.values(parent.children).map(v =>  v.key),
  //  z: parent,
  //})
  //console.log("ayaya.gc", parent.key, parent);
  for (let component of Object.values(parent.children)) {
    if (component.flags !== parentGcFlag) {
      //console.log("ayaya.gc.hit", {key: component.key, $$typeof, component, parent});
      delete parent.children[component.key]; /* delete old state */
      // run cleanup code
      for (let hook of component.hooks as Hook[]) {
        const hookType = hook.$$typeof;
        switch (hookType) {
        case undefined: {} break;
        case USE_EFFECT_SYMBOL:
        case USE_LAYOUT_EFFECT_SYMBOL: {
          (hook as UseEffect).cleanup?.();
        } break
        case USE_LEGACY_WILL_UNMOUNT_SYMBOL: {
          (hook as UseLegacyWillUnmount).callback?.call(component.legacyComponent);
        } break
        default: {
          throw new Error(String(hookType));
        }}
      }
      const element = component.element;
      if (element != null) {
        // set ref = null
        const child = component.node;
        const ref = isValidElement(child) ? (child.props as DOMProps).ref : undefined;
        setRef(ref, null);
        // remove the element
        if (removeChildrenFromDOM) {
          const $$typeof = ((component.node as VNode|null)?.type as NamedExoticComponent|null)?.$$typeof;
          if ($$typeof === PORTAL_SYMBOL) {
            removeChildrenFromDOM = true;
          } else {
            element.remove();
            removeChildrenFromDOM = false;
          }
        }
      }
      unmountUnusedChildren(component, parentGcFlag, removeChildrenFromDOM);
    }
  }
}
// debug tools
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
// entry
let renderCount = 0;
export function getRenderCount(): number {return renderCount}
function rerender(component: JsReactComponent) {
  let whyDidYouRender: string|null = null;
  if (WHY_DID_YOU_RENDER_PREFIX != null) {
    whyDidYouRender = prettifyError(`${WHY_DID_YOU_RENDER_PREFIX}Render caused by:`, whoami());
  }
  const rootComponent = component.root;
  const jsreact$renderNow = async () => {
    try {
      // print debug info
      let infiniteLoop: boolean | string = ++renderCount >= INFINITE_LOOP_COUNT! && INFINITE_LOOP_COUNT != null;
      if (whyDidYouRender != null) {
        console.debug(`${(performance.now()).toFixed(0)} ms ${whyDidYouRender}`);
      }
      if (infiniteLoop) {
        if (INFINITE_LOOP_PAUSE && renderCount === INFINITE_LOOP_COUNT) debugger; /* NOTE: the browser UI breaks if you debugger too quickly... */
        else throw `Infinite loop (${INFINITE_LOOP_COUNT}):\n${whoami()}`;
      };
      // render
      const renderStartMs = performance.now();
      rootComponent.childIndex = 0;
      rootComponent.hookIndex = 0;
      rootComponent.flags = ((rootComponent.flags ^ FLAGS_GC) & ~FLAGS_WILL_RERENDER) | FLAGS_IS_RENDERING;
      await jsreact$renderChildren(rootComponent, rootComponent.node, [], false);
      // run pending effects
      const {legacyComponentUpdates, legacySetStateCallbacks, useLayoutEffects} = rootComponent.legacyComponent as RootHooks;
      (rootComponent.legacyComponent as RootHooks) = {
        legacyComponentUpdates: [],
        legacySetStateCallbacks: [],
        useLayoutEffects: [],
      }
      for (let hook of legacyComponentUpdates) hook.callback();
      for (let hook of legacySetStateCallbacks) hook.callback();
      for (let hook of useLayoutEffects) {
          hook.cleanup?.();
          hook.cleanup = hook.setup();
      };
      // delay next render until next monitor frame
      rootComponent.flags = (rootComponent.flags & ~FLAGS_IS_RENDERING) | FLAGS_RERENDERED_THIS_FRAME;
      requestAnimationFrame(() => {
        rootComponent.flags = rootComponent.flags & ~FLAGS_RERENDERED_THIS_FRAME;
      });
      // print debug info
      const renderMs = performance.now() - renderStartMs;
      const tabHasFocus = (rootComponent.flags & FLAGS_TAB_LOST_FOCUS) === 0;
      if (renderMs > 33 && tabHasFocus) console.warn(`Render took ${renderMs.toFixed(0)} ms.`);
    } catch (error) {
      if (!IS_PRODUCTION) {
        let message = error;
        if (message instanceof Error) message = prettifyError(error, error.stack ?? "");
        replaceDocumentWithError(`Uncaught ${message}`, false);
      }
      throw error;
    }
  };
  const jsreact$rerenderLater = () => {
    if ((rootComponent.flags & FLAGS_IS_RENDERING) === 0) jsreact$renderNow();
    else requestAnimationFrame(jsreact$rerenderLater); /* NOTE: If user code renders too slowly, retry next monitor frame. */
  };
  if ((rootComponent.flags & FLAGS_WILL_RERENDER) !== 0) return; /* NOTE: batch rerenders together when possible */
  rootComponent.flags = rootComponent.flags | FLAGS_WILL_RERENDER;
  if ((rootComponent.flags & (FLAGS_IS_RENDERING | FLAGS_RERENDERED_THIS_FRAME)) === 0) {
    // fast path for initial render and infrequent rerenders
    if (SLOW_EVENT_HANDLERS) queueMicrotask(jsreact$renderNow); /* NOTE: Run before other event handlers, same as React. */
    else setTimeout(jsreact$renderNow, 1); /* NOTE: Run after other event handlers, to minimize rerenders */
  } else {
    // delay to next monitor frame if user code rerenders too quickly
    requestAnimationFrame(jsreact$rerenderLater);
  }
}
export function createRoot(parent: HTMLElement) {
  const render = (vnode: ValueOrVNode) => {
    const rootHooks: RootHooks = {
      legacyComponentUpdates: [],
      legacySetStateCallbacks: [],
      useLayoutEffects: [],
    };
    const rootComponent: JsReactComponent = {
      node: vnode,
      element: parent,
      legacyComponent: rootHooks,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
      key: "root",
      childIndex: 0,
      children: {},
      prevEventHandlers: {},
      root: undefined as unknown as JsReactComponent,
      flags: 0,
    };
    rootComponent.root = rootComponent;
    //console.log("ayaya.root", rootComponent);
    rerender(rootComponent);
    // set FLAGS_TAB_LOST_FOCUS
    if (document.visibilityState === "hidden") rootComponent.flags = rootComponent.flags | FLAGS_TAB_LOST_FOCUS;
    document.addEventListener("visibilitychange", function() {
      if (document.visibilityState === "hidden") rootComponent.flags = rootComponent.flags | FLAGS_TAB_LOST_FOCUS;
      else rootComponent.flags = rootComponent.flags & ~FLAGS_TAB_LOST_FOCUS;
  });
  }
  return {
    render(vnode: ValueOrVNode) {
      window.addEventListener("DOMContentLoaded", () => render(vnode));
    },
  }
}

// hooks
/** the current component */
let $component = {} as JsReactComponent;
/** NOTE: RootHooks must be run in the order defined here */
type RootHooks = {
  legacyComponentUpdates: UseLegacyComponentUpdate[];
  legacySetStateCallbacks: UseLegacySetStateCallback[];
  useLayoutEffects: UseLayoutEffect[];
}
type UseLegacyComponentUpdate = { callback: () => void };
function useLegacyComponentUpdate(callback: () => void) {
  const rootHooks = $component.root.legacyComponent as RootHooks;
  rootHooks.legacyComponentUpdates.push({ callback });
}
type UseLegacySetStateCallback = { callback: () => void };
function useLegacySetStateCallback(callback: (() => void) | null | undefined) {
  if (callback != null) {
    const rootHooks = $component.root.legacyComponent as RootHooks;
    rootHooks.legacySetStateCallbacks.push({ callback });
  }
}
type Hook = { $$typeof?: symbol };
type NamedHook<T = {}> = T & Required<Hook>;
export const useRerender = () => () => rerender($component);
export function useHook<T extends object>(defaultState: T = {} as T): T {
  const index = $component.hookIndex++;
  if (index >= $component.hooks.length) {
    if ($component.prevHookIndex === 0) ($component.hooks as Hook[]).push(defaultState);
    else throw new RangeError(`Components must have a constant number of hooks, got: ${$component.hookIndex}, expected: ${$component.prevHookIndex}`);
  }
  return $component.hooks[index] as T;
}
const USE_LEGACY_WILL_UNMOUNT_SYMBOL = Symbol.for("useLegacyWillUnmount()");
type UseLegacyWillUnmount = NamedHook<{ callback: ((this: ComponentClass) => void) | undefined | null }>;
export function useLegacyWillUnmount(callback: ((this: ComponentClass) => void) | undefined | null) {
  const hook = useHook<UseLegacyWillUnmount>({ $$typeof: USE_LEGACY_WILL_UNMOUNT_SYMBOL, callback });
  hook.callback = callback;
}
export function useImperativeHandle<T>(ref: Ref<T> | undefined, createHandle: () => T, dependencies?: any[]) {
  const hook = useHook({ prevDeps: null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) setRef(ref, createHandle());
}
export function useRef<T = undefined>(initialValue?: T): MutableRef<T> {
  const prevHookCount = $component.hooks.length;
  const hook = useHook({ current: undefined as T });
  if ($component.hookIndex > prevHookCount) hook.current = initialValue as T;
  return hook;
}
function isCallback<T, C extends Function>(value: T | C): value is C {
  return typeof value === "function";
}
export function useState<T = undefined>(initialState?: T | (() => T)): [T, (newValue: T) => void] {
  const prevHookCount = $component.hooks.length;
  type SetStateFunction = (newState: T | ((state: T) => T)) => void;
  const hook = useHook({ state: undefined as T, setState: (() => {}) as SetStateFunction });
  if ($component.hookIndex > prevHookCount) {
    if (isCallback(initialState)) hook.state = initialState();
    else hook.state = initialState as T;
    const setState = (newState: T | ((state: T) => T)) => {
      if (isCallback(newState)) newState = newState(hook.state);
      if (!Object.is(hook.state, newState)) {
        hook.state = newState;
        rerender($component);
      }
    };
    hook.setState = setState;
  }
  return [hook.state, hook.setState];
}
function dependenciesDiffer(prevDeps: any[] | null | undefined, deps: any[] | null | undefined): boolean {
  /* NOTE: `Object.is()` for correct NaN handling */
  return prevDeps == null || deps == null || prevDeps.length !== deps.length || prevDeps.some((v, i) => !Object.is(v, deps[i]));
}
const USE_EFFECT_SYMBOL = Symbol.for("useEffect()");
type UseEffectSetup = () => (() => void) | null | undefined | void;
type UseEffect = NamedHook<{
  cleanup: (() => void) | null | undefined | void;
  prevDeps: any[] | null;
}>
/** Run setup() at some point after this render has finished */
export function useEffect(setup: UseEffectSetup, dependencies?: any[]): void {
  const hook = useHook<UseEffect>({ $$typeof: USE_EFFECT_SYMBOL, cleanup: null, prevDeps: null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    setTimeout(() => {
      hook.cleanup?.();
      hook.cleanup = setup();
    }, 0);
  }
}
const USE_LAYOUT_EFFECT_SYMBOL = Symbol.for("useLayoutEffect()");
type UseLayoutEffect = NamedHook<UseEffect & {setup: UseEffectSetup}>
/** Run setup() after layout of this render */
export function useLayoutEffect(setup: UseEffectSetup, dependencies?: any[]) {
  const hook = useHook<UseLayoutEffect>({ $$typeof: USE_LAYOUT_EFFECT_SYMBOL, setup, cleanup: null, prevDeps: null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.setup = setup;
    const rootHooks = $component.root.legacyComponent as RootHooks;
    rootHooks.useLayoutEffects.push(hook);
  }
}
export function useMemo<T, D = any>(callback: () => T, dependencies?: D[]): T {
  const hook = useHook({ current: null as T, prevDeps: null as D[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback();
  }
  return hook.current;
}
export function useCallback<T extends Function, D = any>(callback: T, dependencies?: D[]) {
  const hook = useHook({ current: callback, prevDeps: null as D[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback;
  }
  return hook.current;
}
export function useId(_idProp_legacy: any): string {
  return String($component.root.hookIndex++);
}
export function useDebugValue<T>(_value: T, _formatter?: (value: T) => any) {
  // TODO: maybe store the debug value?
}
// TODO: more hooks?
