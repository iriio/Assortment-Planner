import React from "react";
import { ChevronDown, Settings2, RotateCcw, Pin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ColumnPreset, EnhancedColumnDef } from "@/types/table";

interface TableControlsProps<TData> {
  table: any; // TanStack table instance
  enhancedColumns: EnhancedColumnDef<TData, any>[];
  columnPresets: ColumnPreset[];
  activePreset: string | undefined;
  onPresetChange: (presetId: string | undefined) => void;
  onResetToDefaults: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchColumn?: string;
  onStickyChange?: (columnId: string, isSticky: boolean) => void;
}

export function TableControls<TData>({
  table,
  enhancedColumns,
  columnPresets,
  activePreset,
  onPresetChange,
  onResetToDefaults,
  showSearch = true,
  searchPlaceholder = "Filter...",
  searchColumn,
  onStickyChange,
}: TableControlsProps<TData>) {
  // Get grouped columns for better organization
  const columnGroups = React.useMemo(() => {
    const groups: Record<string, EnhancedColumnDef<TData, any>[]> = {};
    enhancedColumns.forEach((col) => {
      const group = col.group || "General";
      if (!groups[group]) groups[group] = [];
      groups[group].push(col);
    });
    return groups;
  }, [enhancedColumns]);

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex items-center space-x-2">
        {/* Search Input */}
        {showSearch && searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}

        {/* Selected Row Counter */}
        {selectedRowCount > 0 && (
          <Badge variant="secondary">
            {selectedRowCount} of {totalRowCount} row(s) selected
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Column Presets */}
        <Select
          value={activePreset || "custom"}
          onValueChange={(value) =>
            onPresetChange(value === "custom" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Select preset" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom View</SelectItem>
            {columnPresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings2 className="h-4 w-4 mr-2" />
              Columns
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[250px]">
            {Object.entries(columnGroups).map(([groupName, columns]) => (
              <div key={groupName}>
                {Object.keys(columnGroups).length > 1 && (
                  <>
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {groupName}
                    </DropdownMenuLabel>
                  </>
                )}
                {columns.map((col) => (
                  <DropdownMenuSub key={col.id}>
                    <DropdownMenuSubTrigger className="capitalize">
                      <div className="flex items-center justify-between w-full">
                        <span>{col.label}</span>
                        {col.isSticky && (
                          <Badge variant="outline" className="text-xs">
                            Sticky
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuCheckboxItem
                        checked={
                          table.getColumn(col.id)?.getIsVisible() ??
                          col.isDefaultVisible
                        }
                        onCheckedChange={(value) => {
                          const column = table.getColumn(col.id);
                          if (column) {
                            column.toggleVisibility(!!value);
                          }
                        }}
                      >
                        Visible
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={col.isSticky}
                        onCheckedChange={(value) =>
                          onStickyChange?.(col.id, value)
                        }
                      >
                        <div className="flex items-center">
                          <Pin className="h-4 w-4 mr-2" />
                          Sticky
                        </div>
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
                {Object.keys(columnGroups).length > 1 && (
                  <DropdownMenuSeparator />
                )}
              </div>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onResetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to defaults
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Preset quick selector component
interface PresetQuickSelectorProps {
  presets: ColumnPreset[];
  activePreset: string | undefined;
  onPresetChange: (presetId: string | undefined) => void;
}

export function PresetQuickSelector({
  presets,
  activePreset,
  onPresetChange,
}: PresetQuickSelectorProps) {
  return (
    <div className="flex items-center space-x-1">
      {presets.map((preset) => (
        <Button
          key={preset.id}
          variant={activePreset === preset.id ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange(preset.id)}
          className="text-xs"
        >
          {preset.name}
        </Button>
      ))}
      {activePreset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPresetChange(undefined)}
          className="text-xs"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
