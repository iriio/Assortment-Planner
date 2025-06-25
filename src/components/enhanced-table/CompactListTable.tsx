import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  LinePlanCategory,
  PLMStatusStage,
  PlannedStyle,
  Product,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/common/StatusBadge";
import TagListDisplay from "@/components/common/TagListDisplay";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { EnhancedTable } from "./EnhancedTable";
import {
  createEnhancedColumn,
  createProductTablePresets,
  createProjectTablePresets,
} from "./helpers";
import { TableConfig, EnhancedColumnDef, ColumnPreset } from "@/types/table";

interface CompactListTableProps {
  data: LinePlanCategory[] | PlannedStyle[] | Product[];
  mode: "categories" | "styles" | "products";
  onRowClick?: (row: LinePlanCategory | PlannedStyle | Product) => void;
  onStatusChange?: (category: LinePlanCategory, status: PLMStatusStage) => void;
  searchPlaceholder?: string;
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
  // Current category context for product highlighting
  currentCategory?: LinePlanCategory;
}

// SortableHeader component
export function SortableHeader({
  column,
  label,
}: {
  column: any;
  label: string;
}) {
  const isSorted = column.getIsSorted();
  const canSort = column.getCanSort();
  let icon = <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  if (isSorted === "desc")
    icon = <ArrowDown className="h-4 w-4 text-blue-600" />;
  if (isSorted === "asc") icon = <ArrowUp className="h-4 w-4 text-blue-600" />;

  if (!canSort)
    return <span className="truncate block max-w-[160px]">{label}</span>;

  return (
    <div className="flex items-center gap-2">
      <span className="truncate block max-w-[160px]">{label}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => {
          // Custom sort cycle: desc -> asc -> none
          if (!isSorted) column.toggleSorting(true); // first click: desc
          else if (isSorted === "desc")
            column.toggleSorting(false); // second click: asc
          else column.clearSorting(); // third click: none
        }}
      >
        {icon}
      </Button>
    </div>
  );
}

