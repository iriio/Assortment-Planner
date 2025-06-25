export type LayoutViewOption =
  | "standard"
  | "compactList"
  | "wideView"
  | "pivotTable";

export interface LayoutConfig {
  containerClasses: string;
  cardDisplayMode: "grid" | "list";
}
