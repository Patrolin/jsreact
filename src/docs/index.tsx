import { FC, ReactNode, useEffect, useState } from "jsreact";
import { render } from "react-dom";
//import { Button } from "@mui/material";
import "./style.css";

const App: FC<{ foobar: string }> = () => {
  const [state, setState] = useState(0);
  useEffect(() => {
    if (state % 2 === 1) setState(state + 1);
  }, [state]);
  return (
    <div className="hello world" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {/*<Button />*/}
      <button style={{ color: "black" }} onClick={() => setState(state - 1)}>
        -1
      </button>
      <button style={{ color: "black" }} onClick={() => setState(state + 1)}>
        +1
      </button>
      {Array(Math.max(0, state))
        .fill(undefined)
        .map((_, i) => (
          <h1 key={i}>state: {state}</h1>
        ))}
      {["foo", "bar"].map((v) => (
        <span>{v}</span>
      ))}
    </div>
  );
};
render(<App foobar="" />, document.querySelector("#app")!);
