import { FC, useState } from "react";

export const BooleanDemo: FC = () => {
  const [state, setState] = useState(0);
  return (
    <div>
      {state % 2 == 1 && (
        <>
          <span>hello</span>
        </>
      )}
      <button onClick={() => setState(state + 1)}>+1</button>
    </div>
  );
};
