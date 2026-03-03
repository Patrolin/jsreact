import ReactDOM from "react-dom";
import React, { Fragment } from "react";
import { isContextConsumer, isContextProvider, isForwardRef, isFragment, isMemo, isPortal, typeOf } from "react-is";

const ForwardRefComponent = React.forwardRef(() => {
  return "ForwardRefFC";
});
const MemoComponent = React.memo(() => {
  return "memo";
});
const SomeContext = React.createContext(null as string | null);

type Test = {
  name: string;
  value: React.ReactElement;
  passed: (v: React.ReactElement) => boolean;
};
export const ReactIsTestPage: React.FC = () => {
  const tests: Test[] = [
    { name: "portal", value: ReactDOM.createPortal("foobar", document.body), passed: isPortal },
    { name: "fragment", value: <></>, passed: isFragment },
    { name: "fragment2", value: <Fragment />, passed: isFragment },
    { name: "memo", value: <MemoComponent />, passed: isMemo },
    { name: "forwardRef", value: <ForwardRefComponent />, passed: isForwardRef },
    { name: "provider", value: <SomeContext value="" />, passed: isContextProvider },
    { name: "provider2", value: <SomeContext.Provider value="" />, passed: isContextProvider },
    { name: "consumer", value: <SomeContext.Consumer>{(value) => value}</SomeContext.Consumer>, passed: isContextConsumer },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {tests.map((test, i) => {
        const passed = test.passed(test.value);
        console.log(test.value, typeof test.value);
        return (
          <span key={i}>
            {test.name}: {passed ? "✅" : `❌ ${String(typeOf(test.value))}`}
          </span>
        );
      })}
    </div>
  );
};
