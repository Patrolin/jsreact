import useForkRef from "../../../mock/mui-utils/useForkRef";
import React, { useState } from "react";

type ForkRefComponentProps = {
  ref: React.Ref<HTMLDivElement>;
};
const ForkRefComponent: React.FC<ForkRefComponentProps> = (props) => {
  const { ref } = props;
  const baseRef: React.Ref<HTMLDivElement> = (...args) => {
    console.log("ayaya.baseRef", ...args);
  };
  const handleRefs = useForkRef(ref, baseRef);
  return <div ref={handleRefs}>Foo</div>;
};

export const MUI_useForkRefPage: React.FC = () => {
  const [state, setState] = useState({foo: 1});
  console.log("ayaya.reload");
  const [show, setShow] = useState(false);
  const userRef: React.Ref<HTMLDivElement> = (...args) => {
    console.log("ayaya.userRef", ...args);
    return () => {
      console.log("ayaya.userRef.cleanup", ...args);
    }
  };
  return (
    <div>
      <button onClick={() => setState({...state})}>Empty change</button>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && <ForkRefComponent ref={userRef} />}
    </div>
  );
};
