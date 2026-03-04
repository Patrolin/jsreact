import { TextField, TextFieldProps } from "@mui/material";
import { ChangeEvent, FC, memo, useRef, useState } from "react";

const TEXT_FIELD_COUNT = 120;

function objectEquals(a: any, b: any): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
  return Array.from(keys).every((k) => {
    return Object.is(a[k], b[k]);
  });
}
const TextFieldMemo: FC<TextFieldProps> = (props) => {
  // cache event listeners
  const cache = useRef({
    staticEventHandlers: {} as Record<string, (...args: any) => void>,
    currentEventHandlers: {} as Record<string, (...args: any) => void>,
    didBlur: false,
  })
  const mappedProps = {} as Record<string, any>;
  for (const k of Object.keys(props)) {
    if (k.startsWith("on") && k !== "onBlur") {
      mappedProps[k] = cache.current.staticEventHandlers[k] = cache.current.staticEventHandlers[k] ?? ((...args: any) => cache.current.currentEventHandlers[k](...args));
    } else {
      mappedProps[k] = (props as Record<string, any>)[k];
    }
  }
  // update metadata
  mappedProps.onBlur = cache.current.staticEventHandlers.onBlur = cache.current.staticEventHandlers.onBlur ?? ((event: FocusEvent) => {
    cache.current.didBlur = true;
    cache.current.currentEventHandlers.onBlur?.(event);
  });
  for (const k of Object.keys(cache.current.staticEventHandlers)) {
    cache.current.currentEventHandlers[k] = (props as Record<string, any>)[k];
  }
  const didBlur = cache.current.didBlur; /* NOTE: MUI TextField needs to rerender an extra time after blur */
  cache.current.didBlur = false;
  return <TextFieldMemoImplementation {...mappedProps} didBlur={didBlur} />;
};
const TextFieldMemoImplementation = memo(
  (props: TextFieldProps & {didBlur: boolean}) => {
    const {didBlur, ...rest} = props;
    console.log("TextFieldMemoImplementation");
    return <TextField {...rest} />;
  },
  (a: Record<string, any>, b: Record<string, any>) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
    return Array.from(keys).every((k) => {
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
