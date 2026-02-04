import React, { FC, ReactNode, useState } from "react";
import { render } from "react-dom";
import "./style.css";
import Portal from "./mock/Portal";

const App: FC<{ foobar: string }> = () => {
  // boolean test
  /*const [state, setState] = useState(0);
  return (
    <div>
      {state % 2 == 1 && <span>hello</span>}
      <button onClick={() => setState(state + 1)}>+1</button>
    </div>
  );*/
  //return <ATooltip title="hello">world</ATooltip>;

  // portal test
  const [show, setShow] = React.useState(false);
  const container = React.useRef(null);
  const handleClick = () => {
    setShow(!show);
  };
  return (
    <main>
      <button type="button" onClick={handleClick}>
        Click me
      </button>
      <div style={{ padding: 4, border: "1px solid black" }}>
        It looks like I will render here.
        {show && (
          <Portal container={() => container.current!}>
            <span>But I actually render here!</span>
          </Portal>
        )}
      </div>
      <aside style={{ padding: 4, border: "1px solid black" }} ref={container} />
    </main>
  );
  //return (
  //  /*<MyContext.Provider value={String(`--${state}`)}>
  //    <MyContext.Consumer key={state}>{(v) => <span>{v}</span>}</MyContext.Consumer>
  //  */
  //  <div className="hello world" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
  //    <div>hello</div>
  //    <Button>woo</Button>
  //    {/*<Typography>
  //      <span>world</span>
  //    </Typography>*/}
  //    {/*<button style={{ color: "black" }} onClick={() => setState(state - 1)}>
  //      -1
  //    </button>
  //    <button style={{ color: "black" }} onClick={() => setState(state + 1)}>
  //      +1
  //    </button>*/}
  //    {/*{Array(Math.max(0, state))
  //        .fill(undefined)
  //        .map((_, i) => (
  //          <h1 key={i}>state: {state}</h1>
  //        ))}
  //      {["foo", "bar"].map((v) => (
  //        <span>{v}</span>
  //      ))}*/}
  //  </div>
  //  /*</MyContext.Provider>*/
  //);
};
render(<App foobar="" />, document.querySelector("#app")!);
