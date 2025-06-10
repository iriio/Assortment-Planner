/**
 * CompactListView Component
 *
 * A flexible data table component that can display either categories or styles in a compact format.
 * Features include:
 * - Sortable columns
 * - Pagination
 * - Filtering
 * - Interactive status badges
 * - Financial metrics display
 * - Tag display
 */

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  Row,
} from "@tanstack/react-table";
import { LinePlanCategory, PLMStatusStage, PlannedStyle } from "../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import TagListDisplay from "../common/TagListDisplay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateCategoryStatus } from "../../utils/statusSystem";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "../../components/ui/search-bar";

/**
 * Props for the CompactListView component
 * @property categories - Array of line plan categories to display
 * @property selectedCategoryId - ID of the currently selected category (if any)
 * @property onSelectCategory - Callback when a category is selected
 * @property onSelectStyle - Optional callback when a style is selected
 * @property activeTargetFilter - Current active target filter type
 * @property targetOverallMargin - Target margin percentage for the overall plan
 * @property onStatusChange - Callback when a category's status changes
 * @property onBackToCategories - Callback to return to categories view
 */
interface CompactListViewProps {
  categories: LinePlanCategory[];
  selectedCategoryId?: string | null;
  onSelectCategory: (category: LinePlanCategory) => void;
  onSelectStyle?: (style: PlannedStyle) => void;
  activeTargetFilter: "revenue" | "margin" | "sellin" | "sellthrough" | null;
  targetOverallMargin: number;
  onStatusChange: (category: LinePlanCategory, status: PLMStatusStage) => void;
  onBackToCategories: () => void;
}

export function CompactListView({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onSelectStyle,
  onStatusChange,
}: CompactListViewProps): JSX.Element {
  // State management for table features
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  // Find the selected category if an ID is provided
  const selectedCategory = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)
    : null;

  // Determine whether to show categories or styles based on selection
  type TableDataType = LinePlanCategory | PlannedStyle;
  const tableData: TableDataType[] = selectedCategory
    ? selectedCategory.plannedStyles
    : categories;

  /**
   * Column definitions for the styles view
   * Includes: Status, Style Details, Pricing, Performance, and Tags
   */
  const styleColumns: ColumnDef<PlannedStyle>[] = [
    {
      accessorKey: "status",
      header: "Status",
      size: 70,
      cell: ({ row }) => {
        const status = row.original.plmStatus || PLMStatusStage.BRIEFING;
        return <StatusBadge status={status} interactive={false} size="sm" />;
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Style Details
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      size: 250,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.name || `Style ${row.original.id}`}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{row.original.id}</span>
            {row.original.color && (
              <Badge variant="outline" className="font-normal">
                {row.original.color}
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "pricing",
      header: "Pricing",
      size: 180,
      cell: ({ row }) => {
        const style = row.original;
        const margin = (style.margin * 100).toFixed(1);
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {formatCurrency(style.sellingPrice)}
            </div>
            <div className="text-sm text-muted-foreground">
              Cost: {formatCurrency(style.costPrice)} • Margin: {margin}%
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "performance",
      header: "Performance",
      size: 200,
      cell: ({ row }) => {
        const style = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">
              Sell-In: {style.projectedSellIn || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Sell-Through: {formatPercentage(style.projectedSellThrough || 0)}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      size: 200,
      cell: ({ row }) => (
        <div className="w-full max-w-[300px]">
          <TagListDisplay tagIds={row.original.tags || []} />
        </div>
      ),
    },
  ];

  /**
   * Column definitions for the categories view
   * Includes: Status, Category Name, Financial Metrics, Performance, and Tags
   */
  const categoryColumns: ColumnDef<LinePlanCategory>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "numStyles",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Styles
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{(row.original.plannedStyles || []).length}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status =
          row.original.plmStatus || calculateCategoryStatus(row.original);
        return (
          <StatusBadge
            status={status}
            onStatusChange={(newStatus) =>
              onStatusChange(row.original, newStatus)
            }
            interactive={true}
            size="sm"
          />
        );
      },
    },
    {
      accessorKey: "margin",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Margin
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const styles = row.original.plannedStyles || [];
        const avgMargin =
          styles.length > 0
            ? styles.reduce((sum, style) => sum + style.margin, 0) /
              styles.length
            : 0;
        return <div>{formatPercentage(avgMargin)}</div>;
      },
    },
    {
      accessorKey: "marginContribution",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Margin Contribution
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
            sum + style.costPrice * (row.original.targetVolume / styles.length),
          0
        );
        const marginContribution = totalRevenue - totalCost;
        return <div>{formatCurrency(marginContribution)}</div>;
      },
    },
    {
      accessorKey: "revenue",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Revenue
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const styles = row.original.plannedStyles || [];
        const totalRevenue = styles.reduce(
          (sum, style) =>
            sum +
            style.sellingPrice * (row.original.targetVolume / styles.length),
          0
        );
        return <div>{formatCurrency(totalRevenue)}</div>;
      },
    },
  ];

  /**
   * Initialize the table with React Table configuration
   * Handles sorting, pagination, and filtering
   */
  const table = useReactTable({
    data: tableData,
    columns: (selectedCategory
      ? styleColumns
      : categoryColumns) as ColumnDef<TableDataType>[],
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageSize: rowsPerPage,
        pageIndex: 0,
      },
    },
  });

  /**
   * Handle row click events
   * Triggers appropriate callback based on whether viewing categories or styles
   */
  const handleRowClick = (row: Row<TableDataType>) => {
    if (selectedCategory) {
      onSelectStyle?.(row.original as PlannedStyle);
    } else {
      onSelectCategory(row.original as LinePlanCategory);
    }
  };

  const handleSearch = (query: string) => {
    table.getColumn("name")?.setFilterValue(query);

    // Create search results for the dropdown
    const filteredData = tableData.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    const results = filteredData.map((item) => ({
      id: item.id,
      title: item.name,
      type: selectedCategory ? "Style" : "Category",
      originalData: item,
    }));

    setSearchResults(results);
  };

  const handleSelectSearchResult = (result: any) => {
    const item = result.originalData;
    if (selectedCategory) {
      onSelectStyle?.(item as PlannedStyle);
    } else {
      onSelectCategory(item as LinePlanCategory);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header section with navigation and controls */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <SearchBar
              placeholder={`Search ${
                selectedCategory ? "styles" : "categories"
              }...`}
              onSearch={handleSearch}
              results={searchResults}
              onSelectResult={handleSelectSearchResult}
              className="w-[300px]"
            />
          </div>
          <div className="flex items-center space-x-3">
            <p className="text-sm text-muted-foreground">Rows per page</p>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => setRowsPerPage(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={rowsPerPage} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main table section */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50 "
                  onClick={() => handleRowClick(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No {selectedCategory ? "styles" : "categories"} found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and results info footer */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length}{" "}
          {selectedCategory ? "style" : "category"}
          {table.getCoreRowModel().rows.length === 1 ? "" : "s"} shown
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
