import {
  Box,
  getTablePaginationUtilityClass,
  InputBase,
  MenuItem,
  Popover,
  Select,
  styled,
  SxProps,
  TablePaginationActions,
  tablePaginationClasses,
  Theme,
  unstable_composeClasses,
  unstable_memoTheme,
} from "@mui/material";
import React, { useCallback, useMemo, useRef, useState } from "react";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DEFAULT_PAGE_SIZE_OPTIONS, getStoredPageSize, setStoredPageSize } from "../config";
import { PropsWithChildren, ReactNode } from "react";

// constants
const DEFAULT_VERTICAL_MIN_WIDTH = 40;
const DEFAULT_HORIZONTAL_MIN_WIDTH = 66;
const DEFAULT_MAX_DRAG_WIDTH = 300;

// types
/** Use one of the following column types:
 * - `{label: 'String', value: (row) => row.string}`
 * - `{label: 'Number', value: (row) => row.number}`
 * - `{label: 'NumberOrNullsy', value: (row) => row.numberOrNullsy ?? Infinity, renderCell: (row) => row.numberOrNullsy}`
 * - `{label: 'Date', value: (row) => row.date, renderCell: (row) => formatDate(row.date)}`
 * - `{label: 'Other', value: (row) => formatToString(row.someOtherType), renderCell: (row) => anyElement(row.someOtherType)}`
 */
type RowValue = Date | string | number | undefined | null;
export type TableColumn<T> = {
  /** for backend sorting only */
  field?: string;
  labelDirection?: "down" | "left" | "right";
  label: string;
  alignCell?: "left" | "center" | "right";
  /**
   * If provided, column will start at `defaultWidth` and be resizable by dragging between `minWidth` and `maxWidth`.
   */
  defaultWidth?: number | null;
  /**
   * If `defaultWidth` is not provided, column will start at `minWidth` width, and start growing later than other columns. \
   * (In reality they all shrink because negative `flex-basis` doesn't exist, so we increase flex-bases for other columns instead) \
   * Default is based on `labelDirection`.
   */
  minWidth?: number | null;
  /**
   * If `defaultWidth` and `minWidth` are not provided, then `minWidth` is set to `maxWidth`, but `flex-basis` is set to minimum. \
   * Default for resize is `DEFAULT_MAX_DRAG_WIDTH`.
   */
  maxWidth?: number | null;
  disableSorting?: boolean;
  // filters
  disableGlobalSearchFilter?: boolean;
  filterValue?: any;
  colors?: TableColumnColors;

  filterComponent?: () => React.ReactNode;
  /**
   * Used to render the cell if `renderCell` is not provided. \
   * Used to sort the column. \
   * Used for CSV export and `globalSearchFilter` if `renderCell` is not provided or doesn't return a `string | number | undefined | null`.
   */
  value: (row: WithRowIndex<T>) => RowValue;
  /**
   * Used to render the cell if provided, else `value` is used. \
   * Used for CSV export and `globalSearchFilter` if this returns a `string | number | undefined | null`, else `value` is used.
   */
  renderCell?: (row: WithRowIndex<T>, rowValue: RowValue) => React.ReactNode;
  /**
   * Used to override CSV export if provided. \
   * Used to disable CSV export if `renderExport === null`
   */
  renderExport?: ((row: WithRowIndex<T>) => string) | null;
};
export type TableSorting =
  | {
      field: string;
      direction: "asc" | "desc";
    }
  | null
  | undefined;
export type TablePaging =
  | {
      pageIndex?: number;
      pageSize?: number;
      totalCount?: number;
    }
  | undefined;

// row props
export type TableRowColors = {
  background: string;
  hoverBackground?: string;
  borderColor?: string;
};

export type TableColumnColors = {
  color?: string;
  background?: string;
  borderColor?: string;
};

export type TableRowOptions<T> = {
  style?: React.CSSProperties;
  colors?: TableRowColors;
  onClick?: (row: WithRowIndex<T>) => void;
};
type WithRowIndexOrNullsy<T> = T & { _index?: number | null };
export type WithRowIndex<T> = T & {
  /** row index that is stable across different sortings */
  _index: number;
};

