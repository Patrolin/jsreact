import { Transition } from "react-transition-group";
import { useState, useRef } from "react";

export function TransitionDemo() {
  // TODO: there's supposed to be a delay between 'entering' and 'entered' - setup preact debug build to compare...
  const [inProp, setInProp] = useState(false);
  const nodeRef = useRef(null);
  return (
    <div>
      <Transition nodeRef={nodeRef} in={inProp} timeout={500}>
        {(state) => {
          console.log("state: ", state);
          return <div>{state}</div>;
        }}
      </Transition>
      <button onClick={() => setInProp(!inProp)}>Click to Toggle</button>
    </div>
  );
}
