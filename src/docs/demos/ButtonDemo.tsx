import { Button } from "@mui/material";
import { FC } from "react";

export const ButtonDemo: FC = () => {
  return <Button onClick={() => console.log("Clicked!")}>Click me</Button>;
};