type Props<T> = {
  toolbar?: React.ReactNode;
  columns: TableColumn<T>[];
  rows: T[];
  // filters
  applyFilters?: () => void;
  // sort
  defaultSort?: TableSorting;
  sort?: TableSorting;
  onSortChange?: (newSort: TableSorting) => void;
  // page
  defaultPage?: TablePaging;
  page?: TablePaging;
  onPageChange?: (newPage: TablePaging) => void;
  disablePagination?: boolean;
  paginationFormat?: string;
  pageSizeOptions?: number[];
  // extra
  centered?: boolean;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  getRowProps?: (row: WithRowIndex<T>) => TableRowOptions<T>;
  /**
   *  Columns will instead be sized by:
   * - If all columns have `minWidth: null | undefined`, then all columns start at `0px` and grow to fit the parent.
   * - If some columns have `minWidth: number`, then those columns have a fixed width, \
   * and columns with `minWidth: null | undefined` start at `0px` and grow to fit the parent.
   * - If every column has `minWidth: number`, then all columns start at `minWidth`, and grow to fit the parent.
   *
   * (This will break scaling on larger monitors, so then you will have to use breakpoints.)
   */
  disableAutoFlexBasis?: boolean;
};

// procedures
function getColumnField(column: TableColumn<any>, columnIndex: number): string {
  return String(column.field ?? columnIndex);
}

function getColumnDefaultMinWidth(column: TableColumn<any>): number {
  const { labelDirection } = column;
  const labelIsVertical = labelDirection === "left" || labelDirection === "right";
  return labelIsVertical ? DEFAULT_VERTICAL_MIN_WIDTH : DEFAULT_HORIZONTAL_MIN_WIDTH;
}

