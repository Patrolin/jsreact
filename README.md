# jsreact
A reimplementation of React that doesn't allow multiple rerenders per frame.

## usage
1) Copy `src/jsreact` into your project.
2) In `tsconfig.json`, add:
    ```json
      "jsx": "react-jsx",
      "jsxImportSource": "src/jsreact",
    ```
