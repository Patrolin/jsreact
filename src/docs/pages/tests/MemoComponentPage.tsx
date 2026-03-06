import { styled, unstable_memoTheme } from "@mui/material";
import { FC, memo, useState } from "react";
import RadioButtonCheckedIcon from "@/docs/mock/mui-material/internal/svg-icons/RadioButtonChecked";

let i = 0;
const MemoComponent = memo(() => String(++i));
export const MemoComponentPage: FC = () => {
  const [state, setState] = useState(1);
  return (
    <>
      <MemoComponent />
      <button onClick={() => setState(state + 1)}>rerender(): {state}</button>
      <div style={{ position: "relative", width: 24, height: 24 }}>{state%2 === 0 ? checkedIcon : uncheckedIcon}</div>
    </>
  );
};

const RadioButtonIconDot = styled(RadioButtonCheckedIcon, {
  name: "MuiRadioButtonIcon",
})(
  unstable_memoTheme(({ theme }) => ({
    left: 0,
    position: "absolute",
    transform: "scale(0)",
    transition: theme.transitions.create("transform", {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.shortest,
    }),
    variants: [
      {
        props: { checked: true },
        style: {
          transform: "scale(1)",
          transition: theme.transitions.create("transform", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.shortest,
          }),
        },
      },
    ],
  }))
);
const checkedIcon = <RadioButtonIconDot {...{checked: true} as any} />;
const uncheckedIcon = <RadioButtonIconDot />;