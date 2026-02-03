# jsreact
A reimplementation of React that doesn't allow multiple rerenders per frame.

## Install
1) Copy `src/jsreact` into your project.
2) In `tsconfig.json`, add:
    ```json
      "jsx": "react-jsx",
      "jsxImportSource": "src/jsreact",
    ```

## Usage
1) In `index.html`, add:
    ```html
      <script type="module" src="/src/index.tsx"></script>
    ```
2) In `src/index.tsx`:
    ```ts
    import { FC, renderRoot, useState } from "src/jsreact/jsreact.mts";
    import "src/style.css";

    const App: FC = () => {
      const [state, setState] = useState(0);
      return (<>
        <span>{state}</span>
        <button onClick={() => setState(state + 1)}>+1</span>
      </>);
    }
    renderRoot(<App />, () => document.querySelector("#app"));
    ```

TODO: build into `.js` and `.d.ts`

## dev
- Run locally: `npm start`
- Build for release: `npm run build-windows` or `npm run build-linux`
