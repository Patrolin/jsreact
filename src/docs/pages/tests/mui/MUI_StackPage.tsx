import { FastTextField } from "@/docs/components/FastTextField";
import { Box, FormControlLabel, FormGroup, Radio, Stack, Typography } from "@mui/material";
import { FC, useState } from "react";

export const MUI_StackPage: FC = () => {
  const [formData, setFormData] = useState({
    foo: "",
    bar: "",
    side: null as "left" | "right" | null,
  });
  return (
    <Stack spacing={2}>
      {/* NOTE: we also test that memo() components preserve the child order here */}
      <FastTextField
        style={{ marginTop: 8 }}
        label="Foo"
        fullWidth
        size="small"
        value={formData.foo}
        onChange={(event) => setFormData({ ...formData, foo: event.target.value })}
      />
      <FastTextField
        label="Bar"
        fullWidth
        size="small"
        value={formData.bar}
        onChange={(event) => setFormData({ ...formData, bar: event.target.value })}
      />
      <Box sx={{ p: 0.5, border: "1px solid", borderColor: "lightgrey", borderRadius: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: "bold" }}>Side</Typography>
        <FormGroup row>
          <FormControlLabel
            value="left"
            control={<Radio size="small" />}
            checked={formData.side === "left"}
            onChange={(_e, checked) => {
              if (checked) setFormData({ ...formData, side: "left" });
            }}
            label="Left"
          />
          <FormControlLabel
            value="right"
            control={<Radio size="small" />}
            checked={formData.side === "right"}
            onChange={(_e, checked) => {
              if (checked) setFormData({ ...formData, side: "right" });
            }}
            label="Right"
          />
        </FormGroup>
      </Box>
    </Stack>
  );
};
