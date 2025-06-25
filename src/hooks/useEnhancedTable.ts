import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import {
  EnhancedColumnDef,
  TableConfig,
  ColumnPreset,
  PersistedTableState,
  UseEnhancedTableReturn,
  ResponsiveConfig,
} from "@/types/table";
import {
  createColumnDefs,
  getDefaultColumnVisibility,
  getStickyColumnStyles,
  getResponsiveColumnVisibility,
  DEFAULT_PRESETS,
  DEFAULT_RESPONSIVE_CONFIG,
  TableStateManager,
  applyPresetToColumns,
} from "@/utils/table";

interface UseEnhancedTableProps<TData> {
  data: TData[];
  columns: EnhancedColumnDef<TData, any>[];
  config: TableConfig;
  presets?: ColumnPreset[];
  responsiveConfig?: ResponsiveConfig;
  enableResponsive?: boolean;
}

export function useEnhancedTable<TData>({
  data,
  columns,
  config,
  presets = DEFAULT_PRESETS,
  responsiveConfig = DEFAULT_RESPONSIVE_CONFIG,
  enableResponsive = true,
}: UseEnhancedTableProps<TData>): UseEnhancedTableReturn<TData> {
  // State management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => getDefaultColumnVisibility(columns)
  );
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: config.defaultPageSize || 10,
  });
  const [activePreset, setActivePreset] = useState<string | undefined>(
    undefined
  );

  // Initialize state manager
  const stateManager = useMemo(
    () => new TableStateManager(config.id),
    [config.id]
  );

  // Screen width tracking for responsive behavior
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    if (!enableResponsive || typeof window === "undefined") return;

    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enableResponsive]);

  // Apply responsive column visibility
  useEffect(() => {
    if (!enableResponsive) return;

    const responsiveVisibility = getResponsiveColumnVisibility(
      columns,
      screenWidth,
      responsiveConfig
    );

    // Merge with current visibility, prioritizing user selections for non-responsive columns
    setColumnVisibility((prev) => {
      const merged = { ...prev };
      Object.entries(responsiveVisibility).forEach(([columnId, isVisible]) => {
        const column = columns.find((col) => col.id === columnId);
        if (column && column.priority !== undefined) {
          merged[columnId] = isVisible;
        }
      });
      return merged;
    });
  }, [screenWidth, columns, enableResponsive, responsiveConfig]);

  // Load persisted state on mount
  useEffect(() => {
    if (!config.persistState) return;

    const savedState = stateManager.loadState();
    if (savedState) {
      if (savedState.columnVisibility) {
        setColumnVisibility(savedState.columnVisibility);
      }
      if (savedState.stickyColumns) {
        // Update columns with saved sticky state
        columns.forEach((col) => {
          if (savedState.stickyColumns?.[col.id] !== undefined) {
            col.isSticky = savedState.stickyColumns[col.id];
          }
        });
      }
      if (savedState.sorting) {
        setSorting(savedState.sorting);
      }
      if (savedState.filters) {
        setColumnFilters(savedState.filters);
      }
      if (savedState.pagination) {
        setPagination(savedState.pagination);
      }
      if (savedState.activePreset) {
        setActivePreset(savedState.activePreset);
      }
    }
  }, [config.persistState, stateManager, columns]);

  // Save state changes
  useEffect(() => {
    if (!config.persistState) return;

    const state: PersistedTableState = {
      columnVisibility,
      sorting,
      filters: columnFilters,
      pagination,
      activePreset,
      stickyColumns: columns.reduce((acc, col) => {
        acc[col.id] = col.isSticky ?? false;
        return acc;
      }, {} as Record<string, boolean>),
    };

    stateManager.saveState(state);
  }, [
    columnVisibility,
    sorting,
    columnFilters,
    pagination,
    activePreset,
    config.persistState,
    stateManager,
    columns,
  ]);

  // Convert enhanced columns to TanStack columns
  const tanstackColumns = useMemo(() => createColumnDefs(columns), [columns]);

  // Create table instance
  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    enableRowSelection: config.enableRowSelection ?? false,
    enableSorting: config.enableSorting ?? true,
    enableMultiSort: true,
    enableColumnFilters: config.enableFiltering ?? true,
    enableColumnResizing: config.enableColumnResizing ?? true,
    columnResizeMode: "onChange",
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Get sticky column styles
  const stickyStyles = useMemo(() => getStickyColumnStyles(columns), [columns]);

  // Apply preset
  const handleSetActivePreset = useCallback(
    (presetId: string | undefined) => {
      setActivePreset(presetId);

      if (!presetId) {
        // Reset to default visibility
        setColumnVisibility(getDefaultColumnVisibility(columns));
        return;
      }

      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        const newVisibility = applyPresetToColumns(columns, preset);
        setColumnVisibility(newVisibility);
      }
    },
    [columns, presets]
  );

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSorting([]);
    setColumnFilters([]);
    setColumnVisibility(getDefaultColumnVisibility(columns));
    setRowSelection({});
    setPagination({
      pageIndex: 0,
      pageSize: config.defaultPageSize || 10,
    });
    setActivePreset(undefined);

    if (config.persistState) {
      stateManager.clearState();
    }
  }, [columns, config.defaultPageSize, config.persistState, stateManager]);

  // Export current state
  const exportState = useCallback((): PersistedTableState => {
    return {
      columnVisibility,
      sorting,
      filters: columnFilters,
      pagination,
      activePreset,
    };
  }, [columnVisibility, sorting, columnFilters, pagination, activePreset]);

  // Import state
  const importState = useCallback((state: PersistedTableState) => {
    if (state.columnVisibility) setColumnVisibility(state.columnVisibility);
    if (state.sorting) setSorting(state.sorting);
    if (state.filters) setColumnFilters(state.filters);
    if (state.pagination) setPagination(state.pagination);
    if (state.activePreset !== undefined) setActivePreset(state.activePreset);
  }, []);

  return {
    table,
    tableConfig: config,
    columnPresets: presets,
    activePreset,
    setActivePreset: handleSetActivePreset,
    resetToDefaults,
    exportState,
    importState,
    // Additional utilities
    stickyStyles,
    enhancedColumns: columns,
    screenWidth,
  };
}