/* NOTE: styled by .css */
export const FlexTable = <T,>(props: Props<T>): React.ReactNode => {
  const {
    toolbar,
    columns,
    rows,
    // filters
    applyFilters,
    // sort
    defaultSort,
    sort,
    onSortChange,
    // page
    defaultPage,
    page,
    onPageChange,
    disablePagination,
    paginationFormat,
    pageSizeOptions,
    // extra
    centered,
    style,
    sx,
    getRowProps,
    disableAutoFlexBasis,
  } = props;

  // sort
  const [innerSort, setInnerSort] = useState(defaultSort as TableSorting);
  const realSort = useMemo(() => (sort !== undefined ? sort : innerSort), [sort, innerSort]);
  const onClickSort = useCallback(
    (columnField: string) => {
      let newSort: TableSorting = null;
      if (realSort?.field !== columnField) {
        newSort = { field: columnField, direction: "asc" };
      } else if (realSort.direction === "asc") {
        newSort = { field: columnField, direction: "desc" };
      }
      setInnerSort(newSort);
      onSortChange?.(newSort);
    },
    [realSort, setInnerSort, onSortChange]
  );
  const sortedRows: WithRowIndex<T>[] = useMemo(() => {
    return frontendSorting({
      columns,
      rows,
      sort: realSort,
    });
  }, [columns, rows, realSort]);

  // page
  const isServerSidePaging = page != null;
  const [innerPage, setInnerPage] = useState(defaultPage as TablePaging);
  const changePage = useCallback(
    (diff: TablePaging) => {
      const newPage = {
        ...(page ?? innerPage),
        ...diff,
      };
      setInnerPage(newPage);
      onPageChange?.(newPage);
      if (!isServerSidePaging && diff?.pageSize != null) {
        setStoredPageSize(diff.pageSize);
      }
    },
    [page, innerPage, setInnerPage, isServerSidePaging]
  );
  const realTotalCount = isServerSidePaging ? (page.totalCount ?? -1) : sortedRows.length;
  const realPageIndex = page?.pageIndex ?? innerPage?.pageIndex ?? 0;
  const realPageSize = page?.pageSize ?? innerPage?.pageSize ?? getStoredPageSize();
  const realPageIndexStart = realPageIndex * realPageSize;
  const realPageIndexEnd = Math.min(realPageIndexStart + realPageSize, realTotalCount !== -1 ? realTotalCount - 1 : Infinity);
  const sortedAndPagedRows = useMemo(() => {
    if (isServerSidePaging || disablePagination) return sortedRows;
    return sortedRows.slice(realPageIndexStart, realPageIndexStart + realPageSize);
  }, [isServerSidePaging, disablePagination, sortedRows, realPageIndexStart, realPageSize]);
  const realPageSizeOptions = pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  /* copy paste from mui */
  const selectId = React.useId();
  const labelId = React.useId();
  const classes = useUtilityClasses();

  // style
  const flexBases = useMemo(() => {
    // NOTE: O(n^2), but columns.length is relatively small
    return columns.map((_, i) => {
      return columns.reduce((acc, otherColumn, j) => {
        const otherColumnMinWidth = otherColumn.minWidth ?? otherColumn.maxWidth ?? getColumnDefaultMinWidth(otherColumn);
        return acc + (j === i ? 0 : otherColumnMinWidth);
      }, 0);
    });
  }, [columns]);
  const tableId = React.useId();
  return (
    <Box id={tableId} sx={sx} style={style} className="flex-table" data-centered={centered}>
      <div className="flex-table-top">
        <div className="flex-table-sticky">
          {toolbar && <div className="flex-table-toolbar">{toolbar}</div>}
          <div className="flex-table-header">
            {columns.map((column, columnIndex) => (
              <FlexTableHeader
                key={columnIndex}
                column={column}
                columnIndex={columnIndex}
                flexBasis={flexBases[columnIndex]}
                disableAutoFlexBasis={disableAutoFlexBasis}
                realSort={realSort}
                onClickSort={onClickSort}
                applyFilters={applyFilters}
                tableId={tableId!}
              />
            ))}
          </div>
        </div>
        {sortedAndPagedRows.map((row) => {
          const { style, colors, onClick } = getRowProps?.(row) ?? {};
          let { background, hoverBackground, borderColor } = colors ?? {};
          return (
            <div
              style={{
                "--row-background": background,
                "--row-hoverBackground": hoverBackground,
                "--row-borderColor": borderColor,
                ...style,
              }}
              className="flex-table-row"
              data-is-clickable={onClick != null}
              onClick={() => onClick?.(row)}
            >
              {columns.map((column, columnIndex) => {
                const { value, renderCell } = column;
                const rowValue = value(row);
                return (
                  <FlexTableCell
                    data-column-id={getColumnField(column, columnIndex)}
                    key={columnIndex}
                    column={column}
                    flexBasis={flexBases[columnIndex]}
                    disableAutoFlexBasis={disableAutoFlexBasis}
                  >
                    {(renderCell ? renderCell?.(row, rowValue) : rowValue) as ReactNode}
                  </FlexTableCell>
                );
              })}
            </div>
          );
        })}
      </div>
      {!disablePagination && (
        <div className="flex-table-footer">
          {realPageSizeOptions.length > 1 && (
            <div style={{ display: "inline-flex" }}>
              <TablePaginationSelectLabel>{"Rows per page:"}</TablePaginationSelectLabel>
              <TablePaginationSelect
                variant="standard"
                input={<InputBase />}
                value={realPageSize}
                onChange={(event: any) => changePage({ pageIndex: 0, pageSize: event.target.value })}
                id={selectId}
                labelId={labelId}
                classes={{
                  root: [classes.input].join(" "),
                  select: [classes.select].join(" "),
                  icon: [classes.selectIcon].join(" "),
                }}
              >
                {realPageSizeOptions.map((pageSizeOption) => (
                  <TablePaginationMenuItem key={pageSizeOption} value={pageSizeOption}>
                    {pageSizeOption}
                  </TablePaginationMenuItem>
                ))}
              </TablePaginationSelect>
            </div>
          )}
          <TablePaginationDisplayedRows>
            {(paginationFormat || "{from}-{to} of {count}")
              .replace("{from}", String(realPageIndexStart + 1))
              .replace("{to}", String(realPageIndexEnd + 1))
              .replace("{count}", String(realTotalCount))}
          </TablePaginationDisplayedRows>
          <TablePaginationActions
            count={realTotalCount}
            page={realPageIndex}
            rowsPerPage={realPageSize}
            onPageChange={(_event, pageIndex) => changePage({ pageIndex })}
            getItemAriaLabel={() => ""}
            showFirstButton={false}
            showLastButton={false}
          />
        </div>
      )}
    </Box>
  );
};
/* copy paste from material-ui source code */
const TablePaginationSelect = styled(Select, {
  name: "MuiTablePagination",
  slot: "Select",
  overridesResolver: (_props, styles) => ({
    [`& .${tablePaginationClasses.selectIcon}`]: styles.selectIcon,
    [`& .${tablePaginationClasses.select}`]: styles.select,
    ...(styles.input as any),
    ...(styles.selectRoot as any),
  }),
})({
  color: "inherit",
  fontSize: "inherit",
  flexShrink: 0,
  marginRight: 32,
  marginLeft: 8,
  paddingTop: 2,
  [`& .${tablePaginationClasses.select}`]: {
    paddingLeft: 8,
    paddingRight: 24,
    textAlign: "right",
    textAlignLast: "right", // Align <select> on Chrome.
  },
}) as any;
const TablePaginationMenuItem = styled(MenuItem, {
  name: "MuiTablePagination",
  slot: "MenuItem",
})({}) as any;
const TablePaginationDisplayedRows = styled("p", {
  name: "MuiTablePagination",
  slot: "DisplayedRows",
})(
  unstable_memoTheme(({ theme }) => ({
    ...theme.typography.body2,
    flexShrink: 0,
    marginRight: 16,
  }))
);
const TablePaginationSelectLabel = styled("p", {
  name: "MuiTablePagination",
  slot: "SelectLabel",
})(
  unstable_memoTheme(({ theme }) => ({
    ...theme.typography.body2,
    flexShrink: 0,
  }))
);
const useUtilityClasses = () => {
  const slots = {
    root: ["root"],
    toolbar: ["toolbar"],
    spacer: ["spacer"],
    selectLabel: ["selectLabel"],
    select: ["select"],
    input: ["input"],
    selectIcon: ["selectIcon"],
    menuItem: ["menuItem"],
    displayedRows: ["displayedRows"],
    actions: ["actions"],
  };
  return unstable_composeClasses(slots, getTablePaginationUtilityClass, undefined);
};

