import React from "react";

type ContextType = string;
export const MyContext = React.createContext("example" as ContextType);
export class ComponentClassDemo extends React.Component {
  static contextType = MyContext;
  declare context: ContextType;
  state = { foo: 1 };
  render() {
    if (this.state.foo === 1) this.setState({ foo: 2 });
    console.log("React.Component state:", this.state);
    console.log("React.Component context:", this.context);
    return "hello world";
  }
}
