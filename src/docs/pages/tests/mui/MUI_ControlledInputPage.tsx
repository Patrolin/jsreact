import { TextField } from "@mui/material";
import { FC, useState } from "react";

export const MUI_ControlledInputPage: FC = () => {
  const [value, setValue] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <TextField value={value} placeholder="MUI" />
      <input value={value} placeholder="HTML" />
      <button onClick={() => setValue("A")}>Set to "A"</button>
      <button onClick={() => setValue("foo")}>Set to "foo"</button>
    </div>
  );
};
