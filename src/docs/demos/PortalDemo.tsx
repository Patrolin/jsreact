import { Portal } from "@mui/material";
import React, { FC } from "react";
//import Portal from "../mock/Portal";

export const PortalDemo: FC = () => {
  const [show, setShow] = React.useState(false);
  const container = React.useRef(null);
  return (
    <main>
      <button type="button" onClick={(event: React.MouseEvent) => setShow(!show)}>
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
};
