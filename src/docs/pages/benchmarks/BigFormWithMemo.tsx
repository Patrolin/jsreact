import { TextField, TextFieldProps } from "@mui/material";
import { ChangeEvent, FC, InputEvent, memo, useRef, useState } from "react";
import { __getCurrentComponent } from "@/jsreact";

function objectEquals(a: any, b: any): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
  return Array.from(keys).every((k) => {
    return Object.is(a[k], b[k]);
  });
}

const TEXT_FIELD_COUNT = 120;
const TextFieldMemo: FC<TextFieldProps> = (props) => {
  const staticEventHandlers = useRef({} as Record<string, (...args: any) => void>).current;
  const currentEventHandlers = useRef({} as Record<string, (...args: any) => void>).current;
  let mappedProps = {} as Record<string, any>;
  for (const k of Object.keys(props)) {
    if (k.startsWith("on")) {
      mappedProps[k] = staticEventHandlers[k] = staticEventHandlers[k] ?? ((...args: any) => currentEventHandlers[k](...args));
    } else {
      mappedProps[k] = (props as Record<string, any>)[k];
    }
  }
  for (const k of Object.keys(staticEventHandlers)) {
    currentEventHandlers[k] = (props as Record<string, any>)[k];
  }
  return <TextFieldMemoImplementation {...mappedProps} />;
};
const TextFieldMemoImplementation = memo(
  (props: TextFieldProps) => {
    console.log("TextFieldMemoImplementation");
    return <TextField {...props} />;
  },
  (a: Record<string, any>, b: Record<string, any>) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
    return Array.from(keys).every((k) => {
      if (k === "style") return objectEquals(a["style"], b["style"]);
      if (!Object.is(a[k], b[k])) console.log("ayaya.k", k);
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
      const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValues = [...values];
        newValues[i] = (event.target as HTMLInputElement).value;
        setValues(newValues);
      };
      return (
        <TextFieldMemo key={i} style={{ marginTop: 8 }} label={`Text ${i + 1}`} variant="outlined" value={value} onChange={onChange} />
      );
    });
};
