import { jsx } from "./jsx-runtime";
import type React from "react";

// env
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const INFINITE_LOOP_COUNT: number|null|undefined = null; // TODO: get these from env
const INFINITE_LOOP_PAUSE = true;

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
export type ReactNodeSync = Without<ReactNode, Promise<any>>; // TODO: we could just support promises now
export type ValueOrVNode = Without<ReactNodeSync, Iterable<React.ReactNode>>;

// private types
type NamedExoticComponent<P = {}> = React.NamedExoticComponent<P>;
type UntypedNamedExoticComponent<P = {}> = {
  (props: P): ReactNode;
  $$typeof?: symbol;
  displayName?: NamedExoticComponent["displayName"];
}
type PortalVNode = Omit<React.ReactPortal, "key"> & { $$typeof: symbol; key?: React.ReactPortal["key"] };
type ReactElement<P = unknown, T extends string | React.JSXElementConstructor<any> = string | React.JSXElementConstructor<any>> = React.ReactElement<P, T>;
export const REACT_ELEMENT_TYPE = Symbol.for('react.element');
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
export const version = 19;
// createElement()
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
  forwardRefComponent.displayName = render.displayName || render.name;
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
    Object.defineProperty(render, 'name', { value: '', configurable: true });
  }
  render.$$typeof = $$typeof;
  return render as NamedExoticComponent<P>;
}
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
export function createPortal(children: ReactNode, node: Element, key?: JsxKey): PortalVNode {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: makeExoticComponent(PORTAL_SYMBOL),
    key: key as VNode["key"],
    props: node,
    children,
  };
}
export function isValidElement(value: any): value is ReactElement<any, any> {
  return value != null && typeof value === "object" && (value as Partial<VNode>).$$typeof === REACT_ELEMENT_TYPE;
}
export function cloneElement(vnode: ReactNodeSync, childProps: DOMProps | null): ValueOrVNode {
  console.log("ayaya.cloneElement")
  if (isIterable(vnode)) throw new Error("Not implemented: cloneElement(array)");
  if (isValidElement(vnode)) {return {...vnode, props: {...vnode.props as object, ...childProps}}}
  return vnode;
}
function Children$toArray(children: ReactNode, out: ReactNode[]) {
  if (isIterable(children)) {
    for (let c of children) out.push(c);
  } else {
    out.push(children);
  }
}
export const Children = {
  count(children) {
    const acc: ReactNode[] = [];
    Children$toArray(children, acc);
    return acc.length;
  },
  forEach(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any) {
    let acc: ReactNode[] = [];
    Children$toArray(children, acc);
    acc.forEach((child, index) => fn.call(thisArg, child, index));
  },
  map(children: ReactNode, fn: (child: ReactNode, index: number) => any, thisArg?: any) {
    // map
    let acc: ReactNode[] = [];
    Children$toArray(children, acc);
    const mapped = acc.map((child, index) => fn.call(thisArg, child, index));
    // flatten
    acc = []
    Children$toArray(mapped, acc);
    return acc;
  },
  only(children: ReactNode) {
    if (!isValidElement(children)) throw new Error("Children.only expects a single element");
    return children;
  },
  toArray(children: ReactNode) {
    const acc: ReactNode[] = [];
    Children$toArray(children, acc);
    return acc.filter(v => v != null && typeof v !== "boolean"); // NOTE: this is very strange, but that's what the spec says...
  },
}

