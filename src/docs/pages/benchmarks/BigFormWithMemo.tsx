import { TextField, TextFieldProps } from "@mui/material";
import { FC, InputEvent, memo, useState } from "react";

function objectEquals(a: any, b: any): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
  return Array.from(keys).every((k) => {
    return Object.is(a[k], b[k]);
  });
}

const TEXT_FIELD_COUNT = 120;
const TextFieldMemo = memo(
  (props: TextFieldProps) => {
    console.log("TextFieldMemo");
    return <TextField {...props} />;
  },
  (a, b) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
    return Array.from(keys).every((k) => {
      if (k === "onInput" || k === "onChange") return true;
      if (k === "style") return objectEquals(a["style"], b["style"]);
      return Object.is(a[k], b[k]);
    });
  }
);
export const BigFormWithMemo: FC = () => {
  const [values, setValues] = useState(
    Array(TEXT_FIELD_COUNT)
      .fill(undefined)
      .map((_) => "")
  );
  return Array(TEXT_FIELD_COUNT)
    .fill(undefined)
    .map((_, i) => {
      const value = values[i];
      const onChange = (event: InputEvent<HTMLInputElement>) => {
        const newValues = [...values];
        newValues[i] = (event.target as HTMLInputElement).value;
        setValues(newValues);
      };
      return <TextFieldMemo style={{ marginTop: 8 }} label={`Text ${i + 1}`} variant="outlined" value={value} onInput={onChange} />;
    });
};