// flex table header
type FlexTableHeaderProps<T> = {
  column: TableColumn<T>;
  columnIndex: number;
  realSort: TableSorting;
  onClickSort: (columnField: string) => void;
  flexBasis: number;
  disableAutoFlexBasis: boolean | undefined;
  applyFilters?: () => void;
  tableId: string;
};
const FlexTableHeader = <T,>(props: FlexTableHeaderProps<T>) => {
  const { column, columnIndex, realSort, onClickSort, flexBasis, disableAutoFlexBasis, applyFilters, tableId } = props;
  const { label, disableSorting = false, filterComponent, filterValue } = column;
  // sort
  let sort_direction: "asc" | "desc" | undefined;
  const columnField = getColumnField(column, columnIndex);
  if (realSort?.field === columnField) {
    sort_direction = realSort.direction;
  }
  // filter
  const sortWrapperId = React.useId();
  const [filterOpen, setFilterOpen] = useState(false);
  const filterArray = Array.isArray(filterValue) ? filterValue : [filterValue];
  const filterIsNotEmpty = filterArray.some((v) => v != null && v !== "");
  const closeAndApplyFilter = () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    setFilterOpen(false);
    applyFilters?.();
  };
  // dragger
  const dragWidthMin = column.minWidth ?? getColumnDefaultMinWidth(column);
  const dragWidthMax = column.maxWidth ?? DEFAULT_MAX_DRAG_WIDTH;
  const dragWidth = useRef(column.defaultWidth ?? dragWidthMin);
  const startDragging = (startEvent: PointerEvent) => {
    const startX = startEvent.clientX;
    const startWidth = dragWidth.current;
    const onDrag = (event: PointerEvent) => {
      // compute new width
      let newWidth = startWidth + event.clientX - startX;
      newWidth = Math.max(dragWidthMin, newWidth);
      if (dragWidthMax != null) newWidth = Math.min(newWidth, dragWidthMax);
      dragWidth.current = newWidth;
      // update element styles
      const table = document.getElementById(tableId);
      if (!table) return;
      const columnCells = [...table.querySelectorAll<HTMLDivElement>(`[data-column-id='${columnField}']`)];
      for (let cell of columnCells) {
        cell.style.setProperty("--min-width", `${newWidth}px`);
      }
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onDrag);
      window.removeEventListener("pointerup", onPointerUp);
    };
    window.addEventListener("pointermove", onDrag);
    window.addEventListener("pointerup", onPointerUp);
  };
  return (
    <>
      <FlexTableCell
        data-column-id={columnField}
        data-filter={filterOpen || filterIsNotEmpty}
        data-sort={String(sort_direction)}
        data-disable-sorting={disableSorting}
        column={column}
        flexBasis={flexBasis}
        disableAutoFlexBasis={disableAutoFlexBasis}
      >
        <div id={sortWrapperId} className="flex-table-sort-wrapper" onClick={disableSorting ? undefined : () => onClickSort(columnField)}>
          <span className="flex-table-column-title">{label}</span>
          <div className="flex-table-header-buttons">
            {filterComponent && (
              <FilterAltIcon
                className="flex-table-filter-button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setFilterOpen(!filterOpen);
                }}
              />
            )}
            {!disableSorting && <ArrowUpwardIcon className="flex-table-sort-arrow" />}
          </div>
        </div>
        {column.defaultWidth != null && (
          <div className="flex-table-dragger" onPointerDown={startDragging as any}>
            <DragIndicatorIcon className="flex-table-dragger-icon" />
          </div>
        )}
      </FlexTableCell>
      <Popover
        open={filterOpen}
        anchorEl={() => document.getElementById(sortWrapperId!)!}
        anchorOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        onClose={() => closeAndApplyFilter()}
      >
        <div
          style={{ padding: "2px 8px" }}
          onKeyDown={(event) => {
            if (event.key === "Enter") closeAndApplyFilter();
          }}
        >
          {filterComponent?.()}
        </div>
      </Popover>
    </>
  );
};

