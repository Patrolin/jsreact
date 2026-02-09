import { CSSTransition } from "react-transition-group";
import { useState } from "react";

export function CSSTransitionDemo() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(!show)}>Click to Toggle</button>
      <CSSTransition in={show} timeout={500} classNames="fade" unmountOnExit>
        <div>Hello, I fade in and out 👋</div>
      </CSSTransition>
    </div>
  );
}
