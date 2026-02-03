import { FC, renderRoot, useState } from "src/jsreact";
import "docs/style.css";

const App: FC = () => {
  const [state, setState] = useState(0);
  return (
    <div foobar="" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
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
renderRoot(<App />, () => document.querySelector("#app")!);