export function CompactListTable({
  data,
  mode,
  onRowClick,
  onStatusChange,
  searchPlaceholder,
  selectedMetricForHighlighting,
  isPoorPerformer,

  isProductPoorPerformer,

  currentCategory,
}: CompactListTableProps) {
  // Create enhanced column definitions for styles
  const styleColumns: EnhancedColumnDef<PlannedStyle, any>[] = [
    // Identifier
    createEnhancedColumn(
      {
        id: "id",
        label: "ID",
        accessor: "id",
        group: "Identifier",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.original.id}</div>
        ),
      }
    ),

    // Basic Info
    createEnhancedColumn(
      {
        id: "imageUrl",
        label: "Image",
        accessor: "imageUrl",
        group: "Basic Info",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => (
          <div className="w-10 h-10">
            {row.original.imageUrl ? (
              <img
                src={row.original.imageUrl}
                alt={row.original.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                No Image
              </div>
            )}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "name",
        label: "Name",
        accessor: "name",
        group: "Basic Info",
        isSticky: false,
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} label="Name" />,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "color",
        label: "Color",
        accessor: "color",
        group: "Basic Info",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "color",
        header: ({ column }) => (
          <SortableHeader column={column} label="Color" />
        ),
        cell: ({ row }) => <div>{row.original.color}</div>,
      }
    ),

    // Status columns
    createEnhancedColumn(
      {
        id: "status",
        label: "Style Status",
        accessor: "status",
        group: "Status",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "status",
        header: "Style Status",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.status}</Badge>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "plmStatus",
        label: "PLM Status",
        accessor: "plmStatus",
        group: "Status",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "plmStatus",
        header: "PLM Status",
        cell: ({ row }) => {
          const status = row.original.plmStatus ?? PLMStatusStage.BRIEFING;
          return <StatusBadge status={status} interactive={false} size="sm" />;
        },
      }
    ),

    // Financial
    createEnhancedColumn(
      {
        id: "sellingPrice",
        label: "Selling Price",
        accessor: "sellingPrice",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "sellingPrice",
        accessorFn: (row) => row.sellingPrice,
        header: ({ column }) => (
          <SortableHeader column={column} label="Selling Price" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.sellingPrice)}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "costPrice",
        label: "Cost Price",
        accessor: "costPrice",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "costPrice",
        accessorFn: (row) => row.costPrice,
        header: ({ column }) => (
          <SortableHeader column={column} label="Cost Price" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.costPrice)}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "margin",
        label: "Margin",
        accessor: "margin",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "margin",
        accessorFn: (row) => Number(row.margin) || 0,
        header: ({ column }) => (
          <SortableHeader column={column} label="Margin" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatPercentage(row.original.margin)}
          </div>
        ),
      }
    ),

    // Performance
    createEnhancedColumn(
      {
        id: "projectedSellIn",
        label: "Projected Sell-In",
        accessor: "projectedSellIn",
        group: "Performance",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "projectedSellIn",
        header: ({ column }) => (
          <SortableHeader column={column} label="Projected Sell-In" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.projectedSellIn?.toLocaleString() || "-"}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "projectedSellThrough",
        label: "Projected Sell-Through",
        accessor: "projectedSellThrough",
        group: "Performance",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "projectedSellThrough",
        accessorFn: (row) => Number(row.projectedSellThrough) || 0,
        header: ({ column }) => (
          <SortableHeader column={column} label="Projected Sell-Through" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatPercentage(row.original.projectedSellThrough || 0)}
          </div>
        ),
      }
    ),

    // Additional Info
    createEnhancedColumn(
      {
        id: "fitType",
        label: "Fit Type",
        accessor: "fitType",
        group: "Additional Info",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "fitType",
        header: ({ column }) => (
          <SortableHeader column={column} label="Fit Type" />
        ),
        cell: ({ row }) => <div>{row.original.fitType || "-"}</div>,
      }
    ),

    createEnhancedColumn(
      {
        id: "occasion",
        label: "Occasion",
        accessor: "occasion",
        group: "Additional Info",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "occasion",
        header: ({ column }) => (
          <SortableHeader column={column} label="Occasion" />
        ),
        cell: ({ row }) => <div>{row.original.occasion || "-"}</div>,
      }
    ),

    // Components and Tags
    createEnhancedColumn(
      {
        id: "components",
        label: "Components",
        group: "Components & Tags",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        header: "Components",
        cell: ({ row }) => {
          const components = row.original.components || [];
          if (components.length === 0) return <div>-</div>;

          return (
            <div className="space-y-1">
              <div className="text-sm font-medium">
                {components.length} component
                {components.length !== 1 ? "s" : ""}
              </div>
              <div className="text-xs text-gray-500">
                {components
                  .map((comp) => (
                    <div key={comp.componentId}>
                      {comp.componentId}: {comp.quantity}
                    </div>
                  ))
                  .slice(0, 2)}
                {components.length > 2 && (
                  <div>+{components.length - 2} more</div>
                )}
              </div>
            </div>
          );
        },
      }
    ),

    createEnhancedColumn(
      {
        id: "tags",
        label: "Tags",
        group: "Components & Tags",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        header: "Tags",
        cell: ({ row }) => (
          <div className="w-full max-w-[300px]">
            <TagListDisplay tagIds={row.original.tags || []} />
          </div>
        ),
      }
    ),
  ];

  // Create enhanced column definitions for categories
  const categoryColumns: EnhancedColumnDef<LinePlanCategory, any>[] = [
    // Identifier
    createEnhancedColumn(
      {
        id: "id",
        label: "ID",
        accessor: "id",
        group: "Identifier",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.original.id}</div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "name",
        label: "Name",
        accessor: "name",
        group: "General",
        isSticky: false,
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} label="Name" />,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "numStyles",
        label: "Styles",
        group: "General",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "numStyles",
        accessorFn: (row) => (row.plannedStyles || []).length,
        header: ({ column }) => (
          <SortableHeader column={column} label="Styles" />
        ),
        cell: ({ row }) => (
          <div>{(row.original.plannedStyles || []).length}</div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "targetVolume",
        label: "Target Volume",
        accessor: "targetVolume",
        group: "General",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "targetVolume",
        header: ({ column }) => (
          <SortableHeader column={column} label="Target Volume" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {row.original.targetVolume?.toLocaleString() || "-"}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "status",
        label: "Status",
        accessor: "status",
        group: "General",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.plmStatus ?? PLMStatusStage.BRIEFING;
          return (
            <StatusBadge
              status={status}
              onStatusChange={(newStatus) =>
                onStatusChange?.(row.original, newStatus)
              }
              interactive={true}
              size="sm"
            />
          );
        },
      }
    ),

    createEnhancedColumn(
      {
        id: "margin",
        label: "Margin",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "margin",
        accessorFn: (row) => {
          const targetMargin = row.targetMetrics?.margin;
          if (targetMargin !== undefined) {
            return Number(targetMargin) || 0;
          }

          const styles = row.plannedStyles || [];
          const avgMargin =
            styles.length > 0
              ? styles.reduce(
                  (sum, style) => sum + (Number(style.margin) || 0),
                  0
                ) / styles.length
              : 0;
          return avgMargin;
        },
        header: ({ column }) => (
          <SortableHeader column={column} label="Margin" />
        ),
        cell: ({ row }) => {
          const targetMargin = row.original.targetMetrics?.margin;
          if (targetMargin !== undefined) {
            return <div>{formatPercentage(targetMargin)}</div>;
          }

          const styles = row.original.plannedStyles || [];
          const avgMargin =
            styles.length > 0
              ? styles.reduce((sum, style) => sum + style.margin, 0) /
                styles.length
              : 0;
          return <div>{formatPercentage(avgMargin)}</div>;
        },
      }
    ),

    createEnhancedColumn(
      {
        id: "marginContribution",
        label: "Margin Contribution",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "marginContribution",
        accessorFn: (row) => {
          const styles = row.plannedStyles || [];
          const totalRevenue = styles.reduce(
            (sum, style) =>
              sum + style.sellingPrice * (row.targetVolume / styles.length),
            0
          );
          const totalCost = styles.reduce(
            (sum, style) =>
              sum + style.costPrice * (row.targetVolume / styles.length),
            0
          );
          return totalRevenue - totalCost;
        },
        header: ({ column }) => (
          <SortableHeader column={column} label="Margin Contribution" />
        ),
        cell: ({ row }) => {
          const styles = row.original.plannedStyles || [];
          const totalRevenue = styles.reduce(
            (sum, style) =>
              sum +
              style.sellingPrice * (row.original.targetVolume / styles.length),
            0
          );
          const totalCost = styles.reduce(
            (sum, style) =>
              sum +
              style.costPrice * (row.original.targetVolume / styles.length),
            0
          );
          const marginContribution = totalRevenue - totalCost;
          return <div>{formatCurrency(marginContribution)}</div>;
        },
      }
    ),

    createEnhancedColumn(
      {
        id: "revenue",
        label: "Revenue",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "revenue",
        accessorFn: (row) => {
          const targetRevenue = row.targetMetrics?.revenue;
          if (targetRevenue !== undefined) {
            return targetRevenue;
          }

          const styles = row.plannedStyles || [];
          return styles.reduce(
            (sum, style) =>
              sum + style.sellingPrice * (row.targetVolume / styles.length),
            0
          );
        },
        header: ({ column }) => (
          <SortableHeader column={column} label="Revenue" />
        ),
        cell: ({ row }) => {
          const targetRevenue = row.original.targetMetrics?.revenue;
          if (targetRevenue !== undefined) {
            return <div>{formatCurrency(targetRevenue)}</div>;
          }

          const styles = row.original.plannedStyles || [];
          const totalRevenue = styles.reduce(
            (sum, style) =>
              sum +
              style.sellingPrice * (row.original.targetVolume / styles.length),
            0
          );
          return <div>{formatCurrency(totalRevenue)}</div>;
        },
      }
    ),

    createEnhancedColumn(
      {
        id: "sellThrough",
        label: "Sell Through",
        group: "Performance",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "sellThrough",
        accessorFn: (row) => {
          const targetSellThrough = row.targetMetrics?.sellThrough;
          if (targetSellThrough !== undefined) {
            return Number(targetSellThrough) || 0;
          }

          const styles = row.plannedStyles || [];
          const avgSellThrough =
            styles.length > 0
              ? styles.reduce(
                  (sum, style) =>
                    sum + (Number(style.projectedSellThrough) || 0),
                  0
                ) / styles.length
              : 0;
          return avgSellThrough;
        },
        header: ({ column }) => (
          <SortableHeader column={column} label="Sell Through" />
        ),
        cell: ({ row }) => {
          const targetSellThrough = row.original.targetMetrics?.sellThrough;
          if (targetSellThrough !== undefined) {
            return <div>{formatPercentage(targetSellThrough)}</div>;
          }

          const styles = row.original.plannedStyles || [];
          const avgSellThrough =
            styles.length > 0
              ? styles.reduce(
                  (sum, style) => sum + (style.projectedSellThrough || 0),
                  0
                ) / styles.length
              : 0;
          return <div>{formatPercentage(avgSellThrough)}</div>;
        },
      }
    ),
  ];

  // Create enhanced column definitions for products
  const productColumns: EnhancedColumnDef<Product, any>[] = [
    // Identifier
    createEnhancedColumn(
      {
        id: "id",
        label: "ID",
        accessor: "id",
        group: "Identifier",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-mono text-xs">{row.original.id}</div>
        ),
      }
    ),

    // Basic Info
    createEnhancedColumn(
      {
        id: "imageUrl",
        label: "Image",
        accessor: "imageUrl",
        group: "Basic Info",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => (
          <div className="w-10 h-10">
            {row.original.imageUrl ? (
              <img
                src={row.original.imageUrl}
                alt={row.original.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                No Image
              </div>
            )}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "name",
        label: "Name",
        accessor: "name",
        group: "Basic Info",
        isSticky: true,
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} label="Name" />,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "color",
        label: "Color",
        accessor: "color",
        group: "Basic Info",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "color",
        header: ({ column }) => (
          <SortableHeader column={column} label="Color" />
        ),
        cell: ({ row }) => <div>{row.original.color}</div>,
      }
    ),

    // Status
    createEnhancedColumn(
      {
        id: "status",
        label: "Status",
        accessor: "status",
        group: "Status",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge
            status={row.original.status}
            interactive={false}
            size="sm"
          />
        ),
      }
    ),

    // Financial
    createEnhancedColumn(
      {
        id: "sellingPrice",
        label: "Selling Price",
        accessor: "sellingPrice",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "sellingPrice",
        accessorFn: (row) => row.sellingPrice,
        header: ({ column }) => (
          <SortableHeader column={column} label="Selling Price" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.sellingPrice)}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "costPrice",
        label: "Cost Price",
        accessor: "costPrice",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "costPrice",
        accessorFn: (row) => row.costPrice,
        header: ({ column }) => (
          <SortableHeader column={column} label="Cost Price" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatCurrency(row.original.costPrice)}
          </div>
        ),
      }
    ),

    createEnhancedColumn(
      {
        id: "margin",
        label: "Margin",
        accessor: "margin",
        group: "Financial",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "margin",
        accessorFn: (row) => Number(row.margin) || 0,
        header: ({ column }) => (
          <SortableHeader column={column} label="Margin" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatPercentage(row.original.margin)}
          </div>
        ),
      }
    ),

    // Performance
    createEnhancedColumn(
      {
        id: "sellThrough",
        label: "Sell Through",
        accessor: "sellThrough",
        group: "Performance",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        id: "sellThrough",
        accessorFn: (row) => Number(row.sellThrough) || 0,
        header: ({ column }) => (
          <SortableHeader column={column} label="Sell Through" />
        ),
        cell: ({ row }) => (
          <div className="text-right">
            {formatPercentage(row.original.sellThrough || 0)}
          </div>
        ),
      }
    ),

    // Additional Info
    createEnhancedColumn(
      {
        id: "fitType",
        label: "Fit Type",
        accessor: "fitType",
        group: "Additional Info",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "fitType",
        header: ({ column }) => (
          <SortableHeader column={column} label="Fit Type" />
        ),
        cell: ({ row }) => <div>{row.original.fitType || "-"}</div>,
      }
    ),

    createEnhancedColumn(
      {
        id: "occasion",
        label: "Occasion",
        accessor: "occasion",
        group: "Additional Info",
        isDefaultVisible: false,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        accessorKey: "occasion",
        header: ({ column }) => (
          <SortableHeader column={column} label="Occasion" />
        ),
        cell: ({ row }) => <div>{row.original.occasion || "-"}</div>,
      }
    ),

    // Tags
    createEnhancedColumn(
      {
        id: "tags",
        label: "Tags",
        group: "Components & Tags",
        isDefaultVisible: true,
        minWidth: undefined,
        maxWidth: undefined,
      },
      {
        header: "Tags",
        cell: ({ row }) => (
          <div className="w-full max-w-[300px]">
            <TagListDisplay tagIds={row.original.tags || []} />
          </div>
        ),
      }
    ),
  ];

  // Table configuration
  const tableConfig: TableConfig = {
    id:
      mode === "categories"
        ? "compact-categories"
        : mode === "styles"
        ? "compact-styles"
        : "compact-products",
    persistState: true,
    defaultPageSize: 20,
    enableSorting: true,
    enableFiltering: true,
    enableRowSelection: false,
    stickyHeader: true,
  };

  // Get appropriate presets
  const presets: ColumnPreset[] =
    mode === "categories"
      ? createProjectTablePresets()
      : createProductTablePresets();

  // Determine columns and data based on mode
  const columns =
    mode === "categories"
      ? categoryColumns
      : mode === "styles"
      ? styleColumns
      : productColumns;
  const searchColumn = "name";

  // Helper function to determine if a row should be highlighted
  const shouldHighlightRow = (
    row: LinePlanCategory | PlannedStyle | Product
  ): boolean => {
    if (!selectedMetricForHighlighting) {
      return false;
    }

    if (mode === "categories" && isPoorPerformer) {
      return isPoorPerformer(
        row as LinePlanCategory,
        selectedMetricForHighlighting
      );
    }

    if (
      (mode === "styles" || mode === "products") &&
      isProductPoorPerformer &&
      currentCategory
    ) {
      const result = isProductPoorPerformer(
        row as PlannedStyle | Product,
        currentCategory,
        selectedMetricForHighlighting
      );
      console.log(
        `[HIGHLIGHT DEBUG] Product ${
          (row as any).name
        } for metric ${selectedMetricForHighlighting}: ${
          result ? "HIGHLIGHT" : "NO HIGHLIGHT"
        }`
      );
      return result;
    }

    return false;
  };

  // Render the appropriate table based on mode
  if (mode === "categories") {
    return (
      <EnhancedTable<LinePlanCategory>
        data={data as LinePlanCategory[]}
        columns={columns as EnhancedColumnDef<LinePlanCategory, any>[]}
        config={tableConfig}
        presets={presets}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder || `Search ${mode}...`}
        onRowClick={onRowClick}
        getRowClassName={(row) =>
          shouldHighlightRow(row)
            ? "bg-red-50/80 border-red-300 ring-1 ring-red-200"
            : ""
        }
        emptyMessage={`No ${mode} found.`}
        showPagination={true}
        showControls={true}
        enableResponsive={true}
      />
    );
  }

  if (mode === "styles") {
    return (
      <EnhancedTable<PlannedStyle>
        data={data as PlannedStyle[]}
        columns={columns as EnhancedColumnDef<PlannedStyle, any>[]}
        config={tableConfig}
        presets={presets}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder || `Search ${mode}...`}
        onRowClick={onRowClick}
        getRowClassName={(row) =>
          shouldHighlightRow(row)
            ? "bg-red-50/80 border-red-300 ring-1 ring-red-200"
            : ""
        }
        emptyMessage={`No ${mode} found.`}
        showPagination={true}
        showControls={true}
        enableResponsive={true}
      />
    );
  }

  return (
    <EnhancedTable<Product>
      data={data as Product[]}
      columns={columns as EnhancedColumnDef<Product, any>[]}
      config={tableConfig}
      presets={presets}
      searchColumn={searchColumn}
      searchPlaceholder={searchPlaceholder || `Search ${mode}...`}
      onRowClick={onRowClick}
      getRowClassName={(row) =>
        shouldHighlightRow(row)
          ? "bg-red-50/80 border-red-300 ring-1 ring-red-200"
          : ""
      }
      emptyMessage={`No ${mode} found.`}
      showPagination={true}
      showControls={true}
      enableResponsive={true}
    />
  );
}
