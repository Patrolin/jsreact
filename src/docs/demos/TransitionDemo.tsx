import { useState, useRef, CSSProperties } from "react";
import { Transition, TransitionStatus } from "react-transition-group";

const duration = 500;
function getStyle(state: TransitionStatus): CSSProperties {
  let transition: CSSProperties = {};
  if (state === "entering" || state === "entered") {
    transition = { opacity: 1, transform: "scale(1)" };
  } else if (state === "exiting" || state === "exited") {
    transition = { opacity: 0, transform: "scale(0.95)" };
  }
  return {
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    opacity: 0,
    transform: "scale(0.95)",
    ...transition,
  };
}
export function TransitionDemo() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      <Transition nodeRef={ref} in={show} timeout={duration} unmountOnExit>
        {(state) => {
          console.log(`state: ${state}`);
          return (
            <div ref={ref} style={getStyle(state)}>
              I transition using inline styles ✨
            </div>
          );
        }}
      </Transition>
    </div>
  );
}
