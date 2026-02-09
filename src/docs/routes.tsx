import { PopperDemo } from "./demos/PopperDemo";
import { PortalDemo } from "./demos/PortalDemo";
import { BooleanDemo } from "./demos/BooleanDemo";
import { ComponentClassDemo } from "./demos/ComponentClassDemo";
import { TooltipDemo } from "./demos/TooltipDemo";
import { ButtonDemo } from "./demos/ButtonDemo";
import { CSSTransitionDemo } from "./demos/CSSTransitionDemo";
import { TransitionDemo } from "./demos/TransitionDemo";

type Route = {
  path: string;
  label: string;
  component: React.ComponentType;
};
export const routes: Route[] = [
  {
    path: "/boolean",
    label: "Boolean",
    component: BooleanDemo,
  },
  {
    path: "/componentClass",
    label: "React.Component class",
    component: ComponentClassDemo,
  },
  {
    path: "/portal",
    label: "MUI Portal",
    component: PortalDemo,
  },
  {
    path: "/popper",
    label: "MUI Popper",
    component: PopperDemo,
  },
  {
    path: "/css-transition",
    label: "react-transition-group CSSTransition",
    component: CSSTransitionDemo,
  },
  {
    path: "/transition",
    label: "react-transition-group Transition",
    component: TransitionDemo,
  },
  {
    path: "/tooltip",
    label: "MUI Tooltip",
    component: TooltipDemo,
  },
  {
    path: "/button",
    label: "MUI Button",
    component: ButtonDemo,
  },
];
