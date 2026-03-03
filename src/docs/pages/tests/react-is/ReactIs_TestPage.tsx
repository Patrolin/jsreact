import ReactDOM from "react-dom";
import React, { Fragment } from "react";
import {isForwardRef, isFragment, isMemo, isPortal, typeOf} from "react-is";

const ForwardRefComponent = React.forwardRef(() => {
  return "ForwardRefFC";
});
const MemoComponent = React.memo(() => {
  return "memo";
});

type Test = {
  name: string;
  value: React.ReactElement;
  passed: (v: React.ReactElement) => boolean;
};
export const ReactIsTestPage: React.FC = () => {
  const tests: Test[] = [
    {name: "fragment", value: <></>, passed: isFragment},
    {name: "fragment2", value: <Fragment />, passed: isFragment},
    {name: "forwardRef", value: <ForwardRefComponent />, passed: isForwardRef},
    {name: "memo", value: <MemoComponent />, passed: isMemo},
    {name: "portal", value: ReactDOM.createPortal("foobar", document.body), passed: isPortal},
  ];
  return <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
    {tests.map(test => {
      const passed = test.passed(test.value);
      console.log(test.value, typeof test.value);
      return <span>{test.name}: {passed ? "✅" : `❌ ${String(typeOf(test.value))}`}</span>
    })}
  </div>
}