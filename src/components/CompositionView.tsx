import React, { useState, useMemo } from "react";
import { LinePlan, ProductTag } from "../types";
import { productTagLibrary } from "../data/index";
import {
  ChevronLeftIcon,
  CollectionIcon,
  FunnelIcon,
  XMarkIcon,
} from "./icons";
import Modal from "./Modal";
import TagChip from "./TagChip";

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
    return linePlan.categories.flatMap((category) =>
      category.plannedStyles.map((style) => ({
        ...style,
        projectName: category.name,
        projectId: category.id,
      }))
    );
  }, [linePlan.categories]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
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
    return productTagLibrary.reduce((acc, tag) => {
      if (!acc[tag.category]) {
        acc[tag.category] = [];
      }
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, ProductTag[]>);
  }, []);

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
                  const tag = productTagLibrary.find((t) => t.id === tagId);
                  return tag ? (
                    <div
                      key={`tag-${tagId}`}
                      className="relative inline-flex items-center"
                    >
                      <TagChip tag={tag} size="sm" />
                      <button
                        onClick={() => {
                          const newTags = filters.tags.filter(
                            (t) => t !== tagId
                          );
                          onFiltersChange &&
                            onFiltersChange({ ...filters, tags: newTags });
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                        title="Remove filter"
                      >
                        <XMarkIcon className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : null;
                })}

                {/* Exclude Tag Filters */}
                {filters.excludeTags.map((tagId) => {
                  const tag = productTagLibrary.find((t) => t.id === tagId);
                  return tag ? (
                    <span
                      key={`exclude-tag-${tagId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100/80 text-red-800 text-sm font-medium border border-red-200/50 rounded-md"
                    >
                      <span>Exclude: {tag.name}</span>
                      <button
                        onClick={() => {
                          const newTags = filters.excludeTags.filter(
                            (t) => t !== tagId
                          );
                          onFiltersChange &&
                            onFiltersChange({
                              ...filters,
                              excludeTags: newTags,
                            });
                        }}
                        className="hover:bg-red-200/80 p-1 rounded"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
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

      {/* Projects Card Container */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Projects</h3>
        <div className="space-y-6">
          {linePlan.categories.map((category, index) => {
            const projectProducts =
              productsByProject[category.id]?.products || [];
            const totalProjectProducts = allProducts.filter(
              (p) => p.projectId === category.id
            ).length;
            const projectColor = getProjectColor(index);

            return (
              <div
                key={category.id}
                className={`border-l-[3px] ${projectColor.border} pl-4`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4
                    className={`text-base font-semibold ${projectColor.text}`}
                  >
                    {category.name}
                  </h4>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-900">
                      {projectProducts.length}
                    </span>{" "}
                    of {totalProjectProducts} products
                    {projectProducts.length !== totalProjectProducts && (
                      <span
                        className={`ml-2 px-2 py-0.5 ${projectColor.light} rounded text-xs font-medium ${projectColor.text}`}
                      >
                        {Math.round(
                          (projectProducts.length / totalProjectProducts) * 100
                        )}
                        % match
                      </span>
                    )}
                  </div>
                </div>

                {projectProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div
                      className="flex space-x-3 pb-2"
                      style={{ minWidth: "max-content" }}
                    >
                      {projectProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex-shrink-0 w-48 p-3 border border-slate-200 rounded hover:shadow-sm transition-shadow cursor-pointer bg-slate-50/30 hover:bg-white"
                          onClick={() =>
                            onProductClick(product.projectId, product.id)
                          }
                        >
                          <div className="flex items-start space-x-2">
                            <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <CollectionIcon className="w-4 h-4 text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-slate-900 text-xs leading-tight mb-1 line-clamp-2">
                                {product.name}
                              </h5>
                              <div className="flex items-center space-x-2 text-xs text-slate-600 mb-1">
                                <span className="font-medium">
                                  ${product.sellingPrice}
                                </span>
                                <span>
                                  {(product.margin * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="mb-1">
                                <span className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">
                                  {product.status}
                                </span>
                              </div>
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-0.5">
                                  {product.tags.slice(0, 2).map((tagId) => {
                                    const tag = productTagLibrary.find(
                                      (t) => t.id === tagId
                                    );
                                    return tag ? (
                                      <TagChip
                                        key={tagId}
                                        tag={tag}
                                        size="xs"
                                      />
                                    ) : null;
                                  })}
                                  {product.tags.length > 2 && (
                                    <span className="text-xs text-slate-400">
                                      +{product.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <CollectionIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm">
                      No products match the current filters in this project
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(productsByProject).length === 0 && (
            <div className="text-center py-16">
              <CollectionIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-700 mb-2">
                No products found
              </h4>
              <p className="text-sm text-slate-500">
                Try adjusting your filters to see more products.
              </p>
            </div>
          )}
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
    </div>
  );
};

export default CompositionView;
