import { ColumnDef } from "@tanstack/react-table";

// Enhanced column definition with additional metadata
export interface EnhancedColumnDef<TData, TValue = unknown> {
  // Core TanStack column definition
  columnDef: ColumnDef<TData, TValue>;

  // Enhanced metadata
  id: string;
  label: string;
  accessor?: string;
  group?: string;
  isSticky?: boolean;
  isDefaultVisible?: boolean;
  priority?: number; // For responsive hiding - lower numbers are hidden first
  minWidth?: number;
  maxWidth?: number;
}

// Column visibility presets
export interface ColumnPreset {
  id: string;
  name: string;
  description?: string;
  visibleColumns: string[];
}

// Table configuration
export interface TableConfig {
  id: string; // Unique identifier for persistence
  persistState?: boolean;
  defaultPageSize?: number;
  enableFiltering?: boolean;
  enableColumnResizing?: boolean;
  enableRowSelection?: boolean;
  stickyHeader?: boolean;
  enableSorting?: boolean;
  meta?: {
    selectedMetric?: string | null;
  };
}

// Persisted table state
export interface PersistedTableState {
  columnVisibility?: Record<string, boolean>;
  columnOrder?: string[];
  columnSizing?: Record<string, number>;
  stickyColumns?: Record<string, boolean>;
  sorting?: Array<{ id: string; desc: boolean }>;
  filters?: Array<{ id: string; value: any }>;
  pagination?: { pageIndex: number; pageSize: number };
  activePreset?: string;
}

// Hook return type
export interface UseEnhancedTableReturn<TData> {
  table: any; // TanStack table instance
  tableConfig: TableConfig;
  columnPresets: ColumnPreset[];
  activePreset: string | undefined;
  setActivePreset: (presetId: string | undefined) => void;
  resetToDefaults: () => void;
  exportState: () => PersistedTableState;
  importState: (state: PersistedTableState) => void;
  // Additional utilities
  stickyStyles: Record<string, React.CSSProperties>;
  enhancedColumns: EnhancedColumnDef<TData, any>[];
  screenWidth: number;
}

// Responsive breakpoints for column hiding
export interface ResponsiveConfig {
  breakpoints: {
    sm: number; // 640px
    md: number; // 768px
    lg: number; // 1024px
    xl: number; // 1280px
  };
  columnPriorities: Record<string, number>;
}
