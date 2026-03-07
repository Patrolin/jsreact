import { FC, useState } from "react";

export const SubmitCorrectnessTest: FC = () => {
  const [username, setUsername] = useState("");
  const start = performance.now();
  while (performance.now() - start < 1000) {}
  return (
    <div style={{ padding: 8 }}>
      <input
        onChange={(event) => {
          console.log("onChange", event.target.value);
          setUsername(event.target.value);
        }}
      />
      <button onClick={() => console.log(username)}>Submit</button>
    </div>
  );
};
