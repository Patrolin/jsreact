//import { TextField } from "../../mock/mui-material";
import { TextField } from "@mui/material";
import { FC, useState } from "react";

export const MUI_OutlinedInputPage: FC = () => {
  const [lastName, setLastName] = useState("");
  return <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
    <TextField style={{ marginTop: 20 }} label="First name" />
    <TextField style={{ marginTop: 20 }} label="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
  </div>;
};

// BUG: fix checkbox input