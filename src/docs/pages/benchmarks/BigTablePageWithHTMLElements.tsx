import { FC, useMemo, useState } from "react";
import { generateRow, Row } from "./BigTablePage";
import { TableColumn } from "@/docs/components/FlexTable";
import { HTMLTable } from "@/docs/components/HTMLTable";

export const BigTablePageWithHTMLElements: FC = () => {
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
        <input
          type="checkbox"
          style={{ width: 16, height: 16 }}
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
    <div style={{ width: "100%", height: "100%", padding: 16 }}>
      <HTMLTable style={{ flex: 1, height: "calc(100% - 64px)" }} columns={columns} rows={rows} />
      <button>Submit</button>
    </div>
  );
};
