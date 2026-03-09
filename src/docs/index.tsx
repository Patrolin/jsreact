import { FC } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { routes } from "./routes";
import { LocationProvider } from "@/jsreact/preact-iso";

const Router: FC = () => {
  const currentPath = window.location.pathname || "/";
  if (currentPath === "/") {
    return (
      <div style={{ padding: 12, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {routes.map((route, i) => (
          <a key={i} style={{ padding: 4 }} href={route.path}>
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
const App: FC = () => {
  return (
    <LocationProvider>
      <Router />
    </LocationProvider>
  );
};
const root = createRoot(document.querySelector("#app")!);
root.render(<App />);
