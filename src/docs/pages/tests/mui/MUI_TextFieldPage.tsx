//import { TextField } from "../../mock/mui-material";
import { TextField } from "@mui/material";
import { FC, useState } from "react";

export const MUI_TextFieldPage: FC = () => {
  const [lastName, setLastName] = useState("");
  const [comment, setComment] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, padding: 16 }}>
      <TextField label="First name" />
      <TextField label="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
      <TextField
        label="Comment"
        fullWidth
        multiline
        size="small"
        rows={3}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <button onClick={() => setComment(comment + "\nwow")}>New line</button>
    </div>
  );
};

// BUG: fix checkbox input
