export const DEFAULT_PAGE_SIZE = 200;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 200];
const PAGE_SIZE_STORAGE_ID = "jsreact:pageSize";
export function getStoredPageSize(): number {
  try {
    return JSON.parse(localStorage.getItem(PAGE_SIZE_STORAGE_ID) ?? "");
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
}
export function setStoredPageSize(newValue: number) {
  localStorage.setItem(PAGE_SIZE_STORAGE_ID, JSON.stringify(newValue));
}
