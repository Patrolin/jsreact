import { FlexTable, TableColumn } from "@/docs/components/FlexTable";
import { Button, Checkbox, createTheme, MantineProvider } from "@mantine/core";
import { FC, useMemo, useState } from "react";

function random_bool(true_chance: number) {
  return Math.random() < true_chance;
}
function random_int(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min));
}
function random_item(arr: string): string {
  return arr[random_int(0, arr.length - 1)];
}
function random_name() {
  const length = random_int(1, 4);
  const name = Array(length)
    .fill(undefined)
    .map(() => {
      const consonant = random_item("bcdfghjklmnpqrstvwxyz");
      const vowel = random_item("aeiou");
      return consonant + vowel;
    })
    .join("");
  return name[0].toUpperCase() + name.slice(1);
}
export type Row = {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  didPay: boolean;
};
export function generateRow(): Row {
  const firstName = random_name();
  const lastName = random_name();
  const row: Row = {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    age: random_int(1, 99),
    didPay: random_bool(0.2),
  };
  return row;
}

const theme = createTheme({
  /** Put your mantine theme override here */
});
export const BigTablePageWithMantine: FC = () => {
  const initialRows = useMemo(() => {
    return Array(200)
      .fill(undefined)
      .map(() => generateRow());
  }, []);
  const [rows, setRows] = useState(initialRows);
  const columns: TableColumn<Row>[] = [
    {
      label: "#",
      value: (row) => row._index + 1,
      maxWidth: 60,
    },
    {
      label: "First name",
      value: (row) => row.firstName,
    },
    {
      label: "Last name",
      value: (row) => row.lastName,
    },
    {
      label: "Age",
      value: (row) => row.age,
      maxWidth: 60,
    },
    {
      label: "Email",
      value: (row) => row.email,
    },
    {
      label: "Did pay",
      value: (row) => (row.didPay ? "ano" : "ne"),
      renderCell: (row) => (
        <Checkbox
          checked={row.didPay}
          onChange={() => {
            const newRows = [...rows];
            newRows.splice(row._index, 1, { ...row, didPay: !row.didPay });
            setRows(newRows);
          }}
        />
      ),
    },
  ];
  return (
    <MantineProvider theme={theme}>
      <div style={{ width: "100%", height: "100%", padding: 16 }}>
        <FlexTable columns={columns} rows={rows} />
        <Button variant="contained">Submit</Button>
      </div>
    </MantineProvider>
  );
};
