import { DatePicker, DatePickerProps, DateTimePicker, DateTimePickerProps, LocalizationProvider } from "../../../mock/mui-x/x-date-pickers";
import { AdapterDayjs } from "../../../mock/mui-x/x-date-pickers/AdapterDayjs";
import { csCZ } from "../../../mock/mui-x/x-date-pickers/locales";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import React, { useMemo, useState } from "react";

type DatePickerInputDate<TEnableAccessibleFieldDOMStructure extends boolean = true> = {
  variant?: "date";
} & DatePickerProps<TEnableAccessibleFieldDOMStructure>;
type DatePickerInputDateTime<TEnableAccessibleFieldDOMStructure extends boolean = true> = {
  variant: "datetime";
} & DateTimePickerProps<TEnableAccessibleFieldDOMStructure>;
type DatePickerInputProps<TEnableAccessibleFieldDOMStructure extends boolean = true> =
  | DatePickerInputDate<TEnableAccessibleFieldDOMStructure>
  | DatePickerInputDateTime<TEnableAccessibleFieldDOMStructure>;

function DatePickerInput<TEnableAccessibleFieldDOMStructure extends boolean = true>(props: DatePickerInputProps<TEnableAccessibleFieldDOMStructure>) {
  const { variant, value, onChange, ...rest } = props as any;
  // TODO: why does React not require a useMemo here?
  const value_dayjs = useMemo(() => value != null ? dayjs(value) : null, [value]);
  const commonProps = {
    value: value_dayjs,
    onChange: (newValue: any) => {
      if (onChange) {
        onChange(newValue ? newValue.toDate() : null);
      }
    },
    enableAccessibleFieldDOMStructure: false,
    localeText: csCZ.components.MuiLocalizationProvider.defaultProps.localeText,
    ...rest,
  };
  switch (variant) {
    case "datetime":
      return <DateTimePicker {...commonProps} />;
    default: {
      return <DatePicker {...commonProps} />;
    }
  }
};
export const MUIX_DatePickerPage: React.FC = () => {
  //const [date, setDate] = useState(new Date(0));
  const [date, setDate] = useState(null as Date|null);
  return <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs">
    <DatePickerInput sx={{marginTop: 1}} label="Date" value={date} onChange={(newDate) => {
      setDate(newDate)
    }} />
    {/*<DatePickerInput sx={{marginTop: 1}} label="Datetime" variant="datetime" value={date} onChange={(newDate) => setDate(newDate)} />*/}
  </LocalizationProvider>
}