// flex table cell
type FlexTableCellProps = {
  id?: string;
  column: TableColumn<any>;
  flexBasis: number;
  disableAutoFlexBasis: boolean | undefined;
};
const FlexTableCell: React.FC<PropsWithChildren<FlexTableCellProps>> = (props) => {
  const { column, flexBasis, disableAutoFlexBasis, children, ...extra } = props;
  const { minWidth, maxWidth, labelDirection, alignCell, colors } = column;
  const defaultAlignCell = typeof children === "number" ? "right" : undefined;
  const realMinWidth = column.defaultWidth ?? minWidth ?? maxWidth ?? getColumnDefaultMinWidth(column);
  return (
    <div
      {...extra}
      className="flex-table-cell"
      data-label-direction={labelDirection}
      data-align-cell={alignCell ?? defaultAlignCell}
      style={{
        "width": 0,
        "flex": "1 1 0",
        "--min-width": `${realMinWidth}px`,
        "flexBasis": disableAutoFlexBasis ? "var(--min-width, 100%)" : `${flexBasis}px`,
        "minWidth": `var(--min-width)`,
        "maxWidth": maxWidth ?? undefined,

        ...(colors?.color && { color: colors.color }),
        ...(colors?.background && { backgroundColor: colors.background }),
        ...(colors?.borderColor && { borderColor: colors.borderColor }),
      }}
    >
      {children}
    </div>
  );
};

/** csv export */
function escapeCsvField(value: unknown, delimiter = ";"): string {
  let s = String(value ?? "");

  const needsQuoting = s.includes(delimiter) || s.includes('"') || s.includes("\n") || s.includes("\r") || /^\s|\s$/.test(s); // leading or trailing space

  if (!needsQuoting) return s;

  // escape internal quotes by doubling them
  s = s.replace(/"/g, '""');
  return `"${s}"`;
}

export function renderToCSV<T>(columns: Props<T>["columns"], rows: Props<T>["rows"]): string {
  const delimiter = ";";
  const columnsToExport = columns.filter((c) => c.renderExport !== null);

  const lines: string[] = [];

  // header
  const header = columnsToExport.map((c) => escapeCsvField(c.label ?? "", delimiter)).join(delimiter);
  lines.push(header);

  // body
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex] as WithRowIndexOrNullsy<T>;
    const rowWithIndex: WithRowIndex<T> = { ...(row as T), _index: row._index ?? rowIndex };

    const fields = columnsToExport.map((col) => {
      const { renderExport } = col;
      const raw =
        renderExport != null
          ? renderExport(rowWithIndex) // assume string-ish
          : getColumnStringValue(col, row, rowIndex, "export");

      return escapeCsvField(raw, delimiter);
    });

    lines.push(fields.join(delimiter));
  }

  return lines.join("\n");
}

