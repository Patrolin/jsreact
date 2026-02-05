import React, { FC } from "react";
import Popper from "../mock/Popper/Popper";

export const PopperDemo: FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  return (
    <div>
      <span>hello</span>
      <button aria-describedby={id} type="button" onClick={handleClick}>
        Toggle Popper
      </button>
      {/*<Popper id={id} open={open} anchorEl={anchorEl}>
        <div style={{ background: "gray" }}>The content of the Popper.</div>
      </Popper>*/}
    </div>
  );
};
