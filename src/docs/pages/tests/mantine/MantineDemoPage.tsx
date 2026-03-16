/* NOTE: this includes mantine styles globally, but what can you do... */
import "@mantine/core/styles.css";
import { useState } from "react";
import { Stepper, Button, Group, createTheme, MantineProvider } from "@mantine/core";
import { __getCurrentComponent } from "@/jsreact";

const theme = createTheme({
  /** Your theme override here */
});
export function MantineDemoPage() {
  const [active, setActive] = useState(1);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  console.log(__getCurrentComponent().root);
  return (
    <MantineProvider theme={theme}>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="First step" description="Create an account">
          Step 1 content: Create an account
        </Stepper.Step>
        <Stepper.Step label="Second step" description="Verify email">
          Step 2 content: Verify email
        </Stepper.Step>
        <Stepper.Step label="Final step" description="Get full access">
          Step 3 content: Get full access
        </Stepper.Step>
        <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep}>Next step</Button>
      </Group>
    </MantineProvider>
  );
}
