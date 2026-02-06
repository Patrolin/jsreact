import { FC } from "react";
import Tooltip from "../mock/Tooltip/Tooltip";

export const TooltipDemo: FC = () => {
  return (
    <Tooltip title="world">
      <span>hello</span>
    </Tooltip>
  );
};
