import { createContext, FC, Fragment, PropsWithChildren } from "../jsreact";

// router
type RouterProps = {};
export const Router: FC<PropsWithChildren<RouterProps>> = (props) => {
  const {children} = props;
  if (!Array.isArray(children)) return;
  for (let child of children) {
    console.log("ayaya.child", child);
  }
  return undefined;
}

type RouteProps = {path?: string; default?: boolean, component: React.JSXElementConstructor<any>};
export const Route = Fragment as FC<RouteProps>;

// LocationProvider
export const LocationProvider = createContext(undefined) as FC;
export function useLocation() {
  throw new Error("useLocation()");
}