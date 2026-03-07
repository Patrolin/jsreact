import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import { FC, useState } from "react";

export const MUI_CheckboxPage: FC = () => {
  type Option = { value: number; label: string };
  const OPTIONS: Option[] = [
    { value: 0, label: "Foo" },
    { value: 1, label: "Bar" },
  ];
  const [values, setValues] = useState({} as Record<Option["value"], boolean | undefined>);
  return (
    <FormGroup>
      {OPTIONS.map((option, i) => (
        <FormControlLabel
          key={i}
          value={option.value}
          checked={values[option.value] ?? false}
          onChange={(_e, checked) => {
            setValues({
              ...values,
              [option.value]: checked,
            });
          }}
          control={<Checkbox size="small" />}
          label={option.label}
        />
      ))}
    </FormGroup>
  );
};
