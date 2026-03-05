import { TextField, TextFieldProps } from "@mui/material";
import { FC, memo, useRef } from "react";

/** FastTextField v4
 * - static event handlers
 * - memoize on props, and deep equals on `style`, `sx`
 */
export const FastTextField: FC<TextFieldProps> = (props) => {
  // cache event listeners
  const cache = useRef({
    staticEventHandlers: {} as Record<string, (...args: any) => void>,
    currentEventHandlers: {} as Record<string, (...args: any) => void>,
    didBlur: false,
  });
  const mappedProps = {} as Record<string, any>;
  mappedProps.onBlur = cache.current.staticEventHandlers.onBlur =
    cache.current.staticEventHandlers.onBlur ??
    ((event: FocusEvent) => {
      cache.current.didBlur = true;
      cache.current.currentEventHandlers.onBlur?.(event);
    });
  for (const k of Object.keys(props)) {
    if (k.startsWith("on")) {
      mappedProps[k] = cache.current.staticEventHandlers[k] =
        cache.current.staticEventHandlers[k] ?? ((...args: any) => cache.current.currentEventHandlers[k](...args));
    } else {
      mappedProps[k] = (props as Record<string, any>)[k];
    }
  }
  // update metadata
  for (const k of Object.keys(cache.current.staticEventHandlers)) {
    cache.current.currentEventHandlers[k] = (props as Record<string, any>)[k];
  }
  const didBlur = cache.current.didBlur; /* NOTE: MUI TextField needs to rerender an extra time after blur */
  cache.current.didBlur = false;
  return <FastTextFieldMemo {...mappedProps} didBlur={didBlur} />;
};
const FastTextFieldMemo = memo(
  (props: TextFieldProps & { didBlur: boolean }) => {
    const { didBlur, ...rest } = props;
    console.log("FastTextFieldMemo");
    return <TextField {...rest} />;
  },
  (a: Record<string, any>, b: Record<string, any>) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
    return Array.from(keys).every((k) => {
      if (k === "style" || k === "sx") return deepEquals(a[k], b[k]);
      return Object.is(a[k], b[k]);
    });
  }
);
function deepEquals(a: any, b: any): boolean {
  if (typeof a !== "object" || typeof b !== "object") return Object.is(a, b);
  const keys = new Set([...Object.keys(a), ...Object.keys(a)]);
  return Array.from(keys).every((k) => {
    return deepEquals(a[k], b[k]);
  });
}
