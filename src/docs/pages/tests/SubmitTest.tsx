import { FC, useState } from "react";

export const SubmitTest: FC = () => {
  const [username, setUsername] = useState("");
  const start = performance.now();
  while (performance.now() - start < 1000) {}
  return (
    <div style={{ padding: 8 }}>
      <input
        onChange={(event) => {
          console.log("ayaya.onChange", event.target.value);
          setUsername(event.target.value);
        }}
      />
      <button onClick={() => console.log(username)}>Submit</button>
    </div>
  );
};
