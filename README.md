# jsreact
A reimplementation of React that disallows multiple rerenders per frame.

- [How is this achieved?](#how-is-this-achieved-)
- [Install](#install-)
- [Usage](#usage-)
- [Benchmarks](#benchmarks-)
- [Dev](#dev-)

## How is this achieved? [⤴](#jsreact)
1) If you call multiple things that want to rerender, for example:
    ```tsx
      const [name, setName] = useState("");
      const [date, setDate] = useState(new Date());
      return (
        <button onClick={() => {
          setName("foo");
          setDate(new Date());
        }}>
          Click me!
        </button>
      );
    ```
    Then they get batched together into a single rerender (same as React).

2) If you try to render multiple times per frame, for example:
    ```tsx
      const [state, setState] = useState(0);
      useLayoutEffect(() => {
        if (state % 10 !== 0) setState(state + 1);
      });
    ```
    Then, after the initial render, subsequent renders are scheduled on the next monitor frame via `requestAnimationFrame()`.

### But doesn't this break buttons and inputs? [⤴](#jsreact)
No, take the following code for a button:
```tsx
  const [state, setState] = useState(0);
  return (
    <button onClick={() => setState(state + 1)}>
      state: {state}
    </button>
  );
```
The slowest refresh rate of a monitor is 30Hz (or 20Hz for ancient CRTs), while the fastest a human can reasonably click is ~10 times per second, this allows us to do at least 3 renders in between mouse clicks - plenty of time to update the onClick (technically you could also do a `onClick={() => setState((currentState) => currentState + 1)}`, which updates instantly).

Now take this code for a text input:
```tsx
  const [username, setUsername] = useState("");
  return (<>
    <span>username: {username}</span>
    <input onChange={(event) => setUsername(event.target.value)} />
  </>);
```
Since the browser updates `event.target.value` instantly, we always get the correct value, which we schedule for the next render in `setUsername()`.

### But doesn't this break existing React libraries? [⤴](#jsreact)
Only visually, we will still rerender next frame if necessary, but you should consider it a bug in your code if you render something with partially updated state:
  - MUI Popper expects the render to be aborted by React and rerendered immediately, so here it displays incorrectly the first time for 1 monitor frame, but you can hide it with css:
    ```css
    .MuiPopper-root:not([data-popper-placement]) {
      visibility: hidden;
    }
    ```

TODO: fix race condition with MUI Tooltip component (MUI Popper currently works...)

## Benchmarks [⤴](#jsreact)
For serving a basic page with some `<a>` links (`src/docs/index.tsx`) on localhost, the initial render takes 330 ms:
  - jsreact takes 6 ms (3.5 ms of which is waiting on the browser)
  - the vite bundler takes 22 ms to bundle the css
  - the remaining 302 ms is the solely the browser's fault

Both React and Preact have very similar numbers here.

TODO: make a benchmark with lots of MUI TextFields

## Install [⤴](#jsreact)
1) Copy `src/jsreact` into your project.
2) In `tsconfig.json`, add:
    ```json
      "jsx": "react-jsx",
      "jsxImportSource": "react",
      "types": ["@types/react"],
    ```
3) In your bundler, e.g. `vite.config.ts`, add:
    ```ts
      { find: "react", replacement: path.resolve(__dirname, "src/jsreact") },
      { find: "react-dom", replacement: path.resolve(__dirname, "src/jsreact/react-dom") },
    ```

## Usage [⤴](#jsreact)
1) In `index.html`, add:
    ```html
      <script type="module" src="/src/index.tsx"></script>
    ```
2) In `src/index.tsx`:
    ```ts
    import { FC, useState } from "react";
    import { createRoot } from "react-dom/client";
    import "src/style.css";

    const App: FC = () => {
      const [state, setState] = useState(0);
      return (<>
        <span>{state}</span>
        <button onClick={() => setState(state + 1)}>+1</span>
      </>);
    }
    const root = createRoot(document.querySelector("#app")!);
    root.render(<App />);
    ```

## dev [⤴](#jsreact)
  - Run locally: `npm start`
  - Build for release: `npm run build-windows` or `npm run build-linux`

TODO: build into `.js` and `.d.ts` \
TODO: write a script runner instead of split commands...
