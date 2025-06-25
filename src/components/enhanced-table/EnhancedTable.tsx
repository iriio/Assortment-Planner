import React, { useState, useCallback } from "react";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnhancedTable } from "@/hooks/useEnhancedTable";
import { TableControls } from "./TableControls";
import { TablePagination } from "./TablePagination";
import {
  EnhancedColumnDef,
  TableConfig,
  ColumnPreset,
  ResponsiveConfig,
} from "@/types/table";
import {
  getTableClasses,
  getTableContainerClasses,
  getStickyHeaderClasses,
} from "@/utils/table";
import { cn } from "@/utils";

interface EnhancedTableProps<TData> {
  data: TData[];
  columns: EnhancedColumnDef<TData, any>[];
  config: TableConfig;
  presets?: ColumnPreset[];
  responsiveConfig?: ResponsiveConfig;
  enableResponsive?: boolean;
  showControls?: boolean;
  showPagination?: boolean;
  searchColumn?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  getRowClassName?: (row: TData) => string;
  className?: string;
  emptyMessage?: string;
}

export function EnhancedTable<TData>({
  data,
  columns: initialColumns,
  config,
  presets,
  responsiveConfig,
  enableResponsive = true,
  showControls = true,
  showPagination = true,
  searchColumn,
  searchPlaceholder = "Search...",
  onRowClick,
  getRowClassName,
  className,
  emptyMessage = "No results found.",
}: EnhancedTableProps<TData>) {
  // State for sticky columns
  const [stickyColumns, setStickyColumns] = useState<Record<string, boolean>>(
    () => {
      return initialColumns.reduce((acc, col) => {
        acc[col.id] = col.isSticky ?? false;
        return acc;
      }, {} as Record<string, boolean>);
    }
  );

  // Update columns with sticky state
  const columns = React.useMemo(() => {
    return initialColumns.map((col) => ({
      ...col,
      isSticky: stickyColumns[col.id] ?? false,
    }));
  }, [initialColumns, stickyColumns]);

  // Handle sticky column changes
  const handleStickyChange = useCallback(
    (columnId: string, isSticky: boolean) => {
      setStickyColumns((prev) => ({
        ...prev,
        [columnId]: isSticky,
      }));
    },
    []
  );

  const {
    table,
    columnPresets,
    activePreset,
    setActivePreset,
    resetToDefaults,
    stickyStyles,
    enhancedColumns,
  } = useEnhancedTable({
    data,
    columns,
    config: {
      ...config,
      enableColumnResizing: true,
    },
    presets,
    responsiveConfig,
    enableResponsive,
  });

  return (
    <div className={cn("space-y-4 min-w-0 w-full", className)}>
      {/* Table Controls */}
      {showControls && (
        <TableControls
          table={table}
          enhancedColumns={enhancedColumns}
          columnPresets={columnPresets}
          activePreset={activePreset}
          onPresetChange={setActivePreset}
          onResetToDefaults={resetToDefaults}
          searchColumn={searchColumn}
          searchPlaceholder={searchPlaceholder}
          onStickyChange={handleStickyChange}
        />
      )}

      {/* Table Container with horizontal scroll */}
      <div className={getTableContainerClasses(true)}>
        <Table className={cn(getTableClasses(), "border-collapse")}>
          <TableHeader
            className={cn(
              config.stickyHeader && getStickyHeaderClasses(),
              "border-b border-border"
            )}
          >
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
                  const enhancedCol = enhancedColumns.find(
                    (col: EnhancedColumnDef<TData, any>) => col.id === header.id
                  );
                  const stickyStyle = stickyStyles[header.id];

                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: enhancedCol?.minWidth,
                        maxWidth: enhancedCol?.maxWidth,
                        ...stickyStyle,
                      }}
                      className={cn(
                        enhancedCol?.isSticky && "bg-background",
                        "relative border-r border-border",
                        "group" // For hover effects
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {/* Column resize handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 bg-border cursor-col-resize select-none touch-none opacity-0 group-hover:opacity-100",
                            header.column.getIsResizing() &&
                              "opacity-100 bg-blue-500"
                          )}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    "border-b border-border",
                    getRowClassName?.(row.original)
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell: any) => {
                    const enhancedCol = enhancedColumns.find(
                      (col: EnhancedColumnDef<TData, any>) =>
                        col.id === cell.column.id
                    );
                    const stickyStyle = stickyStyles[cell.column.id];

                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: enhancedCol?.minWidth,
                          maxWidth: enhancedCol?.maxWidth,
                          ...stickyStyle,
                        }}
                        className={cn(
                          enhancedCol?.isSticky && "bg-background",
                          "border-r border-border"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && <TablePagination table={table} />}
    </div>
  );
}
