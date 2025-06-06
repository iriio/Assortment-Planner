import { LayoutViewOption, LayoutConfig } from "@/types/layout";

export const getLayoutConfig = (layout: LayoutViewOption): LayoutConfig => {
  switch (layout) {
    case "grid":
      return {
        containerClasses: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cardDisplayMode: "grid",
      };
    case "list":
      return {
        containerClasses: "flex flex-col gap-4",
        cardDisplayMode: "list",
      };
    case "table":
      return {
        containerClasses: "flex flex-col gap-4",
        cardDisplayMode: "list",
      };
    default:
      return {
        containerClasses: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        cardDisplayMode: "grid",
      };
  }
};