// implementation
type JsReactComponent = {
  /** user input */
  node: ValueOrVNode;
  /** HTML element derived from user input */
  element: Element | undefined;
  /** implementation detail */
  legacyComponent: ComponentClass<any, any> | undefined;
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
      node: child,
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
  component.flags = parent.flags & FLAGS_GC; // NOTE: parent.flags can get set concurrently, so we need to filter them here
  // run user code
  $component = component;
  component.node = child;
  let leaf: ReactNodeSync = child;
  let desiredElementType = "";
  let context: Context<any> | undefined;
  let prevContextValue: any;
  if (!isVNode(leaf)) {
    // Value
    if (typeof leaf === "boolean" || leaf == null) return;
    desiredElementType = "Text";
  } else {
    const leafType = leaf.type;
    if (typeof leafType === "function") {
      // function
      const $$typeof = (leafType as NamedExoticComponent).$$typeof;
      switch ($$typeof) {
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
              console.log("Component keys:", Object.keys(leafType).filter(v => v in LEGACY_COMPONENT_STATIC_SUPPORTED))
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
              console.log("Component keys:", Object.keys(leafType.prototype).filter(v => v in LEGACY_COMPONENT_SUPPORTED))
              throw `Not implemented: Component.${key}`;
            }
          }
          // confusion ending
          const prevProps = instance.props;
          const prevState = instance.state;
          const stateRef = useRef(prevState ?? {});
          instance.props = instanceProps;
          instance.state = stateRef.current;
          const {componentDidMount, componentDidUpdate, componentWillUnmount} = instance;
          // getDerivedStateFromProps()
          if (getDerivedStateFromProps != null) {
            const diff = getDerivedStateFromProps(instance.props, stateRef.current);
            instance.state = stateRef.current = {...stateRef.current, ...diff};
          }
          // getSnapshotBeforeUpdate()
          const snapshot = undefined;
          // componentDidMount(), componentDidUpdate()
          useLayoutEffect(() => {
            if (instanceIsNew) componentDidMount?.call(instance);
            else componentDidUpdate?.call(instance, prevProps, prevState, snapshot);
          });
          // componentWillUnmount()
          useWillUnmount(componentWillUnmount);
          // render
          instance.setState = (newState, callback) => {
            const state = stateRef.current;
            let diff = newState;
            if (typeof diff === "function") diff = diff(state, instance.props);
            const nextState = {...state, ...diff};
            if (Object.keys(nextState).some(k => !Object.is(nextState[k], state[k]))) {
              stateRef.current = nextState;
              rerender(component) // NOTE: this won't rerender until we have rendered everything
            }
            if (callback != null) pushRootHook(callback); // NOTE: this must run after everything else...
          };
          instance.forceUpdate = () => {rerender(component)};
          leaf = instance.render() as ReactNodeSync;
        } else {
          leaf = (leafType as FunctionComponent)(leaf.props as JsxProps); // function component
        }
      } break;
      case FORWARD_REF_SYMBOL: {
        const {ref = null, ...rest} = leaf.props as DOMProps;
        leaf = (leafType as unknown as ForwardRefComponent)(rest, ref) as ValueOrVNode;
      } break;
      case PORTAL_SYMBOL: {
        const portal = leaf as Portal;
        leaf = portal.children as ReactNodeSync;
        component.element = portal.props as Element;
        childOrder = [];
      } break;
      default:
        throw new Error(String($$typeof));
      }
    } else if (typeof leafType === "string") {
      // HTML element
      desiredElementType = leafType;
    } else {
      throw new Error(leafType);
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
      if (source) throw new Error(error); // NOTE: only runs in dev build
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
  const children: ReactNodeSync = leaf === child ? (leaf as VNode)?.props?.children as ReactNodeSync : leaf;
  console.log("ayaya.leaf", {key, children});
  jsreact$renderChildren(component, children, childOrder);
  if (context != null) context._currentValue = prevContextValue;
}
function jsreact$renderChildren(parent: JsReactComponent, children: ReactNodeSync, childOrder: JsReactComponent[]) {
  if (children != null) jsreact$renderJsxChildren(parent, children, childOrder);
  removeUnusedChildren(parent, parent.flags & FLAGS_GC, true);
  // reorder used children
  const parentElement = parent.element;
  //if (parentElement != null) console.log("ayaya.parentElement", {a: parent.element, children: childOrder.map(v => v.element)})
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
function removeUnusedChildren(parent: JsReactComponent, parentGcFlag: number, removeElement: boolean) {
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
      delete parent.children[component.key]; // delete old state
      // run cleanup code
      for (let hook of component.hooks) {
        const hookType = hook.$$typeof;
        switch (hookType) {
        case undefined: {} break;
        case USE_EFFECT_SYMBOL: {
          (hook as UseEffect).cleanup?.();
        } break
        case USE_WILL_UNMOUNT_SYMBOL: {
          (hook as UseWillUnmount).callback?.call(component.legacyComponent);
        } break
        default: {
          throw new Error(hookType);
        }}
      }
      const element = component.element;
      if (element != null) {
        // set ref = null
        const child = component.node;
        const ref = isVNode(child) ? (child.props as DOMProps).ref : undefined;
        setRef(ref, null);
        // remove the element
        if (removeElement) {
          const $$typeof = ((component.node as VNode|null)?.type as NamedExoticComponent|null)?.$$typeof;
          if ($$typeof !== PORTAL_SYMBOL) {
            element.remove();
            removeElement = false;
          }
        }
      }
      removeUnusedChildren(component, parentGcFlag, removeElement);
    }
  }
}
// debug tools
const ENABLE_WHY_DID_YOU_RENDER = ".render.leaf.gc.parent.popper.instance";
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
  let whyDidYouRender: string|undefined;
  if (ENABLE_WHY_DID_YOU_RENDER) {
    const prefix = typeof ENABLE_WHY_DID_YOU_RENDER === "string" ? ENABLE_WHY_DID_YOU_RENDER : "";
    whyDidYouRender = prettifyError(`${prefix}Render caused by:`, whoami());
  }
  const rootComponent = component.root;
  const jsreact$renderNow = () => {
    try {
      let infiniteLoop: boolean | string = ++renderCount >= INFINITE_LOOP_COUNT! && INFINITE_LOOP_COUNT != null;
      if (whyDidYouRender) console.log(whyDidYouRender);
      if (infiniteLoop) {
        if (INFINITE_LOOP_PAUSE && renderCount === INFINITE_LOOP_COUNT) debugger; // NOTE: the browser breaks if you debugger too quickly...
        else throw `Infinite loop (${INFINITE_LOOP_COUNT}):\n${whoami()}`;
      };
      // render
      rootComponent.childIndex = 0;
      rootComponent.hookIndex = 0;
      rootComponent.flags = (rootComponent.flags ^ FLAGS_GC) | FLAGS_IS_RENDERING;
      jsreact$renderChildren(rootComponent, rootComponent.node, []);
      // run layout effects
      const rootHooks = rootComponent.hooks as RootHook[];
      rootComponent.hooks = []; // NOTE: new rootHooks will be resolved next render
      for (let rootHook of rootHooks) {
        $component = rootHook.component;
        rootHook.callback();
      }
      rootComponent.hooks = [];
      rootComponent.flags = rootComponent.flags & ~FLAGS_IS_RENDERING;
    } catch (error) {
      if (!IS_PRODUCTION) {
        let message = error;
        if (message instanceof Error) message = prettifyError(error, error.stack ?? "");
        document.body.innerHTML = `<h3 class="jsreact-error" style="font-family: Consolas, sans-serif; white-space: pre-wrap">Uncaught ${message}</h3>`;
      }
      throw error;
    }
  }
  const jsreact$renderLater = () => {
    if ((rootComponent.flags & FLAGS_IS_RENDERING) === 0) {
      rootComponent.flags = rootComponent.flags & ~FLAGS_WILL_RENDER_NEXT_FRAME;
      jsreact$renderNow();
    } else requestAnimationFrame(jsreact$renderLater);
  }
  if ((rootComponent.flags & (FLAGS_IS_RENDERING | FLAGS_WILL_RENDER_NEXT_FRAME)) === 0) {
    jsreact$renderNow();
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
      legacyComponent: undefined,
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
    console.log("ayaya.root", rootComponent);
    rerender(rootComponent);
  }
  window.addEventListener("DOMContentLoaded", onLoad);
}

