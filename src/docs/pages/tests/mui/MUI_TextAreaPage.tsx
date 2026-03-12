import { TextField } from "@mui/material";
import { FC, useState } from "react";

export const MUI_TextAreaPage: FC = () => {
  const [comment, setComment] = useState("");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, padding: 16 }}>
      <TextField
        label="Comment"
        fullWidth
        multiline
        size="small"
        rows={3}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      <button onClick={() => setComment(`${comment}${comment ? "\n" : ""}wow`)}>New line</button>
    </div>
  );
};

// BUG: fix checkbox input