type ColumnStringFor = "export" | "filter";
export function getColumnStringValue<T>(
  column: TableColumn<T>,
  row: WithRowIndexOrNullsy<T>,
  defaultRowIndex: number,
  type_for: ColumnStringFor
): string {
  const { renderCell, value } = column;
  const getRenderedCellString = () => {
    if (renderCell) {
      const renderedCell = renderCell(rowWithIndex, rowValue);
      const renderedCell_type = typeof renderedCell;
      // NOTE: number should never happen here in practice
      if (renderedCell_type === "string" || renderedCell_type === "number" || renderedCell == null) return String(renderedCell ?? "");
    }
    return null;
  };

  const rowWithIndex: WithRowIndex<T> = { ...row, _index: row._index ?? defaultRowIndex };
  const rowValue = value(rowWithIndex);
  if (typeof rowValue === "number") return formatNumberForExportOrFilter(rowValue, type_for, getRenderedCellString);
  if (renderCell) return getRenderedCellString() ?? "";
  return String(rowValue ?? "");
}
function formatNumberForExportOrFilter(value: number, type_for: ColumnStringFor, getRenderedCellString: () => string | null): string {
  if (type_for === "export") {
    return value.toString().replaceAll(",", ".");
  } else {
    const renderedCellString = getRenderedCellString();
    if (renderedCellString !== null) {
      // NOTE: zero-width space, space, non-breaking space
      return renderedCellString.replaceAll(/[\u200B \u00A0]/g, "");
    } else {
      return String(value);
    }
  }
}

/* filters */
type BSNUN = boolean | string | number | undefined | null;
type SNUN = string | number | undefined | null;
type SUN = string | undefined | null;
type NUN = number | undefined | null;
type BUN = boolean | undefined | null;

type FilterBase<Type extends string, Filter, GetValue> = { type: Type; filter: Filter; getValue: GetValue };
type GlobalSearchFilter<T> = Omit<FilterBase<"globalSearch", SUN, (row: T) => SUN>, "getValue">;
type TextFilter<T> = FilterBase<"text", SUN, (row: T) => SNUN[]>;
type NumberRangeFilter<T> = FilterBase<"numberRange", [NUN, NUN], (row: T) => NUN> & { allowNullsy?: boolean };
type BoolFilter<T> = FilterBase<"bool", BUN, (row: T) => BUN>;
type DateFilter<T> = FilterBase<"date", SUN, (row: T) => SUN>;
type DateRangeFilter<T> = FilterBase<"dateRange", [SUN, SUN], (row: T) => SUN[]>;
type SingleSelectFilter<T> = FilterBase<"singleSelect", BSNUN, (row: T) => BSNUN>;
type MultiSelectFilter<T> = FilterBase<"multiSelect", (string | number)[] | undefined | null, (row: T) => SNUN>;
type CheckboxGroupFilter<T> = FilterBase<"checkboxGroup", Record<string, boolean | undefined>, (row: T) => SUN | SUN[]>;
type Filter<T> =
  | GlobalSearchFilter<T>
  | TextFilter<T>
  | NumberRangeFilter<T>
  | BoolFilter<T>
  | DateFilter<T>
  | DateRangeFilter<T>
  | SingleSelectFilter<T>
  | MultiSelectFilter<T>
  | CheckboxGroupFilter<T>;

function compare(a: any, b: any): number {
  return ((a > b) as unknown as number) - ((a < b) as unknown as number);
}
function sortedBy<T>(arr: T[], key: (item: T) => any): T[] {
  const sortedArray = [...arr];
  sortedArray.sort((a, b) => {
    return compare(key(a), key(b));
  });
  return sortedArray;
}
type FrontendSortingProps<T> = Pick<Props<T>, "columns" | "rows"> & {
  sort: TableSorting;
};
export function frontendSorting<T>(props: FrontendSortingProps<T>): WithRowIndex<T>[] {
  const { columns, rows, sort } = props;
  const rowsWithIndices: WithRowIndex<T>[] = rows.map((row, defaultRowIndex) => {
    const _index = (row as WithRowIndexOrNullsy<T>)._index ?? defaultRowIndex;
    return { ...row, _index };
  });
  const columnToSortBy = columns.find((column, columnIndex) => getColumnField(column, columnIndex) === sort?.field);
  if (columnToSortBy == null) return rowsWithIndices;

  const rowsWithValue = rowsWithIndices.map((row) => ({
    row,
    value: columnToSortBy.value(row),
  }));
  const sortedRowsWithValue = sortedBy(rowsWithValue, (row) => row.value);
  if (sort!.direction === "desc") sortedRowsWithValue.reverse();
  return sortedRowsWithValue.map((v) => v.row);
}

type FrontendFilterProps<T> = {
  rows: T[];
  columns: TableColumn<T>[];
  filters: Filter<T>[];
};

