import {
  RFQ,
  RFQStatus,
  RFQItem,
  Quote,
  QuoteItem,
  Vendor,
  CostingAnalysis,
  CostAdjustment,
  LinePlan,
  PlannedStyle,
  PLMStatusStage,
} from "@/types";
import { generateId } from "./planningService";

// Utility function to generate RFQ number
export const generateRFQNumber = (): string => {
  const prefix = "RFQ";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
};

// Create RFQ from selected styles
export const createRFQFromStyles = (
  linePlan: LinePlan,
  selectedStyles: PlannedStyle[],
  selectedVendorIds: string[],
  dueDate: string,
  title?: string,
  description?: string
): RFQ => {
  const rfqItems: RFQItem[] = selectedStyles.map((style) => {
    const category = linePlan.categories.find((cat) =>
      cat.plannedStyles.some((s) => s.id === style.id)
    );

    return {
      id: generateId(),
      styleId: style.id,
      styleName: style.name,
      categoryId: category?.id || "",
      categoryName: category?.name || "",
      quantity: Math.floor(
        category?.targetVolume || 100 / selectedStyles.length
      ), // Distribute target volume
      targetCost: style.costPrice * 0.9, // 10% cost reduction target
      specifications: `${style.name} - ${style.color}`,
      imageUrl: style.imageUrl,
      components: style.components,
    };
  });

  const totalTargetValue = rfqItems.reduce(
    (sum, item) => sum + item.targetCost * item.quantity,
    0
  );

  return {
    id: generateId(),
    rfqNumber: generateRFQNumber(),
    title:
      title || `RFQ for ${linePlan.name} - ${selectedStyles.length} styles`,
    description:
      description ||
      `Request for quotes for ${selectedStyles.length} styles from ${linePlan.name} line plan`,
    status: RFQStatus.DRAFT,
    createdBy: "Current User", // In a real app, this would come from auth
    createdAt: new Date().toISOString(),
    dueDate,
    linePlanId: linePlan.id,
    linePlanName: linePlan.name,
    items: rfqItems,
    vendorIds: selectedVendorIds,
    totalTargetValue,
    currency: "USD",
    attachments: [],
  };
};

// Send RFQ to vendors
export const sendRFQToVendors = async (rfq: RFQ): Promise<RFQ> => {
  // In a real implementation, this would make API calls to send emails/notifications
  console.log(
    `Sending RFQ ${rfq.rfqNumber} to ${rfq.vendorIds.length} vendors`
  );

  return {
    ...rfq,
    status: RFQStatus.SENT,
  };
};

// Create a quote response from vendor
export const createQuoteResponse = (
  rfq: RFQ,
  vendorId: string,
  vendorName: string,
  quoteItems: QuoteItem[],
  paymentTerms: string = "Net 30",
  deliveryTerms: string = "FOB Factory"
): Quote => {
  const totalValue = quoteItems.reduce((sum, item) => {
    const rfqItem = rfq.items.find((ri) => ri.id === item.rfqItemId);
    return sum + item.unitCost * (rfqItem?.quantity || 0);
  }, 0);

  return {
    id: generateId(),
    rfqId: rfq.id,
    vendorId,
    vendorName,
    quoteNumber: `Q-${rfq.rfqNumber}-${vendorName
      .substring(0, 3)
      .toUpperCase()}`,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    items: quoteItems,
    totalValue,
    currency: rfq.currency,
    paymentTerms,
    deliveryTerms,
    validityPeriod: 30,
    notes: "",
    attachments: [],
  };
};

