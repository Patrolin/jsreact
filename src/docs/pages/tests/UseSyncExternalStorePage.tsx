import React, { FC } from "react";

export const UseSyncExternalStorePage: FC = () => {
  const foo = React.useSyncExternalStore(subscribe, getSnapshot);
  console.log("ayaya.UseSyncExternalStorePage");
  return (
    <div>
      <button onClick={() => externalStore.foo++}>Increment</button>
      <span>{foo}</span>
    </div>
  );
}

const externalStore = {
  foo: 1,
};
function getSnapshot() {
  console.log("ayaya.getSnapshot");
  return externalStore.foo;
}

function subscribe(callback: () => void) {
  document.body.addEventListener("click", callback);
  return () => {
    document.body.removeEventListener("click", callback);
  };
}
