import { TextField } from "@mui/material";
import { ChangeEvent, FC, useState } from "react";

const TEXT_FIELD_COUNT = 120;
export const BigForm: FC = () => {
  const [values, setValues] = useState(
    Array(TEXT_FIELD_COUNT)
      .fill(undefined)
      .map((_) => "")
  );
  return Array(120)
    .fill(undefined)
    .map((_, i) => {
      const value = values[i];
      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValues = [...values];
        newValues[i] = event.target.value;
        setValues(newValues);
      };
      return <TextField style={{ marginTop: 8 }} label={`Text ${i + 1}`} variant="outlined" value={value} onChange={onChange} />;
    });
};
