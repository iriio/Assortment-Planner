import {
  EnhancedColumnDef,
  ColumnPreset,
  PersistedTableState,
  ResponsiveConfig,
} from "@/types/table";
import { ColumnDef } from "@tanstack/react-table";

// Default responsive configuration
export const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  columnPriorities: {},
};

// Convert enhanced column definitions to TanStack column definitions
export function createColumnDefs<TData>(
  enhancedColumns: EnhancedColumnDef<TData, any>[]
): ColumnDef<TData, any>[] {
  return enhancedColumns.map((enhanced) => ({
    ...enhanced.columnDef,
    id: enhanced.id,
    enableHiding: true, // Enable hiding for all columns by default
    enableSorting: enhanced.columnDef.enableSorting ?? true, // Enable sorting by default
    enableResizing: enhanced.columnDef.enableResizing ?? true, // Enable resizing by default
    size: enhanced.minWidth || 150, // Default size
    minSize: enhanced.minWidth || 100,
    maxSize: enhanced.maxWidth || 500,
    meta: {
      ...enhanced.columnDef.meta,
      label: enhanced.label,
      group: enhanced.group,
      isSticky: enhanced.isSticky,
      priority: enhanced.priority,
      minWidth: enhanced.minWidth,
      maxWidth: enhanced.maxWidth,
    },
  }));
}

// Get default column visibility from enhanced definitions
export function getDefaultColumnVisibility<TData>(
  enhancedColumns: EnhancedColumnDef<TData, any>[]
): Record<string, boolean> {
  return enhancedColumns.reduce((acc, col) => {
    acc[col.id] = col.isDefaultVisible ?? true;
    return acc;
  }, {} as Record<string, boolean>);
}

// Create sticky column styles
export function getStickyColumnStyles<TData>(
  enhancedColumns: EnhancedColumnDef<TData, any>[]
): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};
  let leftOffset = 0;

  enhancedColumns.forEach((col) => {
    if (col.isSticky) {
      styles[col.id] = {
        position: "sticky",
        left: leftOffset,
        zIndex: 1,
        backgroundColor: "white",
        borderRight: "1px solid rgb(226, 232, 240)", // border-slate-200
      };
      leftOffset += col.minWidth || 150; // Default column width
    }
  });

  return styles;
}

// Generate responsive column visibility based on screen width
export function getResponsiveColumnVisibility<TData>(
  enhancedColumns: EnhancedColumnDef<TData, any>[],
  screenWidth: number,
  config: ResponsiveConfig = DEFAULT_RESPONSIVE_CONFIG
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};

  // Always show sticky columns
  enhancedColumns.forEach((col) => {
    if (col.isSticky) {
      visibility[col.id] = true;
      return;
    }

    // Determine breakpoint
    let breakpoint = "xl";
    if (screenWidth < config.breakpoints.sm) breakpoint = "sm";
    else if (screenWidth < config.breakpoints.md) breakpoint = "md";
    else if (screenWidth < config.breakpoints.lg) breakpoint = "lg";

    // Hide columns based on priority and breakpoint
    const priority = col.priority ?? 100;
    switch (breakpoint) {
      case "sm":
        visibility[col.id] = priority >= 90; // Only highest priority
        break;
      case "md":
        visibility[col.id] = priority >= 70; // High priority
        break;
      case "lg":
        visibility[col.id] = priority >= 50; // Medium priority
        break;
      default:
        visibility[col.id] = true; // Show all on xl and above
    }
  });

  return visibility;
}

// Default presets
export const DEFAULT_PRESETS: ColumnPreset[] = [
  {
    id: "show-all",
    name: "Show All",
    description: "Show all available columns",
    visibleColumns: [], // Empty means show all
  },
  {
    id: "planning-view",
    name: "Planning View",
    description: "Essential columns for planning phase",
    visibleColumns: [], // Will be populated per table
  },
  {
    id: "performance-view",
    name: "Performance View",
    description: "Key metrics and performance indicators",
    visibleColumns: [], // Will be populated per table
  },
];

// Table state manager
export class TableStateManager {
  private readonly storageKey: string;

  constructor(tableId: string) {
    this.storageKey = `table-state-${tableId}`;
  }

  saveState(state: PersistedTableState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save table state:", error);
    }
  }

  loadState(): PersistedTableState | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load table state:", error);
      return null;
    }
  }

  clearState(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("Failed to clear table state:", error);
    }
  }
}

// Column grouping utilities
export function groupColumnsByGroup<TData>(
  enhancedColumns: EnhancedColumnDef<TData, any>[]
): Record<string, EnhancedColumnDef<TData, any>[]> {
  return enhancedColumns.reduce((acc, col) => {
    const group = col.group || "default";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(col);
    return acc;
  }, {} as Record<string, EnhancedColumnDef<TData, any>[]>);
}

// CSS class generators
export function getTableClasses(): string {
  const baseClasses = "w-full caption-bottom text-sm";
  return baseClasses; // Remove min-w-full to allow proper shrinking
}

export function getTableContainerClasses(hasHorizontalScroll = true): string {
  const baseClasses = "relative w-full border rounded-md";
  return hasHorizontalScroll
    ? `${baseClasses} overflow-x-auto min-w-0`
    : `${baseClasses} overflow-auto`;
}

export function getStickyHeaderClasses(): string {
  return "sticky top-0 z-10 bg-white";
}

// Preset management utilities
export function applyPresetToColumns<TData>(
  enhancedColumns: EnhancedColumnDef<TData, any>[],
  preset: ColumnPreset
): Record<string, boolean> {
  const visibility: Record<string, boolean> = {};

  if (preset.visibleColumns.length === 0) {
    // Show all columns
    enhancedColumns.forEach((col) => {
      visibility[col.id] = true;
    });
  } else {
    // Show only specified columns
    enhancedColumns.forEach((col) => {
      visibility[col.id] = preset.visibleColumns.includes(col.id);
    });
  }

  return visibility;
}

// Create preset from current visibility
export function createPresetFromVisibility(
  id: string,
  name: string,
  columnVisibility: Record<string, boolean>,
  description?: string
): ColumnPreset {
  const visibleColumns = Object.entries(columnVisibility)
    .filter(([_, isVisible]) => isVisible)
    .map(([columnId]) => columnId);

  return {
    id,
    name,
    description,
    visibleColumns,
  };
}
