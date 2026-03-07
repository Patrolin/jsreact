import { TextField, TextFieldProps } from "@mui/material";
import { FC, memo, useRef } from "react";

/** FastTextField v4
 * - static event handlers
 * - memoize on props, and deep equals on `style`, `sx`
 * - 
 */
export const FastTextField: FC<TextFieldProps> = (props) => {
  // cache event listeners
  const cache = useRef({
    staticEventHandlers: {} as Record<string, (...args: any) => void>,
    currentEventHandlers: {} as Record<string, (...args: any) => void>,
    didBlur: false,
    wasFilled: Boolean(props.value),
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
  const env = import.meta.env;
  const SLOW_MEMO = "JSREACT_SLOW_MEMO" in env && env.JSREACT_SLOW_MEMO === "true";
  /* NOTE: MUI TextField needs to rerender twice if you change whether the value is filled... */
  const wasFilled = cache.current.wasFilled && !SLOW_MEMO;
  cache.current.wasFilled = Boolean(props.value);
  /* NOTE: MUI TextField needs to rerender an extra time after blur */
  const didBlur = cache.current.didBlur && !SLOW_MEMO;
  return <FastTextFieldMemo {...mappedProps} wasFilled={wasFilled} didBlur={didBlur} />;
};
const FastTextFieldMemo = memo(
  (props: TextFieldProps & { wasFilled: boolean; didBlur: boolean }) => {
    const { wasFilled, didBlur, ...rest } = props;
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
  for (const k of keys.keys()) if (!deepEquals(a[k], b[k])) return false;
  return true;
}
