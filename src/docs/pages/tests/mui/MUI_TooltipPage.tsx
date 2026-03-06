import Tooltip from "@mui/material/Tooltip";
import { FC } from "react";

export const MUI_TooltipPage: FC = () => {
  return (
    <Tooltip title="world!" arrow>
      <button>Hello</button>
    </Tooltip>
  );
};
