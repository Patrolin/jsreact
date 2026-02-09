import React, { FC } from "react";

// MyContext
type ContextType = string;
const MyContext = React.createContext("123" as ContextType);

// timeline
let timelineName = import.meta.env.MODE;
if (timelineName === "development") {
  timelineName = "jsreact";
}
const timeline = { lines: [`-- ${timelineName} timeline --`] };
requestAnimationFrame(() => {
  setTimeout(() => console.log(timeline.lines.join("\n")), 1000);
});

// MyComponentClass
type Props = { name: string };
class MyComponentClass extends React.Component<Props> {
  static contextType = MyContext;
  declare context: ContextType;
  state = { foo: 1 };
  componentDidMount(): void {
    const { name } = this.props;
    timeline.lines.push(`${name}.componentDidMount()`);
  }
  componentDidUpdate(_prevProps: Readonly<Props>, _prevState: Readonly<{}>, _snapshot?: any): void {
    const { name } = this.props;
    timeline.lines.push(`${name}.componentDidUpdate()`);
  }
  render() {
    if (this.state.foo === 1) this.setState({ foo: 2 });
    const { name } = this.props;
    timeline.lines.push(`${name}.render()`);
    return (
      <div>
        state: {JSON.stringify(this.state)}, context: {this.context}
      </div>
    );
  }
}

// ComponentClassDemo
export const ComponentClassDemo: FC = () => {
  return (
    <MyContext value="321">
      <MyComponentClass name="foo" />
      <MyComponentClass name="bar" />
    </MyContext>
  );
};
