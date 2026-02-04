import { FC, ReactNode, useEffect, useState } from "react";
import { render } from "react-dom";
//import { Button } from "@mui/material";
import "./style.css";

import { createContext } from "react";
const MyContext = createContext("light");

const App: FC<{ foobar: string }> = () => {
  const [state, setState] = useState(0);
  useEffect(() => {
    if (state % 2 === 1) setState(state + 1);
  }, [state]);
  return (
    <MyContext.Provider value={String(`--${state}`)}>
      <MyContext.Consumer key={state}>{(v) => <span>{v}</span>}</MyContext.Consumer>
      <div className="hello world" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {/*<Button />*/}
        <button style={{ color: "black" }} onClick={() => setState(state - 1)}>
          -1
        </button>
        <button style={{ color: "black" }} onClick={() => setState(state + 1)}>
          +1
        </button>
        {/*{Array(Math.max(0, state))
          .fill(undefined)
          .map((_, i) => (
            <h1 key={i}>state: {state}</h1>
          ))}
        {["foo", "bar"].map((v) => (
          <span>{v}</span>
        ))}*/}
      </div>
    </MyContext.Provider>
  );
};
render(<App foobar="" />, document.querySelector("#app")!);
