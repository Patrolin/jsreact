export * from "./jsreact";
import * as JsReact from "./jsreact";
//const React = new Proxy(JsReact, {
//  get(target, prop: string) {
//    throw new Error(`PROXY: React.${String(prop)} is not yet implemented in jsreact`);
//  }
//})
export default JsReact;
