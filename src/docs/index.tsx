import { FC } from "react";
import { render } from "react-dom";
import "./style.css";
import { routes } from "./routes";

const App: FC<{ foobar: string }> = () => {
  const currentPath = window.location.pathname || "/";
  if (currentPath === "/") {
    return (
      <div style={{ padding: 12, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {routes.map((route) => (
          <a style={{ padding: 4 }} href={route.path}>
            {route.label}
          </a>
        ))}
      </div>
    );
  } else {
    const matchingRoute = routes.find((v) => v.path === currentPath);
    if (matchingRoute) {
      return <matchingRoute.component />;
    } else {
      return "404";
    }
  }
};
render(<App foobar="" />, document.querySelector("#app")!);
