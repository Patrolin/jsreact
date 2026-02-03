import { FunctionComponent, LeafNode, Props, ReactNode, VNode } from "./jsx";
export type FC<T = {}> = FunctionComponent<T>;

type Component = {
  jsxNode: LeafNode;
  node: LeafNode;
  element: Element | undefined;
  prevHookIndex: number;
  hookIndex: number;
  hooks: any[];
  key: string;
  childIndex: number;
  children: Record<string, Component>;
  prevEvents: Record<string, ((event: any) => void) | undefined>;
  root: Component;
  /* u1 willRerenderNextFrame, u1 gc */
  flags: number;
};
// apply intrinsic props
type EventMapping = {name: string, type: string};
const EVENT_MAP: EventMapping[] = [
  {name: "onClick", type: "click"},
]
function camelCaseToKebabCase(camelCase: string) {
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
function applyJsxProps(component: Component, props: Props) {
  const {element, prevEvents} = component;
  if (element == null) return;
  if (element instanceof Text) {
    element.textContent = props.value != null ? String(props.value) : "";
  }
  const {style} = props;
  if (style != null) {
    for (let [k, v] of Object.entries(style)) {
      k = camelCaseToKebabCase(k);
      v = typeof v == "number" ? `${v}px` : v;
      (element as HTMLElement).style.setProperty(k, v);
    }
  }
  for (let {name, type} of EVENT_MAP) {
    const eventHandler = props[name];
    if (prevEvents[type] != null) element.removeEventListener(type, prevEvents[type]);
    prevEvents[type] = eventHandler;
    if (eventHandler) element.addEventListener(type, eventHandler)
  }
}

// render
function isVNode(leafNode: LeafNode): leafNode is VNode {
  return leafNode !== null && typeof leafNode === "object";
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
      jsxNode: child,
      node: child,
      element: undefined,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
      key,
      childIndex: 0,
      children: {},
      prevEvents: {},
      root: parent.root,
      flags: 1 - parent.flags,
    };
    parent.children[key] = component;
  }
  if (component.flags === parent.flags) {

  }
  component.childIndex = 0;
  component.prevHookIndex = component.hookIndex;
  component.hookIndex = 0;
  component.flags = parent.flags;
  // run user code
  $component = component;
  component.jsxNode = child;
  let node = child;
  while (isVNode(node) && typeof node.type === "function") {
    node = node.type(node.props);
  }
  node = isVNode(node) ? node : {type: "Text", key: undefined, props: {value: node}};
  component.node = node;
  const {prevHookIndex, hookIndex} = component;
  if (prevHookIndex !== 0 && hookIndex !== prevHookIndex) {
    throw new RangeError(`Components must have a constant number of hooks, got: ${hookIndex}, expected: ${prevHookIndex}`);
  }
  // create element
  let element = component.element;
  if (node.type) {
    if (element != null && (element?.tagName?.toLowerCase() ?? "Text") !== node.type) {
      let jsxNode = component.jsxNode;
      let source = "";
      if (isVNode(jsxNode)) {
        jsxNode = {...jsxNode};
        source = jsxNode.source != null ? `${jsxNode.source?.fileName}:${jsxNode.source?.lineNumber}` : "";
        delete jsxNode.key;
        delete jsxNode.source;
      }
      const error = (source ? `${source}: ` : "") + "Dynamic elements must have the key prop";
      if (source) {
        // NOTE: only runs in dev build
        document.body.innerHTML = `<h3 className="jsreact-error" style="font-family: Consolas, sans-serif">${error}.</h3>`;
      }
      console.error(`${error}:`, {before: component.element, next: jsxNode});
    };
    if (element == null) {
      if (node.type === "Text") {
        element = new Text(node.props.value) as unknown as Element;
      } else {
        element = document.createElement(node.type as string);
      }
      component.element = element;
    }
    applyJsxProps(component, node.props);
  }
  if (element != null) {
    childOrder.push(component);
    childOrder = [];
  }
  // render children
  const children = node.props.children;
  if (children != null) renderChildren(component, node.props.children, childOrder);
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
  const nextGcFlag = 1 - (component.flags & 1);
  if ((rootComponent.flags & 2) === 0) {
    rootComponent.flags = nextGcFlag | 2;
    requestAnimationFrame(() => {
      rootComponent.flags = nextGcFlag;
      rootComponent.childIndex = 0;
      renderChildren(rootComponent, rootComponent.jsxNode, []);
    });
  }
}
export function renderRoot(vnode: LeafNode, getParent: () => HTMLElement) {
  const onLoad = () => {
    const parent = getParent();
    const rootComponent: Component = {
      jsxNode: vnode,
      node: vnode,
      element: parent,
      prevHookIndex: 0,
      hookIndex: 0,
      hooks: [],
      key: "",
      childIndex: 0,
      children: {},
      prevEvents: {},
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
export function useRerender() {
  const component = $component;
  return () => _rerender(component);
}
export function useHook() {
  const index = $component.hookIndex++;
  if (index >= $component.hooks.length) {
    if ($component.prevHookIndex === 0) $component.hooks.push({});
    else throw new RangeError(`Components must have a constant number of hooks, got: ${$component.hookIndex}, expected: ${$component.prevHookIndex}`);
  }
  return $component.hooks[index];
}
export function useState<T>(defaultState: T): [T, (newValue: T) => void] {
  const hook = useHook();
  if (hook.state == null) hook.state = defaultState;
  const setState = (newState: T) => {
    hook.state = newState;
    _rerender($component.root);
  }
  return [hook.state, setState];
}
// TODO: more hooks
