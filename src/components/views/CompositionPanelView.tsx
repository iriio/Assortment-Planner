import React, { useState, useMemo } from "react";
import { LinePlan, ProductTag } from "@/types";
import { productTagsData } from "@/data";

import Modal from "../modals/Modal";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FilterState } from "./CompositionView";

interface CompositionPanelViewProps {
  linePlan: LinePlan;
  onProductClick: (projectId: string, productId: string) => void;
  filters: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
}

const CompositionPanelView: React.FC<CompositionPanelViewProps> = ({
  linePlan,
  filters,
  onFiltersChange,
}) => {
  // Reuse the same color palette and helper functions from CompositionView

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [attribute1, setAttribute1] = useState(
    linePlan.categories.length === 1 ? "sellingPrice" : "projectName"
  );
  const [attribute2, setAttribute2] = useState("none");
  const [groupByAttribute1] = useState(true);

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

  const totalFilteredCount = filteredProducts.length;
  const totalProductCount = allProducts.length;

  // Determine context: if linePlan has multiple categories, we're at program level
  const isProjectLevel = linePlan.categories.length === 1;

  // Context-aware attribute options
  const attributeOptions = isProjectLevel
    ? [
        // Project level - product attributes
        { value: "sellingPrice", label: "Selling Price" },
        { value: "margin", label: "Margin" },
        { value: "plmStatus", label: "PLM Status" },
        { value: "color", label: "Color" },
        { value: "fitType", label: "Fit Type" },
        { value: "occasion", label: "Occasion" },
        { value: "projectedSellThrough", label: "Projected Sell Through" },
        { value: "projectedSellIn", label: "Projected Sell In" },
      ]
    : [
        // Program level - project attributes
        { value: "projectName", label: "Project Name" },
        { value: "targetVolume", label: "Target Volume" },
        { value: "plmStatus", label: "Project Status" },
        { value: "plannedStyles", label: "Style Count" },
        { value: "targetMetrics", label: "Target Metrics" },
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

  // Get real attribute values based on context
  const getRealAttributeValues = (attribute: string): string[] => {
    const values = new Set<string>();

    if (isProjectLevel) {
      // Project level - analyze products
      filteredProducts.forEach((product) => {
        switch (attribute) {
          case "sellingPrice":
            const price = product.sellingPrice;
            if (price < 50) values.add("Low (<$50)");
            else if (price < 150) values.add("Mid ($50-$150)");
            else values.add("High (>$150)");
            break;
          case "margin":
            const margin = product.margin * 100;
            if (margin < 40) values.add("Low (<40%)");
            else if (margin < 60) values.add("Medium (40-60%)");
            else values.add("High (>60%)");
            break;
          case "plmStatus":
            values.add(product.plmStatus);
            break;
          case "color":
            values.add(product.color || "N/A");
            break;
          case "fitType":
            values.add(product.fitType || "N/A");
            break;
          case "occasion":
            values.add(product.occasion || "N/A");
            break;
          case "projectedSellThrough":
            const sellThrough = product.projectedSellThrough || 0;
            if (sellThrough < 0.6) values.add("Low (<60%)");
            else if (sellThrough < 0.8) values.add("Medium (60-80%)");
            else values.add("High (>80%)");
            break;
          case "projectedSellIn":
            const sellIn = product.projectedSellIn || 0;
            if (sellIn < 1000) values.add("Low (<1k)");
            else if (sellIn < 5000) values.add("Medium (1k-5k)");
            else values.add("High (>5k)");
            break;
        }
      });
    } else {
      // Program level - analyze projects/categories
      Object.values(productsByProject).forEach(({ projectName, products }) => {
        switch (attribute) {
          case "projectName":
            values.add(projectName);
            break;
          case "targetVolume":
            const volume = products.length * 1000; // Approximate volume based on product count
            if (volume < 1000) values.add("Low (<1k)");
            else if (volume < 5000) values.add("Medium (1k-5k)");
            else values.add("High (>5k)");
            break;
          case "plmStatus":
            const status = products[0]?.plmStatus || "Draft";
            values.add(status);
            break;
          case "plannedStyles":
            const styleCount = products.length;
            if (styleCount < 5) values.add("Few (<5)");
            else if (styleCount < 15) values.add("Medium (5-15)");
            else values.add("Many (>15)");
            break;
          case "targetMetrics":
            const avgMargin =
              products.reduce((sum, p) => sum + p.margin, 0) / products.length;
            if (avgMargin < 0.4) values.add("Low Margin");
            else if (avgMargin < 0.6) values.add("Medium Margin");
            else values.add("High Margin");
            break;
        }
      });
    }
    return Array.from(values);
  };

  // Get item value for attribute (product or project depending on context)
  const getItemValue = (item: any, attribute: string): string => {
    if (isProjectLevel) {
      // Product attributes
      const product = item as (typeof filteredProducts)[0];
      switch (attribute) {
        case "sellingPrice":
          const price = product.sellingPrice;
          if (price < 50) return "Low (<$50)";
          else if (price < 150) return "Mid ($50-$150)";
          else return "High (>$150)";
        case "margin":
          const margin = product.margin * 100;
          if (margin < 40) return "Low (<40%)";
          else if (margin < 60) return "Medium (40-60%)";
          else return "High (>60%)";
        case "plmStatus":
          return product.plmStatus;
        case "color":
          return product.color || "N/A";
        case "fitType":
          return product.fitType || "N/A";
        case "occasion":
          return product.occasion || "N/A";
        case "projectedSellThrough":
          const sellThrough = product.projectedSellThrough || 0;
          if (sellThrough < 0.6) return "Low (<60%)";
          else if (sellThrough < 0.8) return "Medium (60-80%)";
          else return "High (>80%)";
        case "projectedSellIn":
          const sellIn = product.projectedSellIn || 0;
          if (sellIn < 1000) return "Low (<1k)";
          else if (sellIn < 5000) return "Medium (1k-5k)";
          else return "High (>5k)";
        default:
          return "";
      }
    } else {
      // Project attributes
      const { projectName, products } = item as {
        projectName: string;
        products: typeof filteredProducts;
      };
      switch (attribute) {
        case "projectName":
          return projectName;
        case "targetVolume":
          const volume = products.length * 1000;
          if (volume < 1000) return "Low (<1k)";
          else if (volume < 5000) return "Medium (1k-5k)";
          else return "High (>5k)";
        case "plmStatus":
          return products[0]?.plmStatus || "Draft";
        case "plannedStyles":
          const styleCount = products.length;
          if (styleCount < 5) return "Few (<5)";
          else if (styleCount < 15) return "Medium (5-15)";
          else return "Many (>15)";
        case "targetMetrics":
          const avgMargin =
            products.reduce((sum, p) => sum + p.margin, 0) / products.length;
          if (avgMargin < 0.4) return "Low Margin";
          else if (avgMargin < 0.6) return "Medium Margin";
          else return "High Margin";
        default:
          return "";
      }
    }
  };

  // Generate real composition data based on context
  const getRealData = (primary: string, secondary?: string) => {
    const dataSource = isProjectLevel
      ? filteredProducts
      : Object.values(productsByProject);
    const valueCounts = new Map<string, number>();

    // Count products per attribute value
    dataSource.forEach((item) => {
      const value = getItemValue(item, primary);
      if (isProjectLevel) {
        // For project level, just count the product
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      } else {
        // For program level, count products in each project
        const { products } = item as {
          projectName: string;
          products: typeof filteredProducts;
        };
        const productCount = products.length;
        valueCounts.set(value, (valueCounts.get(value) || 0) + productCount);
      }
    });

    // Calculate total count
    const totalCount = Array.from(valueCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    if (!secondary) {
      // Single attribute: calculate real proportions based on product count
      return Array.from(valueCounts.entries()).map(([value, count], i) => ({
        value,
        percent: totalCount > 0 ? count / totalCount : 0,
        color: colorPalette[i % colorPalette.length],
      }));
    }

    // Two attributes: nested proportions
    const primaryValues = getRealAttributeValues(primary);
    const secondaryValues = getRealAttributeValues(secondary);
    return primaryValues.map((primaryValue: string, i: number) => {
      const primaryItems = dataSource.filter(
        (item) => getItemValue(item, primary) === primaryValue
      );
      const primaryCount = isProjectLevel
        ? primaryItems.length
        : primaryItems.reduce(
            (sum, item) =>
              sum +
              (
                item as {
                  projectName: string;
                  products: typeof filteredProducts;
                }
              ).products.length,
            0
          );

      return {
        value: primaryValue,
        percent: totalCount > 0 ? primaryCount / totalCount : 0,
        color: colorPalette[i % colorPalette.length],
        breakdown: secondaryValues.map((secondaryValue: string, j: number) => {
          const count = primaryItems.filter(
            (item) => getItemValue(item, secondary) === secondaryValue
          ).length;
          return {
            value: secondaryValue,
            percent: primaryCount > 0 ? count / primaryCount : 0,
            color: colorPalette[j % colorPalette.length],
          };
        }),
      };
    });
  };

  // Chart rendering logic
  function renderCompositionChart() {
    if (!attribute1) return null;

    if (attribute2 === "none") {
      // 1. Single flat bar chart for Attribute 1
      const data = getRealData(attribute1);
      return (
        <div className="flex w-full h-4 rounded overflow-hidden">
          {data.map(
            (seg: { value: string; percent: number; color: string }) => (
              <div
                key={seg.value}
                className={seg.color}
                style={{ width: `${seg.percent * 100}%` }}
                title={`${seg.value}: ${(seg.percent * 100).toFixed(1)}%`}
              />
            )
          )}
        </div>
      );
    }

    if (!groupByAttribute1) {
      // 2a. Two separate graphs — one for each attribute with individual legends
      const data1 = getRealData(attribute1);
      const data2 = getRealData(attribute2);

      return (
        <div className="flex flex-col gap-6">
          {/* First Attribute Graph */}
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              {attributeLabel(attribute1)}
            </div>
            <div className="flex w-full h-4 rounded overflow-hidden mb-2">
              {data1.map(
                (seg: { value: string; percent: number; color: string }) => (
                  <div
                    key={seg.value}
                    className={seg.color}
                    style={{ width: `${seg.percent * 100}%` }}
                    title={`${seg.value}: ${(seg.percent * 100).toFixed(1)}%`}
                  />
                )
              )}
            </div>
            {/* Legend for first attribute */}
            <div className="flex gap-2 flex-wrap">
              {data1.map((item) => (
                <div
                  key={item.value}
                  className="flex items-center gap-1 text-xs"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${item.color}`}
                  />
                  <span>
                    {item.value}: {(item.percent * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Second Attribute Graph */}
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">
              {attributeLabel(attribute2)}
            </div>
            <div className="flex w-full h-4 rounded overflow-hidden mb-2">
              {data2.map(
                (seg: { value: string; percent: number; color: string }) => (
                  <div
                    key={seg.value}
                    className={seg.color}
                    style={{ width: `${seg.percent * 100}%` }}
                    title={`${seg.value}: ${(seg.percent * 100).toFixed(1)}%`}
                  />
                )
              )}
            </div>
            {/* Legend for second attribute */}
            <div className="flex gap-2 flex-wrap">
              {data2.map((item) => (
                <div
                  key={item.value}
                  className="flex items-center gap-1 text-xs"
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${item.color}`}
                  />
                  <span>
                    {item.value}: {(item.percent * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // 2b. Pivot view: Rows = top 2 values of Attribute 1 + "Other"
    const data = getRealData(attribute1, attribute2) as {
      value: string;
      percent: number;
      color: string;
      breakdown: { value: string; percent: number; color: string }[];
    }[];

    // Sort by percent to get top 2
    const sortedData = [...data].sort((a, b) => b.percent - a.percent);
    const top2 = sortedData.slice(0, 2);
    const others = sortedData.slice(2);

    return (
      <div className="flex flex-col gap-2">
        {top2.map((group) => (
          <div key={group.value} className="flex items-center gap-2">
            <span className="w-20 text-xs text-slate-700 truncate font-medium">
              {group.value}
            </span>
            <div className="flex-1 flex h-4 rounded overflow-hidden">
              {group.breakdown.map(
                (seg: { value: string; percent: number; color: string }) => (
                  <div
                    key={seg.value}
                    className={seg.color}
                    style={{ width: `${seg.percent * 100}%` }}
                    title={`${group.value} - ${seg.value}: ${(
                      seg.percent * 100
                    ).toFixed(1)}%`}
                  />
                )
              )}
            </div>
          </div>
        ))}
        {others.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-20 text-xs text-slate-700 truncate font-medium">
              Other
            </span>
            <div className="flex-1 flex h-4 rounded overflow-hidden">
              {getRealAttributeValues(attribute2).map(
                (sv: string, j: number) => {
                  // Calculate average proportion for "Other" category
                  const totalOtherPercent = others.reduce(
                    (sum, otherGroup) => sum + otherGroup.percent,
                    0
                  );
                  const avgPercent =
                    others.reduce((sum, otherGroup) => {
                      const segmentInOther = otherGroup.breakdown.find(
                        (b) => b.value === sv
                      );
                      return (
                        sum +
                        (segmentInOther
                          ? segmentInOther.percent * otherGroup.percent
                          : 0)
                      );
                    }, 0) / Math.max(totalOtherPercent, 0.01);

                  return (
                    <div
                      key={sv}
                      className={colorPalette[j % colorPalette.length]}
                      style={{
                        width: `${Math.max(avgPercent * 100, 0)}%`,
                      }}
                      title={`Other - ${sv}: ${Math.max(
                        avgPercent * 100,
                        0
                      ).toFixed(1)}%`}
                    />
                  );
                }
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Legend rendering logic
  function renderLegend() {
    if (attribute2 === "none") {
      // Single attribute legend
      return getRealAttributeValues(attribute1).map((v: string, i: number) => ({
        value: `${attribute1}-${v}`,
        label: `${attributeLabel(attribute1)}: ${v}`,
        color: colorPalette[i % colorPalette.length],
      }));
    }

    if (!groupByAttribute1) {
      // Flat view - no central legend needed since each graph has its own
      return [];
    }

    // Grouped: legend for attribute 2
    return getRealAttributeValues(attribute2).map((v: string, i: number) => ({
      value: v,
      label: v,
      color: colorPalette[i % colorPalette.length],
    }));
  }

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

  // Helper for tag color classes
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

  // Get unique statuses from all products
  const availableStatuses = useMemo(() => {
    const statuses = new Set(allProducts.map((p) => p.status));
    return Array.from(statuses);
  }, [allProducts]);

  return (
    <div className="space-y-4 h-full overflow-y-auto p-4">
      {/* Filter Controls */}
      <div className="flex items-center space-x-3 justify-between">
        <h3 className="text-base font-semibold text-slate-800">Composition</h3>
        <span className="text-sm text-slate-600">
          {isProjectLevel
            ? `${totalFilteredCount} of ${totalProductCount} products`
            : `${linePlan.categories.length} projects`}
        </span>
      </div>

      {/* Composition Controls */}
      <div>
        <div className="flex flex-col space-y-3">
          {/* Attribute 1 Dropdown */}
          <div className="flex flex-col">
            <Label htmlFor="attribute-1" className="mb-1 text-xs">
              Attribute 1
            </Label>
            <Select value={attribute1} onValueChange={setAttribute1}>
              <SelectTrigger id="attribute-1">
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
          {/* Attribute 2 Dropdown */}
          <div className="flex flex-col">
            <Label htmlFor="attribute-2" className="mb-1 text-xs">
              Attribute 2 (optional)
            </Label>
            <Select value={attribute2} onValueChange={setAttribute2}>
              <SelectTrigger id="attribute-2">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {attributeOptions
                  .filter((opt) => opt.value !== attribute1)
                  .map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-4">
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">
                {attribute2 === "none"
                  ? `Composition by ${attributeLabel(
                      attribute1
                    )} (by style count)`
                  : groupByAttribute1
                  ? `Grouped by ${attributeLabel(
                      attribute1
                    )}, broken down by ${attributeLabel(attribute2)}`
                  : `Composition by ${attributeLabel(
                      attribute1
                    )} and ${attributeLabel(attribute2)} (flat view)`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {renderCompositionChart()}
              <div className="flex gap-2 mt-2 flex-wrap">
                {renderLegend().map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center gap-1 text-xs"
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${item.color}`}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Legend */}
        </div>
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
              {Object.entries(tagsByCategory).map(
                ([categoryName, tags]: [string, ProductTag[]]) => (
                  <div key={categoryName}>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {categoryName}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {tags.map((tag: ProductTag) => (
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
                )
              )}
            </div>
          </div>

          {/* Exclude Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Exclude Tags
            </label>
            <div className="space-y-4 max-h-32 overflow-y-auto">
              {Object.entries(tagsByCategory).map(
                ([categoryName, tags]: [string, ProductTag[]]) => (
                  <div key={categoryName}>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {categoryName}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {tags.map((tag: ProductTag) => (
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
                )
              )}
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
              {availableStatuses.map((status: string) => (
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
    </div>
  );
};

export default CompositionPanelView;
