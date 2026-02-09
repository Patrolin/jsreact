import { CSSTransition } from "react-transition-group";
import { useState } from "react";

export function CSSTransitionDemo() {
  // TODO: there's supposed to be a delay between 'entering' and 'entered' - setup preact debug build to compare...
  // TODO: neither Preact nor React have a delay here... make a demo that actually has a delay?!
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
