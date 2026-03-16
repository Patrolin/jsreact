import { FC, useMemo, useState } from "react";
import { generateRow, getColumns } from "./BigTablePage";
import { HTMLTable } from "@/docs/components/HTMLTable";

export const BigTablePageWithHTMLElements: FC = () => {
  const initialRows = useMemo(() => {
    return Array(200)
      .fill(undefined)
      .map(() => generateRow());
  }, []);
  const [rows, setRows] = useState(initialRows);
  const columns = getColumns(rows, setRows, (props) => <input type="checkbox" style={{ width: 16, height: 16 }} {...props} />);
  return (
    <div style={{ width: "100%", height: "100%", padding: 16 }}>
      <HTMLTable style={{ flex: 1, height: "calc(100% - 64px)" }} columns={columns} rows={rows} />
      <button>Submit</button>
    </div>
  );
};