// hooks
/** the current component */
let $component = {} as JsReactComponent;
export const useRerender = () => () => rerender($component);
type Hook<T> = T & {$$typeof: symbol};
type RootHook = {component: JsReactComponent; callback: () => void};
function pushRootHook(callback: () => void) {
  const component = $component;
  (component.root.hooks as RootHook[]).push({ component, callback });
}
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
  return hook;
}
export function useState<T = undefined>(initialState?: T | (() => T)): [T, (newValue: T) => void] {
  const prevHookCount = $component.hooks.length;
  type SetStateFunction = (newState: T | ((state: T) => T)) => void;
  const hook = useHook({state: undefined as T, setState: (() => {}) as SetStateFunction});
  if ($component.hookIndex > prevHookCount) {
    if (isCallback(initialState)) hook.state = initialState();
    else hook.state = initialState as T;
    hook.setState = (newState: T | ((state: T) => T)) => {
      if (isCallback(newState)) newState = newState(hook.state);
      if (!Object.is(hook.state, newState)) {
        hook.state = newState;
        rerender($component);
      }
    }
  }
  return [hook.state, hook.setState];
}
function dependenciesDiffer(prevDeps: any[] | null | undefined, deps: any[] | null | undefined): boolean {
  // NOTE: `Object.is()` for correct NaN handling
  return prevDeps == null || deps == null || prevDeps.length !== deps.length || prevDeps.some((v, i) => !Object.is(v, deps[i]));
}
const USE_EFFECT_SYMBOL = Symbol.for("useEffect()");
type UseEffect = Hook<{
  cleanup: (() => void) | null | undefined | void;
  prevDeps: any[] | null;
}>
/** NOTE: prefer `useRef()` for better performance */
export function useEffect(effect: () => (() => void) | null | undefined | void, dependencies?: any[]): void {
  const hook = useHook<UseEffect>({
    $$typeof: USE_EFFECT_SYMBOL,
    cleanup: null,
    prevDeps: null,
  });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    pushRootHook(() => {
      hook.cleanup?.();
      hook.cleanup = effect();
    });
  }
}
const USE_WILL_UNMOUNT_SYMBOL = Symbol.for("useWillUnmount()");
type UseWillUnmount = { $$typeof: symbol; callback: (() => void) | undefined | null };
export function useWillUnmount(callback: (() => void) | undefined | null) {
  const hook = useHook<UseWillUnmount>({
    $$typeof: USE_WILL_UNMOUNT_SYMBOL,
    callback,
  });
  hook.callback = callback;
}
//const LAYOUT_EFFECT_SYMBOL = Symbol.for("useLayoutEffect()");
export function useLayoutEffect(callback: () => void, dependencies?: any[]) {
  //console.log("ayaya.useLayoutEffect", {callback, dependencies});
  const hook = useHook({ prevDeps: null as any[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    pushRootHook(callback);
  }
}
export function useMemo<T>(callback: () => T, dependencies?: any[]): T {
  const hook = useHook({ current: null as T, prevDeps: null as any[] | null });
  if (dependenciesDiffer(hook.prevDeps, dependencies)) {
    hook.prevDeps = [...(dependencies ?? [])];
    hook.current = callback();
  }
  return hook.current;
}
export function useCallback<T extends Function>(callback: T, dependencies?: any[]) {
  const hook = useHook({ current: callback, prevDeps: null as any[] | null });
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
