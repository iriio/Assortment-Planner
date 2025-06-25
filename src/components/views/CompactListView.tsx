/**
 * CompactListView Component
 *
 * A flexible data table component that can display either categories, styles, or products in a compact format.
 * Features include:
 * - Sortable columns
 * - Pagination
 * - Filtering
 * - Interactive status badges
 * - Financial metrics display
 * - Tag display
 */

import {
  LinePlanCategory,
  PLMStatusStage,
  PlannedStyle,
  Product,
} from "@/types";
import { CompactListTable } from "@/components/enhanced-table";

/**
 * Props for the CompactListView component
 * @property categories - Array of line plan categories to display
 * @property selectedCategoryId - ID of the currently selected category (if any)
 * @property onSelectCategory - Callback when a category is selected
 * @property onSelectStyle - Optional callback when a style is selected
 * @property onSelectProduct - Optional callback when a product is selected
 * @property activeTargetFilter - Current active target filter type
 * @property targetOverallMargin - Target margin percentage for the overall plan
 * @property onStatusChange - Callback when a category's status changes
 * @property onBackToCategories - Callback to return to categories view
 * @property products - Optional array of products to display in project detail view
 * @property selectedMetricForHighlighting - Optional metric for highlighting
 * @property isPoorPerformer - Optional function to determine if a category is a poor performer
 */
interface CompactListViewProps {
  categories: LinePlanCategory[];
  selectedCategoryId?: string | null;
  onSelectCategory: (category: LinePlanCategory) => void;
  onSelectStyle?: (style: PlannedStyle) => void;
  onSelectProduct?: (product: Product) => void;
  activeTargetFilter: "revenue" | "margin" | "sellin" | "sellthrough" | null;
  targetOverallMargin: number;
  onStatusChange: (category: LinePlanCategory, status: PLMStatusStage) => void;
  onBackToCategories: () => void;
  products?: Product[];
  selectedMetricForHighlighting?:
    | "revenue"
    | "margin"
    | "sell-in"
    | "sell-through"
    | null;
  isPoorPerformer?: (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => boolean;
  getHighlightReason?: (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => string;
  getPerformanceStatus?: (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => "excellent" | "good" | "near" | "poor" | null;
  // Product-level highlighting functions
  isProductPoorPerformer?: (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => boolean;
  getProductHighlightReason?: (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => string;
  getProductPerformanceStatus?: (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => "excellent" | "good" | "near" | "poor" | null;
}

export function CompactListView({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onSelectStyle,
  onSelectProduct,
  onStatusChange,
  products,
  selectedMetricForHighlighting,
  isPoorPerformer,
  getHighlightReason,
  getPerformanceStatus,
  isProductPoorPerformer,
  getProductHighlightReason,
  getProductPerformanceStatus,
}: CompactListViewProps): JSX.Element {
  // Find the selected category if an ID is provided
  const selectedCategory = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)
    : null;

  // Determine whether to show categories, styles, or products based on selection and props
  let mode: "categories" | "styles" | "products" = "categories";
  let data: LinePlanCategory[] | PlannedStyle[] | Product[] = categories;

  if (products) {
    mode = "products";
    data = products;
  } else if (selectedCategory) {
    mode = "styles";
    data = selectedCategory.plannedStyles;
  }

  // Handle row click events
  const handleRowClick = (row: LinePlanCategory | PlannedStyle | Product) => {
    if (products) {
      onSelectProduct?.(row as Product);
    } else if (selectedCategory) {
      onSelectStyle?.(row as PlannedStyle);
    } else {
      onSelectCategory(row as LinePlanCategory);
    }
  };

  return (
    <div className="space-y-5 min-w-0 w-full">
      <CompactListTable
        data={data}
        mode={mode}
        onRowClick={handleRowClick}
        onStatusChange={onStatusChange}
        searchPlaceholder={`Search ${mode}...`}
        selectedMetricForHighlighting={selectedMetricForHighlighting}
        isPoorPerformer={isPoorPerformer}
        getHighlightReason={getHighlightReason}
        getPerformanceStatus={getPerformanceStatus}
        isProductPoorPerformer={isProductPoorPerformer}
        getProductHighlightReason={getProductHighlightReason}
        getProductPerformanceStatus={getProductPerformanceStatus}
        currentCategory={selectedCategory || undefined}
      />
    </div>
  );
}
