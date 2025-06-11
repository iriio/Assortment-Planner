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
  PLACEHOLDER = "placeholder",
  ACTIVE = "active",
}

// PLM Status Stage System
export enum PLMStatusStage {
  DRAFT = "draft",
  BRIEFING = "briefing",
  PLANNING = "planning",
  READY_FOR_REVIEW = "ready_for_review",
  DESIGNING = "designing",
  FINALIZING = "finalizing",
  HANDOFF = "handoff",
  LAUNCHED = "launched",
}

export interface StatusStageDefinition {
  id: PLMStatusStage;
  label: string;
  description: string;
  colorClass: string;
  bgColorClass: string;
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
  color: string;
  sellingPrice: number;
  costPrice: number;
  margin: number;
  status: PlannedStyleStatus;
  plmStatus: PLMStatusStage; // New PLM status field
  imageUrl?: string;
  projectedSellIn?: number;
  projectedSellThrough?: number;
  components?: StyleComponentUsage[];
  tags?: string[]; // Array of tag IDs
}

export interface LinePlanCategory {
  id: string;
  name: string;
  plannedStyles: PlannedStyle[];
  targetVolume: number;
  plmStatus?: PLMStatusStage; // New PLM status field (optional, derived from children)
  targetMetrics?: {
    margin?: number;
    revenue?: number;
    sellThrough?: number;
  };
}

export interface LinePlan {
  id: string;
  name: string;
  season: string;
  categories: LinePlanCategory[];
  targetOverallMargin: number;
  targetOverallSellThrough: number;
  targetOverallRevenue: number;
  plmStatus: PLMStatusStage; // Made plmStatus mandatory
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

export interface ProjectCreationInput {
  name: string;
  targetVolume: number;
  targetRevenue: number;
  targetMargin: number; // As decimal, e.g., 0.6 for 60%
  targetSellThrough: number; // As decimal, e.g., 0.85 for 85%
}

export type ActiveTargetFilterType =
  | "revenue"
  | "margin"
  | "sellin"
  | "sellthrough";

export interface ActiveTargetFilter {
  type: ActiveTargetFilterType;
  displayName: string;
}
