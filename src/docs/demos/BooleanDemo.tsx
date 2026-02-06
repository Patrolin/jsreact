import React, { FC, useState } from "react";

const MyContext = React.createContext(0);
/** Test showing/hiding a Fragment component */
export const BooleanDemo: FC = () => {
  const [state, setState] = useState(0);
  return (
    <div>
      {state % 2 == 1 && (
        <>
          <span>hello</span>
        </>
      )}
      <button onClick={() => setState(state + 1)}>+1</button>
      <MyContext value={state}>
        <MyContext.Consumer>{(value) => value}</MyContext.Consumer>
      </MyContext>
    </div>
  );
};
