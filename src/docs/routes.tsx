import { BigForm } from "./pages/benchmarks/BigForm";
import { BooleanPage } from "./pages/tests/BooleanPage";
import { ComponentClassPage } from "./pages/tests/ComponentClassPage";
import { MUI_ButtonPage } from "./pages/tests/MUI_ButtonPage";
import { MUI_PopperPage } from "./pages/tests/MUI_PopperPage";
import { MUI_PortalPage } from "./pages/tests/MUI_PortalPage";
import { MUI_SliderPage } from "./pages/tests/MUI_SliderPage";
import { MUI_SwitchPage } from "./pages/tests/MUI_SwitchPage";
import { MUI_TooltipPage } from "./pages/tests/MUI_TooltipPage";
import { RTG_CSSTransitionPage } from "./pages/tests/RTG_CSSTransitionPage";
import { RTG_TransitionPage } from "./pages/tests/RTG_TransitionPage";

type Route = {
  path: string;
  label: string;
  component: React.ComponentType;
};
export const routes: Route[] = [
  {
    path: "/boolean",
    label: "Boolean",
    component: BooleanPage,
  },
  {
    path: "/componentClass",
    label: "React.Component class",
    component: ComponentClassPage,
  },
  {
    path: "/css-transition",
    label: "react-transition-group CSSTransition",
    component: RTG_CSSTransitionPage,
  },
  {
    path: "/transition",
    label: "react-transition-group Transition",
    component: RTG_TransitionPage,
  },
  {
    path: "/portal",
    label: "MUI Portal",
    component: MUI_PortalPage,
  },
  {
    path: "/popper",
    label: "MUI Popper",
    component: MUI_PopperPage,
  },
  {
    path: "/tooltip",
    label: "MUI Tooltip",
    component: MUI_TooltipPage,
  },
  {
    path: "/button",
    label: "MUI Button",
    component: MUI_ButtonPage,
  },
  {
    path: "/switch",
    label: "MUI Switch",
    component: MUI_SwitchPage,
  },
  {
    path: "/slider",
    label: "MUI Slider",
    component: MUI_SliderPage,
  },
  {
    path: "/benchmarks/bigForm",
    label: "Big form",
    component: BigForm,
  },
];
