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
  plmStatus: PLMStatusStage;
  imageUrl?: string;
  projectedSellIn?: number;
  projectedSellThrough?: number;
  components?: StyleComponentUsage[];
  tags?: string[]; // Array of tag IDs
  fitType?: string; // e.g., "Oversized", "Slim", "Relaxed"
  occasion?: string; // e.g., "Weekend", "Work", "Holiday"
  targetMetrics?: {
    margin?: number;
    revenue?: number;
    sellThrough?: number;
    sellIn?: number;
  };
  currentMetrics?: {
    margin?: number;
    revenue?: number;
    sellThrough?: number;
    sellIn?: number;
  };
}

export interface LinePlanCategory {
  id: string;
  name: string;
  plannedStyles: PlannedStyle[];
  targetVolume: number;
  plmStatus?: PLMStatusStage;
  targetMetrics?: {
    margin?: number;
    revenue?: number;
    sellThrough?: number;
    sellIn?: number;
  };
  currentMetrics?: {
    margin?: number;
    revenue?: number;
    sellThrough?: number;
    sellIn?: number;
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
  line: string;
  color: string[];
  availableSizes: string[];
  buyer: string[];
  dateAdded: string;
  unitsSold: number;
  fabric: string;
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

export interface Product {
  id: string;
  name: string;
  color: string;
  sellingPrice: number;
  costPrice: number;
  margin: number;
  status: PLMStatusStage;
  imageUrl?: string;
  sellThrough?: number;
  fitType?: string;
  occasion?: string;
  tags?: string[];
}

// Vendor Management Types
export interface Vendor {
  id: string;
  name: string;
  contact: {
    email: string;
    phone?: string;
    contactPerson: string;
  };
  categories: string[]; // Categories this vendor specializes in
  location: string;
  rating: number; // 1-5 star rating
  paymentTerms: string;
  leadTime: number; // in days
  minimumOrderQuantity: number;
  isActive: boolean;
  createdAt: string;
}

// RFQ Types
export enum RFQStatus {
  DRAFT = "draft",
  SENT = "sent",
  IN_REVIEW = "in_review",
  RESPONDED = "responded",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
}

export interface RFQItem {
  id: string;
  styleId: string;
  styleName: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  targetCost: number;
  specifications: string;
  imageUrl?: string;
  components?: StyleComponentUsage[];
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  description: string;
  status: RFQStatus;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  linePlanId: string;
  linePlanName: string;
  items: RFQItem[];
  vendorIds: string[]; // Vendors this RFQ was sent to
  totalTargetValue: number;
  currency: string;
  attachments?: string[];
}

// Quote Types
export interface QuoteItem {
  rfqItemId: string;
  unitCost: number;
  minimumOrderQuantity: number;
  leadTime: number; // in days
  notes?: string;
  alternativeOptions?: {
    description: string;
    unitCost: number;
    leadTime: number;
  }[];
}

export interface Quote {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  quoteNumber: string;
  status: "pending" | "submitted" | "accepted" | "rejected";
  submittedAt?: string;
  expiryDate: string;
  items: QuoteItem[];
  totalValue: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  validityPeriod: number; // in days
  notes?: string;
  attachments?: string[];
}

// Costing Analysis Types
export interface CostingAnalysis {
  id: string;
  linePlanId: string;
  styleId: string;
  styleName: string;
  currentCost: number;
  targetCost: number;
  bestQuoteCost?: number;
  bestVendorId?: string;
  costVariance: number; // percentage difference from target
  marginImpact: number; // impact on margin percentage
  recommendedAction: "accept" | "negotiate" | "reject" | "redesign";
  quotes: Quote[];
  createdAt: string;
  updatedAt: string;
}

// Cost Adjustment Types
export interface CostAdjustment {
  id: string;
  styleId: string;
  categoryId: string;
  linePlanId: string;
  oldCost: number;
  newCost: number;
  reason: string;
  quoteId?: string; // If based on a quote
  vendorId?: string;
  adjustedBy: string;
  adjustedAt: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
}

// Costing Workflow State
export interface CostingWorkflowState {
  activeRFQs: RFQ[];
  pendingQuotes: Quote[];
  costingAnalyses: CostingAnalysis[];
  recentAdjustments: CostAdjustment[];
  vendors: Vendor[];
  workflowStep:
    | "rfq_creation"
    | "quote_collection"
    | "cost_analysis"
    | "adjustment";
}
