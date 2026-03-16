import { BigFormPage } from "./pages/benchmarks/BigFormPage";
import { BigFormPageWithMemo } from "./pages/benchmarks/BigFormPageWithMemo";
import { BooleanPage } from "./pages/tests/BooleanPage";
import { ComponentClassPage } from "./pages/tests/ComponentClassPage";
import { MemoComponentPage } from "./pages/tests/MemoComponentPage";
import { MUIX_DatePickerPage } from "./pages/tests/mui-x/MUIX_DatePickerPage";
import { MUI_ButtonPage } from "./pages/tests/mui/MUI_ButtonPage";
import { MUI_CheckboxPage } from "./pages/tests/mui/MUI_CheckboxPage";
import { MUI_ControlledInputPage } from "./pages/tests/mui/MUI_ControlledInputPage";
import { MUI_TextAreaPage } from "./pages/tests/mui/MUI_TextAreaPage";
import { MUI_PopperPage } from "./pages/tests/mui/MUI_PopperPage";
import { MUI_PortalPage } from "./pages/tests/mui/MUI_PortalPage";
import { MUI_RadioPage } from "./pages/tests/mui/MUI_RadioPage";
import { MUI_SliderPage } from "./pages/tests/mui/MUI_SliderPage";
import { MUI_StackPage } from "./pages/tests/mui/MUI_StackPage";
import { MUI_SwitchPage } from "./pages/tests/mui/MUI_SwitchPage";
import { MUI_TooltipPage } from "./pages/tests/mui/MUI_TooltipPage";
import { MUI_useForkRefPage } from "./pages/tests/mui/MUI_useForkRefPage";
import { ReactIsTestPage } from "./pages/tests/react-is/ReactIs_TestPage";
import { RTG_CSSTransitionPage } from "./pages/tests/rtg/RTG_CSSTransitionPage";
import { RTG_TransitionGroupPage } from "./pages/tests/rtg/RTG_TransitionGroupPage";
import { RTG_TransitionPage } from "./pages/tests/rtg/RTG_TransitionPage";
import { SubmitCorrectnessTest } from "./pages/tests/SubmitCorrectnessTest";
import { PreactIsoRoutePage } from "./pages/tests/PreactIsoRoutePage";
import { RHF_TestPage } from "./pages/tests/react-hook-form/RHF_TestPage";
import { UseSyncExternalStorePage } from "./pages/tests/UseSyncExternalStorePage";
import { BigTablePage } from "./pages/benchmarks/BigTablePage";
import { BigTablePageWithHTMLElements } from "./pages/benchmarks/BigTablePageWithHTMLElements";

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
    path: "/submitCorrectness",
    label: "Submit correctness",
    component: SubmitCorrectnessTest,
  },
  {
    path: "/componentClass",
    label: "React.Component class",
    component: ComponentClassPage,
  },
  {
    path: "/memo",
    label: "React.memo()",
    component: MemoComponentPage,
  },
  {
    path: "/useSyncExternalStore",
    label: "React.useSyncExternalStore()",
    component: UseSyncExternalStorePage,
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
    path: "/transitionGroup",
    label: "react-transition-group TransitionGroup",
    component: RTG_TransitionGroupPage,
  },
  {
    path: "/react-is",
    label: "react-is test",
    component: ReactIsTestPage,
  },
  {
    path: "/route",
    label: "preact-iso route()",
    component: PreactIsoRoutePage,
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
    path: "/radio",
    label: "MUI Radio",
    component: MUI_RadioPage,
  },
  {
    path: "/switch",
    label: "MUI Switch",
    component: MUI_SwitchPage,
  },
  {
    path: "/checkbox",
    label: "MUI Checkbox",
    component: MUI_CheckboxPage,
  },
  {
    path: "/slider",
    label: "MUI Slider",
    component: MUI_SliderPage,
  },
  {
    path: "/textField",
    label: "MUI TextField",
    component: MUI_TextAreaPage,
  },
  {
    path: "/stack",
    label: "MUI Stack",
    component: MUI_StackPage,
  },
  {
    path: "/forkRef",
    label: "MUI useForkRef()",
    component: MUI_useForkRefPage,
  },
  {
    path: "/controlledInput",
    label: "MUI controlled input",
    component: MUI_ControlledInputPage,
  },
  {
    path: "/muix-datePicker",
    label: "MUI X DatePicker",
    component: MUIX_DatePickerPage,
  },
  {
    path: "/rhf",
    label: "react-hook-form",
    component: RHF_TestPage,
  },
  {
    path: "/benchmarks/bigForm",
    label: "Big form",
    component: BigFormPage,
  },
  {
    path: "/benchmarks/bigForm/memo",
    label: "Big form with memo()",
    component: BigFormPageWithMemo,
  },
  {
    path: "/benchmarks/bigTable",
    label: "Big table",
    component: BigTablePage,
  },
  {
    path: "/benchmarks/bigTable/html",
    label: "Big table with HTML elements",
    component: BigTablePageWithHTMLElements,
  },
];
