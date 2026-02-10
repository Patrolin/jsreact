import { FC, memo, useState } from "react";

let i = 0;
const MemoComponent = memo(() => String(++i));

export const MemoComponentPage: FC = () => {
  const [state, setState] = useState(1);
  return (
    <>
      <MemoComponent />
      <button onClick={() => setState(state + 1)}>rerender(): {state}</button>
    </>
  );
};
