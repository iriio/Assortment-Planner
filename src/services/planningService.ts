import {
  PlannedStyle,
  LinePlanCategory,
  MasterComponent,
  StyleComponentUsage,
} from "../types";

export const calculateStyleCost = (
  components: StyleComponentUsage[],
  masterComponents: MasterComponent[]
): number => {
  return components.reduce((totalCost, usage) => {
    const component = masterComponents.find(
      (mc) => mc.id === usage.componentId
    );
    return totalCost + (component ? component.cost * usage.quantity : 0);
  }, 0);
};

export const calculateStyleMargin = (
  costPrice: number,
  sellingPrice: number
): number => {
  if (sellingPrice === 0) return 0;
  return (sellingPrice - costPrice) / sellingPrice;
};

export const updateStyleFinancials = (
  style: PlannedStyle,
  masterComponents: MasterComponent[]
): PlannedStyle => {
  const newCostPrice = calculateStyleCost(
    style.components || [],
    masterComponents
  );
  const newMargin = calculateStyleMargin(newCostPrice, style.sellingPrice);
  return { ...style, costPrice: newCostPrice, margin: newMargin };
};

export const calculateCategoryAchievedMargin = (
  category: LinePlanCategory,
  masterComponents: MasterComponent[]
): number => {
  if (category.plannedStyles.length === 0) return 0;

  let totalRevenue = 0;
  let totalCost = 0;

  category.plannedStyles.forEach((style) => {
    const updatedStyle = updateStyleFinancials(style, masterComponents); // Ensure style.costPrice is up-to-date
    // Assume targetVolume is per style for simplicity, or distribute category.targetVolume
    const styleVolume = category.targetVolume / category.plannedStyles.length; // Simplistic volume distribution
    totalRevenue += updatedStyle.sellingPrice * styleVolume;
    totalCost += updatedStyle.costPrice * styleVolume;
  });

  if (totalRevenue === 0) return 0;
  return (totalRevenue - totalCost) / totalRevenue;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
