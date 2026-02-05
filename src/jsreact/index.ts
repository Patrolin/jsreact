export * from "./jsreact";
import * as JsReact from "./jsreact";

const React = new Proxy(JsReact, {
  get(target, prop: string) {
    console.log(`React.${prop}`);
    if (prop in target) return target[prop];
    throw new Error(`PROXY: React.${String(prop)} is not yet implemented in jsreact`);
  },
});
export default React;
