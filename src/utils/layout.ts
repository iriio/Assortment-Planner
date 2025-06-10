import { LayoutViewOption, LayoutConfig } from "../types/layout";

export const getLayoutConfig = (layout: LayoutViewOption): LayoutConfig => {
  switch (layout) {
    case "standard":
      return {
        containerClasses:
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start auto-rows-auto",
        cardDisplayMode: "grid",
      };
    case "compactList":
      return {
        containerClasses: "space-y-3.5",
        cardDisplayMode: "list",
      };
    case "wideView":
    default:
      return {
        containerClasses:
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start auto-rows-auto",
        cardDisplayMode: "grid",
      };
  }
};
