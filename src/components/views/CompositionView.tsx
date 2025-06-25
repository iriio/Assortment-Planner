import React, { useState, useMemo } from "react";
import { LinePlan, ProductTag, PLMStatusStage } from "@/types";
import { productTagsData } from "@/data";
import {
  ChevronLeftIcon,
  CollectionIcon,
  FunnelIcon,
  XMarkIcon,
  TagIcon,
} from "../common/icons";
import Modal from "../modals/Modal";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import TagListDisplay from "../common/TagListDisplay";
import StatusBadge from "../common/StatusBadge";

interface CompositionViewProps {
  linePlan: LinePlan;
  onBack: () => void;
  onProductClick: (projectId: string, productId: string) => void;
  filters: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
}

export interface FilterState {
  categories: string[];
  excludeCategories: string[];
  tags: string[];
  excludeTags: string[];
  priceRange: { min: number; max: number };
  marginRange: { min: number; max: number };
  status: string[];
}

const CompositionView: React.FC<CompositionViewProps> = ({
  linePlan,
  onBack,
  onProductClick,
  filters,
  onFiltersChange,
}) => {
  // Beautiful 20-color palette for projects
  const projectColorPalette = [
    {
      bg: "bg-emerald-500",
      border: "border-emerald-500",
      text: "text-emerald-700",
      light: "bg-emerald-50",
    },
    {
      bg: "bg-blue-500",
      border: "border-blue-500",
      text: "text-blue-700",
      light: "bg-blue-50",
    },
    {
      bg: "bg-purple-500",
      border: "border-purple-500",
      text: "text-purple-700",
      light: "bg-purple-50",
    },
    {
      bg: "bg-pink-500",
      border: "border-pink-500",
      text: "text-pink-700",
      light: "bg-pink-50",
    },
    {
      bg: "bg-orange-500",
      border: "border-orange-500",
      text: "text-orange-700",
      light: "bg-orange-50",
    },
    {
      bg: "bg-teal-500",
      border: "border-teal-500",
      text: "text-teal-700",
      light: "bg-teal-50",
    },
    {
      bg: "bg-indigo-500",
      border: "border-indigo-500",
      text: "text-indigo-700",
      light: "bg-indigo-50",
    },
    {
      bg: "bg-cyan-500",
      border: "border-cyan-500",
      text: "text-cyan-700",
      light: "bg-cyan-50",
    },
    {
      bg: "bg-red-500",
      border: "border-red-500",
      text: "text-red-700",
      light: "bg-red-50",
    },
    {
      bg: "bg-amber-500",
      border: "border-amber-500",
      text: "text-amber-700",
      light: "bg-amber-50",
    },
    {
      bg: "bg-lime-500",
      border: "border-lime-500",
      text: "text-lime-700",
      light: "bg-lime-50",
    },
    {
      bg: "bg-rose-500",
      border: "border-rose-500",
      text: "text-rose-700",
      light: "bg-rose-50",
    },
    {
      bg: "bg-violet-500",
      border: "border-violet-500",
      text: "text-violet-700",
      light: "bg-violet-50",
    },
    {
      bg: "bg-sky-500",
      border: "border-sky-500",
      text: "text-sky-700",
      light: "bg-sky-50",
    },
    {
      bg: "bg-green-500",
      border: "border-green-500",
      text: "text-green-700",
      light: "bg-green-50",
    },
    {
      bg: "bg-yellow-500",
      border: "border-yellow-500",
      text: "text-yellow-700",
      light: "bg-yellow-50",
    },
    {
      bg: "bg-fuchsia-500",
      border: "border-fuchsia-500",
      text: "text-fuchsia-700",
      light: "bg-fuchsia-50",
    },
    {
      bg: "bg-slate-500",
      border: "border-slate-500",
      text: "text-slate-700",
      light: "bg-slate-50",
    },
    {
      bg: "bg-stone-500",
      border: "border-stone-500",
      text: "text-stone-700",
      light: "bg-stone-50",
    },
    {
      bg: "bg-zinc-500",
      border: "border-zinc-500",
      text: "text-zinc-700",
      light: "bg-zinc-50",
    },
  ];

  // Function to get color for a project based on its index
  const getProjectColor = (index: number) => {
    return projectColorPalette[index % projectColorPalette.length];
  };

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  // Check if filters are active
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.excludeCategories.length > 0 ||
    filters.tags.length > 0 ||
    filters.excludeTags.length > 0 ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 1000 ||
    filters.marginRange.min > 0 ||
    filters.marginRange.max < 100 ||
    filters.status.length > 0;

  const openFilterModal = () => {
    setTempFilters(filters);
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange(tempFilters);
    }
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      excludeCategories: [],
      tags: [],
      excludeTags: [],
      priceRange: { min: 0, max: 1000 },
      marginRange: { min: 0, max: 100 },
      status: [],
    };
    setTempFilters(clearedFilters);
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
    setIsFilterModalOpen(false);
  };

  const handleTempFilterChange = (newFilters: Partial<FilterState>) => {
    setTempFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Get all products across all projects
  const allProducts = useMemo(() => {
    if (!linePlan?.categories) {
      return [];
    }
    return linePlan.categories.flatMap((category) =>
      category.plannedStyles.map((style) => ({
        ...style,
        projectName: category.name,
        projectId: category.id,
      }))
    );
  }, [linePlan?.categories]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) {
      return [];
    }
    return allProducts.filter((product) => {
      // Category filter (include)
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(product.projectName)
      ) {
        return false;
      }

      // Category filter (exclude)
      if (
        filters.excludeCategories.length > 0 &&
        filters.excludeCategories.includes(product.projectName)
      ) {
        return false;
      }

      // Tag filter (include)
      if (filters.tags.length > 0) {
        const productTags = product.tags || [];
        const hasMatchingTag = filters.tags.some((tag) =>
          productTags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Tag filter (exclude)
      if (filters.excludeTags.length > 0) {
        const productTags = product.tags || [];
        const hasExcludedTag = filters.excludeTags.some((tag) =>
          productTags.includes(tag)
        );
        if (hasExcludedTag) return false;
      }

      // Price range filter
      if (
        product.sellingPrice < filters.priceRange.min ||
        product.sellingPrice > filters.priceRange.max
      ) {
        return false;
      }

      // Margin range filter
      const marginPercentage = product.margin * 100;
      if (
        marginPercentage < filters.marginRange.min ||
        marginPercentage > filters.marginRange.max
      ) {
        return false;
      }

      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes(product.status)
      ) {
        return false;
      }

      return true;
    });
  }, [allProducts, filters]);

  // Group filtered products by project
  const productsByProject = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      if (!acc[product.projectId]) {
        acc[product.projectId] = {
          projectName: product.projectName,
          products: [],
        };
      }
      acc[product.projectId].products.push(product);
      return acc;
    }, {} as Record<string, { projectName: string; products: typeof filteredProducts }>);

    return grouped;
  }, [filteredProducts]);

  const getTagColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      slate: "bg-slate-100 text-slate-800 border-slate-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
      amber: "bg-amber-100 text-amber-800 border-amber-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200",
      emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
      violet: "bg-violet-100 text-violet-800 border-violet-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
      lime: "bg-lime-100 text-lime-800 border-lime-200",
      sky: "bg-sky-100 text-sky-800 border-sky-200",
      neutral: "bg-neutral-100 text-neutral-800 border-neutral-200",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const totalFilteredCount = filteredProducts.length;
  const totalProductCount = allProducts.length;

  // Get unique statuses from all products
  const availableStatuses = useMemo(() => {
    const statuses = new Set(allProducts.map((p) => p.status));
    return Array.from(statuses);
  }, [allProducts]);

  // Group tags by category
  const tagsByCategory = useMemo(() => {
    return productTagsData.reduce<Record<string, ProductTag[]>>((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {});
  }, []);

  const [groupByPrimary, setGroupByPrimary] = useState(false);
  const [primaryAttr, setPrimaryAttr] = useState("projectName");
  const [secondaryAttr, setSecondaryAttr] = useState("none");

  const attributeOptions = [
    { value: "projectName", label: "Project Name" },
    { value: "sellingPrice", label: "Selling Price" },
    { value: "margin", label: "Margin" },
    { value: "status", label: "Status" },
  ];

  const attributeLabel = (value: string) => {
    const found = attributeOptions.find((opt) => opt.value === value);
    return found ? found.label : value;
  };

  // Simple color palette for attribute values
  const colorPalette = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-cyan-500",
    "bg-red-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-sky-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-fuchsia-500",
    "bg-slate-500",
    "bg-stone-500",
    "bg-zinc-500",
  ];

  // Mock data for demonstration
  const mockAttributeValues: { [key: string]: string[] } = {
    projectName: ["Alpha", "Beta", "Gamma", "Delta"],
    sellingPrice: ["Low", "Mid", "High"],
    margin: ["Low", "Medium", "High"],
    status: ["Active", "Inactive", "Pending"],
  };
  // Generate mock composition data (proportions add to 1)
  const mockData = (primary: string, secondary?: string) => {
    const primVals: string[] = mockAttributeValues[primary] || [];
    if (!secondary) {
      // Single attribute: flat proportions
      return primVals.map((v: string, i: number) => ({
        value: v,
        percent: 1 / primVals.length,
        color: colorPalette[i % colorPalette.length],
      }));
    }
    // Two attributes: nested proportions
    const secVals: string[] = mockAttributeValues[secondary] || [];
    return primVals.map((pv: string, i: number) => ({
      value: pv,
      percent: 1 / primVals.length,
      color: colorPalette[i % colorPalette.length],
      breakdown: secVals.map((sv: string, j: number) => ({
        value: sv,
        percent: 1 / secVals.length,
        color: colorPalette[j % colorPalette.length],
      })),
    }));
  };

  // Chart rendering logic
  function renderCompositionChart({
    groupByPrimary,
    primaryAttr,
    secondaryAttr,
  }: {
    groupByPrimary: boolean;
    primaryAttr: string;
    secondaryAttr: string;
  }) {
    if (!primaryAttr) return null;
    if (secondaryAttr === "none") {
      // Single bar for primary attribute
      const data = mockData(primaryAttr);
      return (
        <div className="flex w-full h-4 rounded overflow-hidden">
          {data.map(
            (seg: { value: string; percent: number; color: string }) => (
              <div
                key={seg.value}
                className={seg.color}
                style={{ width: `${seg.percent * 100}%` }}
                title={seg.value}
              />
            )
          )}
        </div>
      );
    }
    if (!groupByPrimary) {
      // Two independent stacked bars
      return (
        <div className="flex flex-col gap-2">
          <div className="flex w-full h-4 rounded overflow-hidden">
            {mockData(primaryAttr).map(
              (seg: { value: string; percent: number; color: string }) => (
                <div
                  key={seg.value}
                  className={seg.color}
                  style={{ width: `${seg.percent * 100}%` }}
                  title={seg.value}
                />
              )
            )}
          </div>
          <div className="flex w-full h-4 rounded overflow-hidden">
            {mockData(secondaryAttr).map(
              (seg: { value: string; percent: number; color: string }) => (
                <div
                  key={seg.value}
                  className={seg.color}
                  style={{ width: `${seg.percent * 100}%` }}
                  title={seg.value}
                />
              )
            )}
          </div>
        </div>
      );
    }
    // Pivot view: group by primary, breakdown by secondary
    const data = mockData(primaryAttr, secondaryAttr) as {
      value: string;
      percent: number;
      color: string;
      breakdown: { value: string; percent: number; color: string }[];
    }[];
    const top2 = data.slice(0, 2);
    const other = data.length > 2 ? data.slice(2) : [];
    return (
      <div className="flex flex-col gap-2">
        {top2.map((group) => (
          <div key={group.value} className="flex items-center gap-2">
            <span className="w-24 text-xs text-slate-700 truncate">
              {group.value}
            </span>
            <div className="flex-1 flex h-4 rounded overflow-hidden">
              {group.breakdown.map(
                (seg: { value: string; percent: number; color: string }) => (
                  <div
                    key={seg.value}
                    className={seg.color}
                    style={{ width: `${seg.percent * 100}%` }}
                    title={seg.value}
                  />
                )
              )}
            </div>
          </div>
        ))}
        {other.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-24 text-xs text-slate-700 truncate">Other</span>
            <div className="flex-1 flex h-4 rounded overflow-hidden">
              {(mockAttributeValues[secondaryAttr] as string[]).map(
                (sv: string, j: number) => (
                  <div
                    key={sv}
                    className={colorPalette[j % colorPalette.length]}
                    style={{
                      width: `${
                        100 /
                        (mockAttributeValues[secondaryAttr] as string[]).length
                      }%`,
                    }}
                    title={sv}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Legend rendering logic
  function legendItems({
    groupByPrimary,
    primaryAttr,
    secondaryAttr,
  }: {
    groupByPrimary: boolean;
    primaryAttr: string;
    secondaryAttr: string;
  }) {
    if (secondaryAttr === "none" || (secondaryAttr && !groupByPrimary)) {
      // Show legend for both bars if two, else just primary
      const attrs = [primaryAttr];
      if (secondaryAttr !== "none") attrs.push(secondaryAttr);
      return attrs.flatMap((attr: string) =>
        (mockAttributeValues[attr] as string[]).map((v: string, i: number) => ({
          value: `${attr}-${v}`,
          label: `${attributeLabel(attr)}: ${v}`,
          color: colorPalette[i % colorPalette.length],
        }))
      );
    }
    // Grouped: legend for secondary attribute
    return (mockAttributeValues[secondaryAttr] as string[]).map(
      (v: string, i: number) => ({
        value: v,
        label: v,
        color: colorPalette[i % colorPalette.length],
      })
    );
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 mr-3 text-slate-500 hover:bg-slate-200 rounded-full transition-colors active:bg-slate-300"
            title="Back to Program"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">
              Assortment Composition
            </h2>
            <p className="text-sm text-slate-600">
              {linePlan.name} • {totalFilteredCount} of {totalProductCount}{" "}
              products match filters
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center space-x-1.5 px-3 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
          <button
            onClick={openFilterModal}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasActiveFilters
                ? "bg-sky-100 text-sky-700 border border-sky-300 hover:bg-sky-200"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 bg-sky-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {
                  [
                    filters.categories.length,
                    filters.excludeCategories.length,
                    filters.tags.length,
                    filters.excludeTags.length,
                    filters.status.length,
                    filters.priceRange.min > 0 || filters.priceRange.max < 1000
                      ? 1
                      : 0,
                    filters.marginRange.min > 0 || filters.marginRange.max < 100
                      ? 1
                      : 0,
                  ].filter(Boolean).length
                }
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- Responsive Composition Viewer Controls --- */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-6 gap-4">
          {/* Group By Toggle */}
          <div className="flex flex-col">
            <Label htmlFor="group-by-toggle" className="mb-1">
              Group by:
            </Label>
            <ToggleGroup
              type="single"
              value={groupByPrimary ? "on" : "off"}
              onValueChange={(v) => setGroupByPrimary(v === "on")}
              id="group-by-toggle"
              className="w-32"
            >
              <ToggleGroupItem value="off">Off</ToggleGroupItem>
              <ToggleGroupItem value="on">Primary</ToggleGroupItem>
            </ToggleGroup>
          </div>
          {/* Primary Attribute Dropdown */}
          <div className="flex flex-col flex-1 min-w-[180px]">
            <Label htmlFor="primary-attribute" className="mb-1">
              Primary Attribute
            </Label>
            <Select value={primaryAttr} onValueChange={setPrimaryAttr}>
              <SelectTrigger id="primary-attribute">
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                {attributeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Secondary Attribute Dropdown */}
          <div className="flex flex-col flex-1 min-w-[180px]">
            <Label htmlFor="secondary-attribute" className="mb-1">
              Secondary Attribute
            </Label>
            <Select value={secondaryAttr} onValueChange={setSecondaryAttr}>
              <SelectTrigger id="secondary-attribute">
                <SelectValue placeholder="Add second attribute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {attributeOptions
                  .filter((opt) => opt.value !== primaryAttr)
                  .map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* --- Dynamic Output Area --- */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {groupByPrimary && secondaryAttr
                  ? `Composition by ${attributeLabel(primaryAttr)} (grouped)`
                  : secondaryAttr
                  ? `Composition: ${attributeLabel(
                      primaryAttr
                    )} & ${attributeLabel(secondaryAttr)}`
                  : `Composition: ${attributeLabel(primaryAttr)}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chart rendering logic */}
              {renderCompositionChart({
                groupByPrimary,
                primaryAttr,
                secondaryAttr,
              })}
            </CardContent>
          </Card>
          {/* Legend */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {legendItems({
              groupByPrimary,
              primaryAttr,
              secondaryAttr,
            }).map((item) => (
              <div key={item.value} className="flex items-center gap-1 text-xs">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${item.color}`}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="bg-blue-50/50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Active Filters:
              </h4>
              <div className="flex flex-wrap gap-2">
                {/* Include Category Filters */}
                {filters.categories.map((category) => (
                  <span
                    key={`category-${category}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100/80 text-blue-800 text-sm font-medium border border-blue-200/50"
                  >
                    <span>Include: {category}</span>
                    <button
                      onClick={() => {
                        const newCategories = filters.categories.filter(
                          (c) => c !== category
                        );
                        onFiltersChange &&
                          onFiltersChange({
                            ...filters,
                            categories: newCategories,
                          });
                      }}
                      className="hover:bg-blue-200/80 p-1"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Exclude Category Filters */}
                {filters.excludeCategories.map((category) => (
                  <span
                    key={`exclude-category-${category}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100/80 text-red-800 text-sm font-medium border border-red-200/50"
                  >
                    <span>Exclude: {category}</span>
                    <button
                      onClick={() => {
                        const newCategories = filters.excludeCategories.filter(
                          (c) => c !== category
                        );
                        onFiltersChange &&
                          onFiltersChange({
                            ...filters,
                            excludeCategories: newCategories,
                          });
                      }}
                      className="hover:bg-red-200/80 p-1"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Tag Filters */}
                {filters.tags.map((tagId) => {
                  const tag = productTagsData.find(
                    (t: ProductTag) => t.id === tagId
                  );
                  return tag ? (
                    <div
                      key={tagId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      <TagIcon className="w-4 h-4" />
                      <span>{tag.name}</span>
                      <button
                        onClick={() => {
                          const newTags = filters.tags.filter(
                            (t) => t !== tagId
                          );
                          onFiltersChange &&
                            onFiltersChange({ ...filters, tags: newTags });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : null;
                })}

                {/* Status Filters */}
                {filters.status.map((status) => (
                  <span
                    key={`status-${status}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100/80 text-purple-800 text-sm font-medium border border-purple-200/50"
                  >
                    <span>Status: {status}</span>
                    <button
                      onClick={() => {
                        const newStatuses = filters.status.filter(
                          (s) => s !== status
                        );
                        onFiltersChange &&
                          onFiltersChange({ ...filters, status: newStatuses });
                      }}
                      className="hover:bg-purple-200/80 p-1"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Price Range Filter */}
                {(filters.priceRange.min > 0 ||
                  filters.priceRange.max < 1000) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100/80 text-green-800 text-sm font-medium border border-green-200/50">
                    <span>
                      Price: ${filters.priceRange.min} - $
                      {filters.priceRange.max}
                    </span>
                    <button
                      onClick={() => {
                        onFiltersChange &&
                          onFiltersChange({
                            ...filters,
                            priceRange: { min: 0, max: 1000 },
                          });
                      }}
                      className="hover:bg-green-200/80 p-1"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Margin Range Filter */}
                {(filters.marginRange.min > 0 ||
                  filters.marginRange.max < 100) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100/80 text-amber-800 text-sm font-medium border border-amber-200/50">
                    <span>
                      Margin: {filters.marginRange.min}% -{" "}
                      {filters.marginRange.max}%
                    </span>
                    <button
                      onClick={() => {
                        onFiltersChange &&
                          onFiltersChange({
                            ...filters,
                            marginRange: { min: 0, max: 100 },
                          });
                      }}
                      className="hover:bg-amber-200/80 p-1"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assortment Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-semibold text-slate-800">
              Assortment Overview
            </h3>
            <span className="text-sm text-slate-600">
              {totalFilteredCount} of {totalProductCount} products
              {hasActiveFilters && (
                <span className="ml-1 text-blue-600 font-medium">
                  ({Math.round((totalFilteredCount / totalProductCount) * 100)}%
                  shown)
                </span>
              )}
            </span>
          </div>
          <button
            onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <span>{isOverviewExpanded ? "Collapse" : "Expand"}</span>
            <ChevronLeftIcon
              className={`w-4 h-4 transition-transform ${
                isOverviewExpanded ? "rotate-90" : "-rotate-90"
              }`}
            />
          </button>
        </div>

        {isOverviewExpanded ? (
          /* Expanded View - Detailed Project Distribution */
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Project Distribution
            </h4>
            <div className="space-y-3">
              {linePlan.categories.map((category, index) => {
                const projectProducts =
                  productsByProject[category.id]?.products || [];
                const totalProjectProducts = allProducts.filter(
                  (p) => p.projectId === category.id
                ).length;
                const matchPercentage =
                  totalProjectProducts > 0
                    ? (projectProducts.length / totalProjectProducts) * 100
                    : 0;
                const maxProducts = Math.max(
                  ...linePlan.categories.map(
                    (cat) =>
                      allProducts.filter((p) => p.projectId === cat.id).length
                  ),
                  1
                );
                const barWidth = (totalProjectProducts / maxProducts) * 100;
                const fillWidth =
                  totalProjectProducts > 0
                    ? (projectProducts.length / totalProjectProducts) * 100
                    : 0;
                const projectColor = getProjectColor(index);

                return (
                  <div
                    key={category.id}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-24 text-sm font-medium text-slate-700 text-right">
                      {category.name}
                    </div>
                    <div className="flex-1 relative">
                      <div
                        className="h-6 bg-slate-100 rounded-lg border border-slate-200 relative overflow-hidden"
                        style={{ width: `${Math.max(barWidth, 20)}%` }}
                      >
                        <div
                          className={`h-full rounded-lg transition-all duration-300 ${projectColor.bg}`}
                          style={{ width: `${fillWidth}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          <span className="text-xs font-medium text-slate-700">
                            {projectProducts.length}
                          </span>
                          {totalProjectProducts > projectProducts.length && (
                            <span className="text-xs text-slate-500">
                              of {totalProjectProducts}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-medium text-slate-600 text-right">
                      {Math.round(matchPercentage)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Compact View - Summary Stats and Bar */
          <div>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-900">
                  {linePlan.categories.length}
                </div>
                <div className="text-xs text-slate-500">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-900">
                  {totalProductCount}
                </div>
                <div className="text-xs text-slate-500">Total Products</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-900">
                  {linePlan.categories.length > 0
                    ? Math.round(
                        (linePlan.categories.reduce((sum, cat) => {
                          const projectProducts =
                            productsByProject[cat.id]?.products || [];
                          const totalProjectProducts = allProducts.filter(
                            (p) => p.projectId === cat.id
                          ).length;
                          return (
                            sum +
                            (totalProjectProducts > 0
                              ? projectProducts.length / totalProjectProducts
                              : 0)
                          );
                        }, 0) /
                          linePlan.categories.length) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div className="text-xs text-slate-500">Avg Match</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-900">
                  {totalFilteredCount}
                </div>
                <div className="text-xs text-slate-500">Filtered</div>
              </div>
            </div>

            {/* Project Distribution Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>Project Distribution</span>
                <span>Product Count</span>
              </div>

              {/* Single proportional bar showing all projects */}
              <div className="h-4 bg-slate-100 rounded border border-slate-200 relative overflow-hidden">
                {(() => {
                  const totalProducts = allProducts.length;
                  let currentPosition = 0;

                  return linePlan.categories.map((category, index) => {
                    const projectProducts =
                      productsByProject[category.id]?.products || [];
                    const totalProjectProducts = allProducts.filter(
                      (p) => p.projectId === category.id
                    ).length;
                    const matchPercentage =
                      totalProjectProducts > 0
                        ? (projectProducts.length / totalProjectProducts) * 100
                        : 0;
                    const projectWidthPercentage =
                      (totalProjectProducts / totalProducts) * 100;
                    const leftPosition = currentPosition;
                    currentPosition += projectWidthPercentage;
                    const projectColor = getProjectColor(index);

                    return (
                      <div
                        key={category.id}
                        className="absolute h-full cursor-pointer"
                        style={{
                          left: `${leftPosition}%`,
                          width: `${projectWidthPercentage}%`,
                        }}
                        title={`${category.name}: ${
                          projectProducts.length
                        }/${totalProjectProducts} products (${Math.round(
                          matchPercentage
                        )}%)`}
                      >
                        <div
                          className={`h-full transition-all duration-300 hover:brightness-110 ${projectColor.bg}`}
                          style={{ width: `${Math.max(matchPercentage, 5)}%` }}
                        />
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Project labels below the bar */}
              <div className="relative h-5">
                {(() => {
                  const totalProducts = allProducts.length;
                  let currentPosition = 0;

                  return linePlan.categories.map((category, index) => {
                    const totalProjectProducts = allProducts.filter(
                      (p) => p.projectId === category.id
                    ).length;
                    const projectWidthPercentage =
                      (totalProjectProducts / totalProducts) * 100;
                    const leftPosition = currentPosition;
                    currentPosition += projectWidthPercentage;
                    const projectColor = getProjectColor(index);

                    // Don't show any text if segment is too narrow
                    if (projectWidthPercentage < 8) {
                      return (
                        <div
                          key={category.id}
                          className="absolute text-xs text-slate-500 text-center cursor-pointer hover:text-slate-700"
                          style={{
                            left: `${leftPosition}%`,
                            width: `${projectWidthPercentage}%`,
                          }}
                          title={`${category.name} (${totalProjectProducts} products)`}
                        />
                      );
                    }

                    // Show abbreviated text for narrow segments
                    let displayText = category.name;
                    if (projectWidthPercentage < 12) {
                      displayText = category.name.charAt(0);
                    } else if (projectWidthPercentage < 20) {
                      displayText =
                        category.name.substring(0, 4) +
                        (category.name.length > 4 ? "..." : "");
                    }

                    return (
                      <div
                        key={category.id}
                        className={`absolute text-xs text-center cursor-pointer hover:text-slate-700 ${projectColor.text}`}
                        style={{
                          left: `${leftPosition}%`,
                          width: `${projectWidthPercentage}%`,
                        }}
                        title={`${category.name} (${totalProjectProducts} products)`}
                      >
                        <span className="truncate block px-1 font-medium">
                          {displayText}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filters"
        size="lg"
      >
        <div className="space-y-6">
          {/* Include Projects Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Include Projects
            </label>
            <div className="grid grid-cols-2 gap-2">
              {linePlan.categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={tempFilters.categories.includes(category.name)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...tempFilters.categories, category.name]
                        : tempFilters.categories.filter(
                            (c) => c !== category.name
                          );
                      handleTempFilterChange({ categories: newCategories });
                    }}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Exclude Projects Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Exclude Projects
            </label>
            <div className="grid grid-cols-2 gap-2">
              {linePlan.categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={tempFilters.excludeCategories.includes(
                      category.name
                    )}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...tempFilters.excludeCategories, category.name]
                        : tempFilters.excludeCategories.filter(
                            (c) => c !== category.name
                          );
                      handleTempFilterChange({
                        excludeCategories: newCategories,
                      });
                    }}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-slate-700">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Include Tags by Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Include Tags
            </label>
            <div className="space-y-4 max-h-48 overflow-y-auto">
              {Object.entries(tagsByCategory).map(([categoryName, tags]) => (
                <div key={categoryName}>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {categoryName}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={tempFilters.tags.includes(tag.id)}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...tempFilters.tags, tag.id]
                              : tempFilters.tags.filter((t) => t !== tag.id);
                            handleTempFilterChange({ tags: newTags });
                          }}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span
                          className={`text-xs px-2 py-1 rounded-md border ${getTagColorClasses(
                            tag.color
                          )}`}
                        >
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exclude Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Exclude Tags
            </label>
            <div className="space-y-4 max-h-32 overflow-y-auto">
              {Object.entries(tagsByCategory).map(([categoryName, tags]) => (
                <div key={categoryName}>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {categoryName}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {tags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={tempFilters.excludeTags.includes(tag.id)}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...tempFilters.excludeTags, tag.id]
                              : tempFilters.excludeTags.filter(
                                  (t) => t !== tag.id
                                );
                            handleTempFilterChange({ excludeTags: newTags });
                          }}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-xs px-2 py-1 rounded-md border bg-slate-50 text-slate-700 border-slate-200">
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Price Range ($)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={tempFilters.priceRange.min}
                  onChange={(e) =>
                    handleTempFilterChange({
                      priceRange: {
                        ...tempFilters.priceRange,
                        min: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={tempFilters.priceRange.max}
                  onChange={(e) =>
                    handleTempFilterChange({
                      priceRange: {
                        ...tempFilters.priceRange,
                        max: parseInt(e.target.value) || 1000,
                      },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Margin Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Margin Range (%)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  placeholder="Min"
                  value={tempFilters.marginRange.min}
                  onChange={(e) =>
                    handleTempFilterChange({
                      marginRange: {
                        ...tempFilters.marginRange,
                        min: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max"
                  value={tempFilters.marginRange.max}
                  onChange={(e) =>
                    handleTempFilterChange({
                      marginRange: {
                        ...tempFilters.marginRange,
                        max: parseInt(e.target.value) || 100,
                      },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableStatuses.map((status) => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={tempFilters.status.includes(status)}
                    onChange={(e) => {
                      const newStatuses = e.target.checked
                        ? [...tempFilters.status, status]
                        : tempFilters.status.filter((s) => s !== status);
                      handleTempFilterChange({ status: newStatuses });
                    }}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-slate-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
            >
              Clear All
            </button>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-white bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Products Grid Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">Products</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">
              {totalFilteredCount} of {totalProductCount} products
            </span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(productsByProject).map(
            (
              [projectId, project]: [
                string,
                { projectName: string; products: typeof filteredProducts }
              ],
              index: number
            ) => (
              <div key={projectId} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      getProjectColor(index).bg
                    }`}
                  />
                  <h4 className="text-sm font-medium text-slate-700">
                    {project.projectName}
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {project.products.map(
                    (product: (typeof filteredProducts)[0]) => (
                      <div
                        key={product.id}
                        onClick={() => onProductClick(projectId, product.id)}
                        className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <CollectionIcon className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5
                              className="text-sm font-medium text-slate-800 truncate"
                              title={product.name}
                            >
                              {product.name}
                            </h5>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {product.color || "N/A"}
                            </p>
                            <div className="mt-2">
                              <TagListDisplay
                                tagIds={product.tags}
                                size="xs"
                                itemType="product"
                                maxVisibleTags={2}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                              <div className="text-xs">
                                <div className="text-sm font-medium text-slate-700">
                                  {(product.margin * 100).toFixed(1)}% MRG
                                </div>
                                <div className="text-slate-500">
                                  ${product.sellingPrice.toFixed(0)} RSP
                                </div>
                              </div>
                              <StatusBadge
                                status={
                                  product.plmStatus || PLMStatusStage.BRIEFING
                                }
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CompositionView;
