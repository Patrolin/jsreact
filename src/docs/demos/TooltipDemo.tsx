import { FC } from "react";
import Tooltip from "../mock/Tooltip/Tooltip";

export const TooltipDemo: FC = () => {
  return (
    <Tooltip title="world!" arrow>
      <button>Hello</button>
    </Tooltip>
  );
};