// Analyze quotes and create costing analysis
export const analyzeQuotes = (
  rfq: RFQ,
  quotes: Quote[],
  linePlan: LinePlan
): CostingAnalysis[] => {
  const analyses: CostingAnalysis[] = [];

  rfq.items.forEach((rfqItem) => {
    const style = linePlan.categories
      .flatMap((cat) => cat.plannedStyles)
      .find((s) => s.id === rfqItem.styleId);

    if (!style) return;

    const relevantQuotes = quotes.filter((quote) =>
      quote.items.some((item) => item.rfqItemId === rfqItem.id)
    );

    const bestQuote = relevantQuotes.reduce((best, current) => {
      const bestQuoteItem = best.items.find(
        (item) => item.rfqItemId === rfqItem.id
      );
      const currentQuoteItem = current.items.find(
        (item) => item.rfqItemId === rfqItem.id
      );

      if (!bestQuoteItem) return current;
      if (!currentQuoteItem) return best;

      return currentQuoteItem.unitCost < bestQuoteItem.unitCost
        ? current
        : best;
    }, relevantQuotes[0]);

    const bestQuoteItem = bestQuote?.items.find(
      (item) => item.rfqItemId === rfqItem.id
    );
    const bestQuoteCost = bestQuoteItem?.unitCost || 0;

    const costVariance =
      rfqItem.targetCost > 0
        ? ((bestQuoteCost - rfqItem.targetCost) / rfqItem.targetCost) * 100
        : 0;

    const oldMargin = style.margin;
    const newMargin =
      style.sellingPrice > 0
        ? (style.sellingPrice - bestQuoteCost) / style.sellingPrice
        : 0;
    const marginImpact = newMargin - oldMargin;

    let recommendedAction: "accept" | "negotiate" | "reject" | "redesign" =
      "accept";

    if (costVariance > 20) {
      recommendedAction = "reject";
    } else if (costVariance > 10) {
      recommendedAction = "negotiate";
    } else if (marginImpact < -0.1) {
      // More than 10% margin reduction
      recommendedAction = "redesign";
    }

    analyses.push({
      id: generateId(),
      linePlanId: rfq.linePlanId,
      styleId: rfqItem.styleId,
      styleName: rfqItem.styleName,
      currentCost: style.costPrice,
      targetCost: rfqItem.targetCost,
      bestQuoteCost,
      bestVendorId: bestQuote?.vendorId,
      costVariance,
      marginImpact: marginImpact * 100, // Convert to percentage
      recommendedAction,
      quotes: relevantQuotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return analyses;
};

// Apply cost adjustment to style
export const applyCostAdjustment = (
  style: PlannedStyle,
  newCost: number,
  reason: string,
  quoteId?: string,
  vendorId?: string
): { updatedStyle: PlannedStyle; adjustment: CostAdjustment } => {
  const adjustment: CostAdjustment = {
    id: generateId(),
    styleId: style.id,
    categoryId: "", // Will be filled by the calling function
    linePlanId: "", // Will be filled by the calling function
    oldCost: style.costPrice,
    newCost,
    reason,
    quoteId,
    vendorId,
    adjustedBy: "Current User",
    adjustedAt: new Date().toISOString(),
    approvalStatus: "pending",
  };

  const updatedStyle: PlannedStyle = {
    ...style,
    costPrice: newCost,
    margin:
      style.sellingPrice > 0
        ? (style.sellingPrice - newCost) / style.sellingPrice
        : 0,
  };

  return { updatedStyle, adjustment };
};

// Check if styles are ready for costing (design completed)
export const getStylesReadyForCosting = (
  linePlan: LinePlan
): PlannedStyle[] => {
  return linePlan.categories
    .flatMap((category) => category.plannedStyles)
    .filter(
      (style) =>
        style.plmStatus === PLMStatusStage.DESIGNING ||
        style.plmStatus === PLMStatusStage.FINALIZING
    );
};

// Calculate cost impact on line plan
export const calculateCostImpactOnLinePlan = (
  linePlan: LinePlan,
  costAdjustments: CostAdjustment[]
): {
  totalCostSavings: number;
  marginImprovement: number;
  affectedStyles: number;
  revenueImpact: number;
} => {
  let totalCostSavings = 0;
  let totalOldRevenue = 0;
  let totalNewRevenue = 0;
  let affectedStyles = 0;

  costAdjustments.forEach((adjustment) => {
    const style = linePlan.categories
      .flatMap((cat) => cat.plannedStyles)
      .find((s) => s.id === adjustment.styleId);

    if (style) {
      const category = linePlan.categories.find((cat) =>
        cat.plannedStyles.some((s) => s.id === style.id)
      );

      const estimatedVolume = category?.targetVolume || 0;
      const costSaving =
        (adjustment.oldCost - adjustment.newCost) * estimatedVolume;

      totalCostSavings += costSaving;
      totalOldRevenue += adjustment.oldCost * estimatedVolume;
      totalNewRevenue += adjustment.newCost * estimatedVolume;
      affectedStyles++;
    }
  });

  const marginImprovement =
    totalOldRevenue > 0
      ? ((totalOldRevenue - totalNewRevenue) / totalOldRevenue) * 100
      : 0;

  return {
    totalCostSavings,
    marginImprovement,
    affectedStyles,
    revenueImpact: totalCostSavings,
  };
};

// Mock vendors data
export const mockVendors: Vendor[] = [
  {
    id: "vendor-1",
    name: "Asian Apparel Co.",
    contact: {
      email: "sourcing@asianapparel.com",
      phone: "+86-21-1234-5678",
      contactPerson: "Jennifer Wang",
    },
    categories: ["Tops", "Bottoms", "Outerwear"],
    location: "Shanghai, China",
    rating: 4.5,
    paymentTerms: "Net 30",
    leadTime: 45,
    minimumOrderQuantity: 500,
    isActive: true,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "vendor-2",
    name: "European Fashion House",
    contact: {
      email: "orders@eurfashion.com",
      phone: "+39-02-9876-5432",
      contactPerson: "Marco Rossi",
    },
    categories: ["Tops", "Dresses", "Accessories"],
    location: "Milan, Italy",
    rating: 4.8,
    paymentTerms: "Net 45",
    leadTime: 30,
    minimumOrderQuantity: 200,
    isActive: true,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "vendor-3",
    name: "South American Textiles",
    contact: {
      email: "contact@satextiles.com",
      phone: "+55-11-5555-4444",
      contactPerson: "Carlos Silva",
    },
    categories: ["Bottoms", "Casual Wear", "Sportswear"],
    location: "São Paulo, Brazil",
    rating: 4.2,
    paymentTerms: "Net 30",
    leadTime: 35,
    minimumOrderQuantity: 300,
    isActive: true,
    createdAt: "2024-01-20T00:00:00Z",
  },
];
