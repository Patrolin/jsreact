import React, { FC, useEffect, useState } from "react";

const SomeComponent = () => {
  useEffect(() => {
    console.log("useEffect() setup");
    return () => {
      console.log("useEffect() cleanup");
    };
  });
  return <span>hello</span>;
};

const MyContext = React.createContext(0);
/** Test showing/hiding a Fragment component */
export const BooleanPage: FC = () => {
  const [state, setState] = useState(0);
  console.log("button!!!");
  return (
    <div>
      {state % 3 !== 0 && (
        <>
          <SomeComponent />
        </>
      )}
      <button
        onMouseUp={() => {
          console.log("button.onMouseUp()");
          setState(state + 1);
        }}
        onClick={() => {
          console.log("button.onClick()");
          setState(state + 1);
        }}
      >
        +1
      </button>
      <MyContext value={state}>
        <MyContext.Consumer>{(value) => value}</MyContext.Consumer>
      </MyContext>
    </div>
  );
};
