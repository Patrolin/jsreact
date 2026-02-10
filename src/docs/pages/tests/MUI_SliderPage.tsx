import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import { Slider } from "@mui/material";
import { FC, useState } from "react";

export const MUI_SliderPage: FC = () => {
  const [value, setValue] = useState(0);
  return (
    <div style={{ width: 200, display: "flex", alignItems: "center" }}>
      <VolumeDown />
      <Slider style={{ margin: "0 16px" }} value={value} onChange={(_event, newValue) => setValue(newValue)} />
      <VolumeUp />
    </div>
  );
};
