import { TextField } from "@mui/material";
import { FC, useState } from "react";

export const BigForm: FC = () => {
  const [value, setValue] = useState("");
  return <TextField variant="outlined" value={value} onChange={(event) => setValue(event.target.value)} />;
};
