import { ColumnDef } from "@tanstack/react-table";
import { EnhancedColumnDef, ColumnPreset } from "@/types/table";
import React from "react";
import { SortableHeader } from "./CompactListTable";

// Helper to create enhanced column definition
export function createEnhancedColumn<TData, TValue = unknown>(
  options: {
    id: string;
    label: string;
    accessor?: string;
    group?: string;
    isSticky?: boolean;
    isDefaultVisible?: boolean;
    minWidth?: number;
    maxWidth?: number;
    enableSorting?: boolean;
  },
  columnDef: ColumnDef<TData, TValue>
): EnhancedColumnDef<TData, TValue> {
  // If the column already has a header component, use it as is
  if (typeof columnDef.header === "function") {
    return {
      columnDef: {
        ...columnDef,
        id: options.id,
        enableSorting: options.enableSorting ?? true,
        enableMultiSort: true,
        enableResizing: true,
      },
      id: options.id,
      label: options.label,
      accessor: options.accessor,
      group: options.group,
      isSticky: options.isSticky ?? false,
      isDefaultVisible: options.isDefaultVisible ?? true,
      minWidth: options.minWidth ?? 100,
      maxWidth: options.maxWidth,
    };
  }

  // Create a new header using SortableHeader component
  const newHeader = ({ column }: { column: any }) => {
    return React.createElement(SortableHeader, {
      column,
      label: options.label,
    });
  };

  return {
    columnDef: {
      ...columnDef,
      id: options.id,
      header: newHeader,
      enableSorting: options.enableSorting ?? true,
      enableMultiSort: true,
      enableResizing: true,
    },
    id: options.id,
    label: options.label,
    accessor: options.accessor,
    group: options.group,
    isSticky: options.isSticky ?? false,
    isDefaultVisible: options.isDefaultVisible ?? true,
    minWidth: options.minWidth ?? 100,
    maxWidth: options.maxWidth,
  };
}

// Helper to create column presets for specific table types
export function createColumnPresets(tableType: string): {
  planningView: ColumnPreset;
  performanceView: ColumnPreset;
  showAll: ColumnPreset;
} {
  const basePresets = {
    planningView: {
      id: `${tableType}-planning-view`,
      name: "Planning View",
      description: "Essential columns for planning phase",
      visibleColumns: [],
    },
    performanceView: {
      id: `${tableType}-performance-view`,
      name: "Performance View",
      description: "Key metrics and performance indicators",
      visibleColumns: [],
    },
    showAll: {
      id: `${tableType}-show-all`,
      name: "Show All",
      description: "Show all available columns",
      visibleColumns: [],
    },
  };

  return basePresets;
}

// Helper for common product/style table column presets
export function createProductTablePresets(): ColumnPreset[] {
  return [
    {
      id: "product-essential",
      name: "Essential",
      description: "Core product information",
      visibleColumns: ["name", "status", "sellingPrice", "margin"],
    },
    {
      id: "product-planning",
      name: "Planning View",
      description: "Planning and development focused columns",
      visibleColumns: [
        "name",
        "status",
        "color",
        "targetVolume",
        "plannedDelivery",
      ],
    },
    {
      id: "product-performance",
      name: "Performance View",
      description: "Sales and performance metrics",
      visibleColumns: [
        "name",
        "sellingPrice",
        "margin",
        "status",
        "actualSales",
        "targetVolume",
      ],
    },
    {
      id: "product-detailed",
      name: "Detailed View",
      description: "All product details",
      visibleColumns: [], // Empty means show all
    },
  ];
}

// Helper for project/category table column presets
export function createProjectTablePresets(): ColumnPreset[] {
  return [
    {
      id: "project-overview",
      name: "Overview",
      description: "High-level project information",
      visibleColumns: ["name", "status", "targetVolume", "styleCount"],
    },
    {
      id: "project-planning",
      name: "Planning View",
      description: "Planning and timeline focused",
      visibleColumns: [
        "name",
        "status",
        "targetVolume",
        "plannedDelivery",
        "styleCount",
      ],
    },
    {
      id: "project-performance",
      name: "Performance View",
      description: "Performance and metrics focused",
      visibleColumns: [
        "name",
        "targetVolume",
        "actualSales",
        "status",
        "margin",
      ],
    },
  ];
}

// Helper to create sticky columns configuration
export function createStickyColumnsConfig(
  columnIds: string[]
): Record<string, boolean> {
  return columnIds.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {} as Record<string, boolean>);
}
