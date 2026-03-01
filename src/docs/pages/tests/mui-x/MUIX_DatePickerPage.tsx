import { styled } from "@mui/material";
import { DatePicker, DatePickerProps, DateTimePicker, DateTimePickerProps, LocalizationProvider } from "../../../mock/mui-x/x-date-pickers";
import { AdapterDayjs } from "../../../mock/mui-x/x-date-pickers/AdapterDayjs";
import { csCZ } from "../../../mock/mui-x/x-date-pickers/locales";
import dayjs from "dayjs";
import "dayjs/locale/cs";
import { useState } from "react";
import { PickersFadeTransitionGroup } from "@/docs/mock/mui-x/x-date-pickers/DateCalendar/PickersFadeTransitionGroup";

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
  const commonProps = {
    value: value ? dayjs(value) : null,
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
const PickersCalendarHeaderLabelM = styled('div', {
  name: 'MuiPickersCalendarHeader',
  slot: 'Label',
})<{
  ownerState?: any;
}>({
  marginRight: 6,
});
export const MUIX_DatePickerPage: React.FC = () => {
  const [date, setDate] = useState(new Date(0));
  const label = "březen 2";
  return <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="cs">
    {/*<PickersFadeTransitionGroup reduceAnimations={false} transKey={label}>
      <PickersCalendarHeaderLabelM>{label}</PickersCalendarHeaderLabelM>
    </PickersFadeTransitionGroup>*/}
    <DatePickerInput sx={{marginTop: 1}} label="Date" />
    {/*<DatePickerInput sx={{marginTop: 1}} label="Date" value={date} onChange={(newDate) => setDate(newDate)} />*/}
    {/*<DatePickerInput sx={{marginTop: 1}} label="Datetime" variant="datetime" value={date} onChange={(newDate) => setDate(newDate)} />*/}
  </LocalizationProvider>
}

