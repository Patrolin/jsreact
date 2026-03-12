import TextField from "@mui/material/TextField";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";

export const RHF_TestPage: FC = () => {
  type FormData = { firstName: string; lastName: string };
  const { control, handleSubmit, setValue, getValues, reset } = useForm<FormData>({
    defaultValues: { firstName: "", lastName: "" },
    //resolver,
  });
  return (
    <div>
      <Controller
        name="firstName"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            label="First name"
            fullWidth
            size="small"
            value={field.value}
            onChange={(newValue) => field.onChange(newValue)}
            helperText={fieldState.error?.message}
            error={Boolean(fieldState.error)}
          />
        )}
      />
      <Controller
        name="lastName"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            label="Last name"
            fullWidth
            size="small"
            value={field.value}
            onChange={(newValue) => field.onChange(newValue)}
            helperText={fieldState.error?.message}
            error={Boolean(fieldState.error)}
          />
        )}
      />
    </div>
  );
};
