import React, { FC } from "react";
import { render } from "react-dom";
import "./style.css";
import { PopperDemo } from "./demos/PopperDemo";
import { PortalDemo } from "./demos/PortalDemo";
import { BooleanDemo } from "./demos/BooleanDemo";
import { ComponentClassDemo } from "./demos/ComponentClassDemo";
import { TooltipDemo } from "./demos/TooltipDemo";

const App: FC<{ foobar: string }> = () => {
  //return <BooleanDemo />;
  //return <ComponentClassDemo />;
  //return <PortalDemo />;
  //return <PopperDemo />;
  return <TooltipDemo />;
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
