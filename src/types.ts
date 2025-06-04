export interface TrendReportItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
}

export interface MasterComponent {
  id: string;
  name: string;
  type: "ZIPPER" | "BUTTON" | "FABRIC" | "THREAD" | "LABEL";
  cost: number;
  supplier: string;
  imageUrl?: string;
}

export interface StyleComponentUsage {
  componentId: string;
  quantity: number;
}

export enum PlannedStyleStatus {
  NEW_DESIGN = "New Design",
  PLACEHOLDER = "Placeholder",
  CARRYOVER = "Carryover",
}

export interface ProductTag {
  id: string;
  name: string;
  color: string;
  category: "style" | "occasion" | "trend" | "season" | "performance";
}

export interface PlannedStyle {
  id: string;
  name: string;
  status: PlannedStyleStatus;
  sourceStyleId?: string; // For carryovers, links to ProductCatalogueItem.id
  color: string;
  imageUrl: string | null; // Allow null for placeholder styles
  costPrice: number; // Calculated from components
  sellingPrice: number;
  margin: number; // Calculated: (sellingPrice - costPrice) / sellingPrice
  components: StyleComponentUsage[];
  notes?: string;
  targetSellIn?: number; // Target units to buy
  projectedSellIn?: number; // Projected units to buy
  targetSellThrough?: number; // Target sell-through percentage
  projectedSellThrough?: number; // Projected sell-through percentage
  tags?: string[]; // Array of tag IDs
}

export interface LinePlanCategory {
  id: string;
  name: string;
  targetVolume: number; // Example: units to sell
  plannedStyles: PlannedStyle[];
  targetMargin?: number; // Target margin for this category
  targetMetrics?: {
    margin: number;
    revenue: number;
    sellThrough: number;
  };
  // Achieved margin will be calculated on the fly or stored if needed
}

export interface LinePlan {
  id: string;
  name: string;
  season: string;
  targetOverallMargin: number; // Percentage, e.g., 0.65 for 65%
  targetOverallSellThrough: number; // Percentage, e.g., 0.85 for 85%
  targetOverallRevenue: number; // Total target revenue
  categories: LinePlanCategory[];
  trends: TrendReportItem[];
}

export interface ProductCatalogueItem {
  id: string;
  name: string;
  categoryName: string; // e.g., "Bottoms"
  season: string; // e.g., "FW24"
  costPrice: number;
  sellingPrice: number;
  margin: number;
  imageUrl: string;
  components: StyleComponentUsage[]; // To know what it was made of
  tags?: string[]; // Array of tag IDs
}

export type Page = "overview" | "category" | "catalogue";

export interface NavigationState {
  page: Page;
  categoryId?: string;
  styleId?: string; // For editing a specific style
}

// Metric View Options
export type GlobalMetricViewOption = "bullet";
export type CategoryMetricViewOption = "current" | "miniBullet" | "statusBar";
export type StyleMetricViewOption =
  | "current"
  | "detailed"
  | "compact"
  | "dataBar"
  | "chip";

export interface Component {
  id: string;
  name: string;
  cost: number;
  imageUrl?: string;
}
