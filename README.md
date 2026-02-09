# jsreact
A reimplementation of React that disallows multiple rerenders per frame.

- [How is this achieved?](#how-is-this-achieved-)
- [Benchmarks](#benchmarks-)
- [What we don't support](#what-we-dont-support-)
- [Install](#install-)
- [Usage](#usage-)
  - [CSS variables](#using-css-variables-)
  - [Environment variables](#environment-variables-)
- [Dev](#dev-)

## How is this achieved? [⤴](#jsreact)
1) If you rerender multiple times in a row, for example:
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
    Then the rerenders get batched together into a single render (same as React).
2) If you try to render every frame, for example:
    ```tsx
      const [state, setState] = useState(0);
      useLayoutEffect(() => {
        if (state % 10 !== 0) setState(state + 1);
      });
    ```
    Then the first render is scheduled as soon as possible,
    but subsequent renders are scheduled on different monitor frames via `requestAnimationFrame()`.
3) If your app takes too long to render (>1 monitor frame), then we stall future renders.

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
The slowest refresh rate of a monitor is 30Hz (or 20Hz for ancient CRTs), while the fastest a human can reasonably click is ~10 times per second, this allows us to do at least 3 renders in between mouse clicks - plenty of time to update the onClick (unless your app is horrendously slow, but technically you can always do a `onClick={() => setState((currentState) => currentState + 1)}`, which updates instantly).

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
No, `@mui/material` relies on `react-transition-group`, which relies on dumb legacy `Component` class apis, but it still works perfectly under jsreact,
since we force conflicting renders to happen on different frames, so each one gets its layout effects separately.

### Meaningless differences to React [⤴](#jsreact)
Here is an example timeline of how different React implementations order events:
```tsx
  return (<>
    <MyComponentClass name="foo" />
    <MyComponentClass name="bar" />
  </>);
```
|Preact                   |React                    |jsreact                  |
|-------------------------|-------------------------|-------------------------|
|foo.render()             |foo.render()             |foo.render()             |
|bar.render()             |bar.render()             |bar.render()             |
|foo.componentDidMount()  |foo.componentDidMount()  |foo.componentDidMount()  |
|bar.componentDidMount()  |bar.componentDidMount()  |bar.componentDidMount()  |
|foo.render()             |foo.render()             |foo.render()             |
|foo.componentDidUpdate() |bar.render()             |bar.render()             |
|bar.render()             |foo.componentDidUpdate() |foo.componentDidUpdate() |
|bar.componentDidUpdate() |bar.componentDidUpdate() |bar.componentDidUpdate() |

There is a defined order for the type of callback (render() -> componentDidMount()/componentDidUpdate() -> ...).
But the order between different components is not defined, and both we and React choose to group by callback type for better perfomance.

## Benchmarks [⤴](#jsreact)
For serving a basic page with some `<a>` links (`src/docs/index.tsx`) on localhost, the initial render takes 330 ms:
  - jsreact takes 6 ms (3.5 ms of which is waiting on the browser)
  - the vite bundler takes 22 ms to bundle the css
  - the remaining 302 ms is the solely the browser's fault

Both React and Preact have very similar numbers here.

TODO: make a benchmark with lots of MUI TextFields

## What we don't support [⤴](#jsreact)
1) React allows you to return `Promise<ReactNode>`:
    ```tsx
    function App: FC = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(<div>foo</div>);
        }, 1000);
      });
    }
    ```
    - This goes against everything we stand for, and will likely never be implemented.
2) Server side rendering (Why would you ever do this?):
    - You can just render in ~1 ms on the client (+ waiting to be scheduled by the browser).
    - You can do a better job of caching data on the client.
    - You have to handle button and input events on the client anyways.
    - All of the fancy animations and styles that libraries like MUI do have to happen on the client anyways.
  3) Most Legacy Component class apis:
      - We throw an exception for the ones that aren't currently implemented.
      - You probably don't need these, though we may implement more later.

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

### Using CSS variables [⤴](#jsreact)
  ```ts
    <div style={{ "--foo": "1px" }} />
  ```
  NOTE: Currently there is [a bug](https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/74499) in `@types/react`, so you also have to create a `src/types/react-css-vars.d.ts` with:
  ```ts
  import "react";
  declare module "react" {
    interface CSSProperties { [key: `--${string}`]: string|number|undefined|null }
  }
  ```

### Environment variables [⤴](#jsreact)
  ```ts
    /** Disable crashing the page when an exception is thrown during rendering,
     * defaults to `process.env.NODE_ENV === "production"`. */
    JSREACT_IS_PRODUCTION?: boolean|"";
    /** If present, log why each render happened with this prefix
     *  into the `Verbose` group via `console.debug()`. */
    JSREACT_WHY_DID_YOU_RENDER_PREFIX?: string;
    /** If number, throw an exception on the nth render
     *  and all subsequent renders. */
    JSREACT_INFINITE_LOOP_COUNT?: number|"";
    /** If true, run a `debugger;` statement before the nth render
     *  instead of throwing an exception. */
    JSREACT_INFINITE_LOOP_PAUSE?: boolean|"";
    /** If true, schedule fast renders before other event handlers instead of after.
     *  This results in more renders, which matches React behavior more closely, for example:
     *    <button onMouseUp={() => setState(state + 1)}
     *      onClick={() => setState(state + 1)}
     *    >
     *      +1
     *    </button>
     *  would increment the state by 2 instead of 1 */
    JSREACT_SLOW_EVENT_HANDLERS?: boolean|"";
  ```
  NOTE: In vite, you have to explicitly forward the env variables with:
  ```ts
    envPrefix: ["VITE_", "JSREACT_"],
  ```

## dev [⤴](#jsreact)
  - Run `src/docs` with jsreact: `npm start`
  - Run `src/docs` with preact: `npm start-preact`
  - Run `src/docs` with preact: `npm start-react`
  - Build for release: `npm run build-windows` or `npm run build-linux`

TODO: build into `.js` and `.d.ts` \
TODO: write a script runner instead of split commands...
