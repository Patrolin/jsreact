import { createTheme, MantineProvider, TextInput } from "@mantine/core";
import { FC, InputEvent, useState } from "react";

const TEXT_FIELD_COUNT = 120;

const theme = createTheme({
  /** Put your mantine theme override here */
});
export const BigFormPageWithMantine: FC = () => {
  const [values, setValues] = useState(
    Array(TEXT_FIELD_COUNT)
      .fill(undefined)
      .map((_) => "")
  );
  return (
    <MantineProvider theme={theme}>
      {Array(TEXT_FIELD_COUNT)
        .fill(undefined)
        .map((_, i) => {
          const value = values[i];
          const onChange = (event: InputEvent<HTMLInputElement>) => {
            const newValues = [...values];
            newValues[i] = (event.target as HTMLInputElement).value;
            setValues(newValues);
          };
          return <TextInput style={{ marginTop: 8 }} label={`Text ${i + 1}`} variant="default" value={value} onInput={onChange} />;
        })}
    </MantineProvider>
  );
};
