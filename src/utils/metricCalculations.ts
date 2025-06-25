import { LinePlanCategory, PlannedStyle } from "@/types";

export const calculateRevenue = (
  styles: PlannedStyle[],
  targetVolume: number
): number => {
  if (!styles.length) return 0;
  return (
    styles.reduce(
      (sum, style) => sum + style.sellingPrice * (targetVolume / styles.length),
      0
    ) / 1000000
  );
};

export const calculateMargin = (
  styles: PlannedStyle[],
  targetVolume: number
): number => {
  if (!styles.length) return 0;
  const totalRevenue = styles.reduce(
    (sum, style) => sum + style.sellingPrice * (targetVolume / styles.length),
    0
  );
  const totalCost = styles.reduce(
    (sum, style) => sum + style.costPrice * (targetVolume / styles.length),
    0
  );
  return totalRevenue === 0
    ? 0
    : ((totalRevenue - totalCost) / totalRevenue) * 100;
};

export const calculateSellIn = (
  styles: PlannedStyle[],
  targetVolume: number
): number => {
  if (!styles.length) return 0;
  const volumePerStyle = targetVolume / styles.length;
  return styles.reduce(
    (sum, style) => sum + (style.projectedSellIn || volumePerStyle),
    0
  );
};

export const calculateSellThrough = (styles: PlannedStyle[]): number => {
  if (!styles.length) return 0;
  return (
    (styles.reduce((sum, style) => sum + (style.projectedSellThrough || 0), 0) /
      styles.length) *
    100
  );
};

export const getMetricValue = (
  category: LinePlanCategory,
  metricType: "revenue" | "margin" | "sell-in" | "sell-through"
): number => {
  switch (metricType) {
    case "revenue":
      return calculateRevenue(category.plannedStyles, category.targetVolume);
    case "margin":
      return calculateMargin(category.plannedStyles, category.targetVolume);
    case "sell-in":
      return calculateSellIn(category.plannedStyles, category.targetVolume);
    case "sell-through":
      return calculateSellThrough(category.plannedStyles);
    default:
      return 0;
  }
};

export const getProductMetricValue = (
  product: PlannedStyle,
  metricType: "revenue" | "margin" | "sell-in" | "sell-through"
): number => {
  switch (metricType) {
    case "revenue":
      return product.sellingPrice / 1000000;
    case "margin":
      return (
        ((product.sellingPrice - product.costPrice) / product.sellingPrice) *
        100
      );
    case "sell-in":
      return product.projectedSellIn || 0;
    case "sell-through":
      return (product.projectedSellThrough || 0) * 100;
    default:
      return 0;
  }
};

export const getMetricStatus = (
  current: number,
  target: number,
  thresholds: { low: number; high: number } = { low: 0.95, high: 1.05 }
): "over" | "near" | "under" => {
  const ratio = target === 0 ? 0 : current / target;
  if (ratio >= thresholds.high) return "over";
  if (ratio >= thresholds.low) return "near";
  return "under";
};

export const getMetricColor = (
  metricType: "revenue" | "margin" | "sell-in" | "sell-through",
  status: "over" | "near" | "under"
): { bar: string; text: string } => {
  const baseColors = {
    over: { bar: "bg-emerald-500", text: "text-emerald-600" },
    near: { bar: "bg-amber-500", text: "text-amber-600" },
    under: { bar: "bg-red-500", text: "text-red-600" },
  };

  // Special cases for specific metrics
  if (metricType === "sell-in" && (status === "over" || status === "near")) {
    return { bar: "bg-blue-500", text: "text-blue-600" };
  }

  return baseColors[status];
};

export const getMetricStyle = (
  metricType: "revenue" | "margin" | "sell-in" | "sell-through",
  current: number,
  target: number,
  thresholds: { low: number; high: number }
): string => {
  const status = getMetricStatus(current, target, thresholds);
  const color = getMetricColor(metricType, status);
  return `border-${color.bar} bg-${color.bar}-50`;
};
