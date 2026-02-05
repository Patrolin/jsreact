import React, { FC } from "react";
import Popper from "../mock/Popper/Popper";
import BasePopper from "../mock/Popper/BasePopper";

export const PopperDemo: FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  return (
    <div>
      <button style={{ marginLeft: 60 }} aria-describedby={id} type="button" onClick={handleClick}>
        Toggle Popper
      </button>
      <BasePopper id={id} open={open} anchorEl={anchorEl}>
        <aside style={{ background: "gray" }}>The content of the Popper.</aside>
      </BasePopper>
    </div>
  );
};
