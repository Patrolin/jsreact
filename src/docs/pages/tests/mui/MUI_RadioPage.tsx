import { __getCurrentComponent } from "@/jsreact";
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material";
import { FC, useId, useState } from "react";
import React from 'react'
console.log("ayaya.useInsertionEffect", React.useInsertionEffect, React.useLayoutEffect)

type Gender = "male" | "female";
export const MUI_RadioPage: FC = () => {
  const [state, setState] = useState(null as Gender | null);
  const name = useId();
  const [foo, setFoo] = useState(false);
  console.log(__getCurrentComponent().root);
  return (
    <div>
      <button onClick={() => setFoo(!foo)}>Toggle</button>
      <div style={{ display: "inline-flex", flexDirection: "column" }}>
        <input type="radio" name="foo" checked={foo} onChange={() => setFoo(true)} />
        <input type="radio" name="foo" checked={!foo} onChange={() => setFoo(false)} />
      </div>
      <FormControl style={{ margin: 8 }}>
        <FormLabel>Uncontrolled</FormLabel>
        <RadioGroup
          name={name}
          defaultValue="male"
        >
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="male" control={<Radio />} label="Male" />
        </RadioGroup>
      </FormControl>
      {/*<FormControl style={{ margin: 8 }}>
        <FormLabel>Controlled</FormLabel>
        <RadioGroup
          name={name}
          value={state}
          onChange={(event) => setState(event.target.value as Gender)}
        >
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="male" control={<Radio />} label="Male" />
        </RadioGroup>
      </FormControl>*/}
    </div>
  );
};
