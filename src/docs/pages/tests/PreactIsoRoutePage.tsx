import { useLocation } from "preact-iso";
import { FC } from "react";

export const PreactIsoRoutePage: FC = () => {
  const { route } = useLocation();
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button onClick={() => route("/")}>push</button>
      <button onClick={() => route("/", true)}>replace</button>
    </div>
  );
};