export function frontendFilter<T>(props: FrontendFilterProps<T>): T[] {
  const { columns, rows, filters } = props;
  const getIsFilterValid = (row: T, rowIndex: number, filterDefinition: Filter<T>) => {
    switch (filterDefinition.type) {
      case "globalSearch": {
        const { filter: globalSearchFilter } = filterDefinition;
        if (!globalSearchFilter) return true;
        /* return true if any cell in the row contains all the keywords the same order (case insensitive) */
        const keywords = (globalSearchFilter ?? "").split(" ");
        const regex = new RegExp(keywords.join(".*"), "i");
        /* and only search through non-disabled columns */
        const columnsToSearch = columns.filter((column) => !column.disableGlobalSearchFilter);
        if (columnsToSearch.length === 0) return true;
        return columnsToSearch.some((column) => {
          const stringValue = getColumnStringValue(column, row as WithRowIndexOrNullsy<T>, rowIndex, "filter");
          return stringValue.match(regex) != null;
        });
      }
      case "text": {
        /* TODO: should textFilter mimic globalSearch functionality?
           Currently, textFilter does not find numbers (which are displayed as "1 824", but searched through as "1824")
           when the search string is "1 824", but globalSearchFilter does.
        */
        const { filter, getValue } = filterDefinition;
        const textFilter = String(filter ?? "").toLowerCase();
        // NOTE: this is consistent with formatNumberForExportOrFilter() (only in czech locale)
        const rowTexts = (getValue(row) ?? []).map((v) => String(v ?? "").toLowerCase());
        return rowTexts.some((rowText) => rowText.includes(textFilter));
      }
      case "numberRange": {
        const { filter: numberRangeFilter, getValue, allowNullsy } = filterDefinition;
        let [filterFrom, filterTo] = numberRangeFilter;
        if (filterFrom == null && filterTo == null) return true;
        /*if (filterFrom == null || filterTo == null) {
          const singleFilter = filterFrom ?? filterTo;
          [filterFrom, filterTo] = [singleFilter, singleFilter];
        }*/
        const value_SNUN = getValue(row);
        const value_NUN = value_SNUN == null ? value_SNUN : +value_SNUN;
        if (value_NUN == null) return allowNullsy;
        if (filterFrom != null && value_NUN < filterFrom) return false;
        if (filterTo != null && value_NUN > filterTo) return false;
        return true;
      }
      case "bool": {
        const { filter: boolFilter, getValue } = filterDefinition;
        if (boolFilter == null) return true;
        const rowValue = getValue(row);
        return boolFilter === rowValue;
      }
      case "date": {
        const { filter: dateFilter, getValue } = filterDefinition;
        const rowDate = getValue(row) ?? "";
        if (rowDate && dateFilter) return rowDate === dateFilter;
        return true;
      }
      case "dateRange": {
        const { filter: dateRangeFilter, getValue } = filterDefinition;
        const rowDates = getValue(row).map((v) => v ?? "");
        if (rowDates.every((date) => date === "")) return true;

        const result = rowDates.some((rowDate) => {
          let [filterFrom, filterTo] = dateRangeFilter;

          if (filterFrom && rowDate < filterFrom) return false;
          if (filterTo && rowDate > filterTo) return false;
          return true;
        });
        return result;
      }
      case "singleSelect": {
        const { filter: singleSelectFilter, getValue } = filterDefinition;
        if (singleSelectFilter != null) return singleSelectFilter == getValue(row); // NOTE: double equals to catch nonstringified numbers
        return true;
      }
      case "multiSelect": {
        const { filter: multiSelectFilter, getValue } = filterDefinition;
        if ((multiSelectFilter?.length ?? 0) > 0) {
          const value = getValue(row);
          return multiSelectFilter!.find((v) => v == value) != null; // NOTE: double equals to catch nonstringified numbers
        }
        return true;
      }
      case "checkboxGroup": {
        const { filter, getValue } = filterDefinition;
        const entries = Object.entries(filter ?? {});
        if (entries.every(([_, checked]) => !checked)) return true;
        const value = getValue(row);
        if (value == null) return false;
        if (Array.isArray(value)) {
          return value.some((v) => v != null && filter[v]);
        }
        return Boolean(filter[value]);
      }
      default:
        console.error(`Unsupported filter type: ${(filterDefinition as any)?.type}`);
        return true;
    }
  };
  return rows.filter((row, rowIndex) => {
    return filters.every((filter) => {
      const isFilterValid = getIsFilterValid(row, rowIndex, filter);
      return isFilterValid;
    });
  });
}
