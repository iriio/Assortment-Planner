/**
 * CATEGORY DETAIL PAGE - Detailed view for managing individual product categories
 *
 * LAYOUT STRUCTURE:
 * ┌──────────────────────────────────────────────────────────────────┐
 * │                        Header Bar                                │
 * │  - Back button to overview                                       │
 * │  - Category name and status                                      │
 * │  - Metric view toggle                                           │
 * │  - Add style button                                             │
 * └──────────────────────────────────────────────────────────────────┤
 * │                                                                  │
 * │                    STYLES TABLE/GRID                             │
 * │  ┌─────────┬──────────┬─────────┬─────────┬─────────────────┐   │
 * │  │ Image   │   Name   │  Price  │ Margin  │    Actions      │   │
 * │  ├─────────┼──────────┼─────────┼─────────┼─────────────────┤   │
 * │  │   []    │ Style 1  │  $99    │  65%    │ [Edit] [Comp]   │   │
 * │  │   []    │ Style 2  │  $149   │  58%    │ [Edit] [Comp]   │   │
 * │  │   []    │ Style 3  │  $79    │  72%    │ [Edit] [Comp]   │   │
 * │  └─────────┴──────────┴─────────┴─────────┴─────────────────┘   │
 * │                                                                  │
 * │                    [+ Add New Style]                             │
 * │                                                                  │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * FUNCTIONALITY:
 * - Individual style management (CRUD operations)
 * - Component/material assignment for costing
 * - Financial calculations (cost, price, margin)
 * - Status tracking and workflow management
 * - Visual metric displays (bars, chips, text)
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  LinePlanCategory,
  PlannedStyle,
  PLMStatusStage,
  StyleMetricViewOption,
  LinePlan,
  Product,
} from "@/types";

import {
  PlusCircleIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
} from "../components/common/icons";
import StatusBadge from "../components/common/StatusBadge";
import { calculateCategoryStatus } from "../utils/statusSystem";
import { CategoryDetailView } from "../components/views/CategoryDetailView";

// Props interface for the category detail page
interface CategoryDetailPageProps {
  linePlans: LinePlan[];
  currentLinePlan: LinePlan | null;
  setLinePlans: React.Dispatch<React.SetStateAction<LinePlan[]>>;
  onUpdateStyle: (categoryId: string, updatedStyle: PlannedStyle) => void;
  onAddStyle: (categoryId: string, newStyle: PlannedStyle) => void;
  onCategoryStatusChange: (
    category: LinePlanCategory,
    status: PLMStatusStage
  ) => void;
  styleMetricView: StyleMetricViewOption;
}

// Style metric display options for different visualization modes
const STYLE_METRIC_VIEW_OPTIONS: {
  value: StyleMetricViewOption;
  label: string;
}[] = [
  { value: "current", label: "Standard Text" },
  { value: "dataBar", label: "In-Cell Data Bar" },
  { value: "chip", label: "Colored Chip" },
];

/**
 * MAIN COMPONENT: CategoryDetailPage
 * Handles detailed management of individual product categories including:
 * - Style creation and editing
 * - Component/material assignment
 * - Financial calculations
 * - Status management and workflow
 */
const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  currentLinePlan,

  onUpdateStyle,
  onAddStyle,

  styleMetricView,
}) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // COMPONENT STATE: Current category and editing states
  const [category, setCategory] = useState<LinePlanCategory | undefined>(
    currentLinePlan?.categories.find((c) => c.id === categoryId)
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  // Add debug logging for state changes
  useEffect(() => {
    console.log("Selected product ID changed:", selectedProductId);
  }, [selectedProductId]);

  // Add debug logging for category changes
  useEffect(() => {
    console.log("Category changed:", category?.id);
  }, [category]);

  // MODAL STATES: Control for different modal dialogs
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  // METRIC HIGHLIGHTING STATE: Track which metric is selected for highlighting products/styles
  const [selectedMetricForHighlighting, setSelectedMetricForHighlighting] =
    useState<"revenue" | "margin" | "sell-in" | "sell-through" | null>(null);

  // EFFECT: Load category data when route parameter changes
  useEffect(() => {
    if (!currentLinePlan) {
      navigate("/");
      return;
    }
    const currentCategory = currentLinePlan.categories.find(
      (c) => c.id === categoryId
    );
    if (!currentCategory) {
      navigate("/");
      return;
    }
    setCategory(currentCategory);
  }, [categoryId, currentLinePlan, navigate]);

  // Add effect to keep category in sync with currentLinePlan
  useEffect(() => {
    if (currentLinePlan && categoryId) {
      const updatedCategory = currentLinePlan.categories.find(
        (c) => c.id === categoryId
      );
      if (updatedCategory) {
        setCategory(updatedCategory);
      }
    }
  }, [currentLinePlan, categoryId]);

  // EFFECT: Handle URL-based actions (e.g., ?action=add for creating new styles)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("action") === "add" && category && !isStyleModalOpen) {
      openStyleModal();
    }
  }, [location.search, category, isStyleModalOpen]);

  // Add effect to reset selectedProductId when category changes
  useEffect(() => {
    if (category) {
      const productExists = category.plannedStyles.some(
        (style) => style.id === selectedProductId
      );
      if (!productExists) {
        setSelectedProductId(null);
      }
    }
  }, [category, selectedProductId]);

  /**
   * MODAL FUNCTIONS: Handle opening/closing of style editing modal
   */
  const openStyleModal = (style?: PlannedStyle) => {
    if (style) {
      // EDIT MODE: Pre-populate form with existing style data
    } else {
      // CREATE MODE: Initialize with default values
      setIsStyleModalOpen(true);
    }
  };

  const handleProductSelect = (productId: string) => {
    console.log("handleProductSelect called with productId:", productId);
    setSelectedProductId(productId);
  };

  const handleProductBack = () => {
    console.log("Going back from product");
    setSelectedProductId(null);
  };

  // Product-level performance functions
  const getProductPerformanceStatus = (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ): "excellent" | "good" | "near" | "poor" | null => {
    if (!currentLinePlan) return null;

    // Calculate individual style metrics
    const volumePerStyle =
      category.targetVolume / (category.plannedStyles.length || 1);
    const styleRevenue = product.sellingPrice * volumePerStyle;

    switch (metricType) {
      case "revenue":
        // Use category-level revenue target divided by number of styles for individual target
        const categoryRevenueTarget =
          category.targetMetrics?.revenue ||
          currentLinePlan.targetOverallRevenue /
            currentLinePlan.categories.length;
        const styleRevenueTarget =
          categoryRevenueTarget / (category.plannedStyles.length || 1);

        if (styleRevenue >= styleRevenueTarget * 1.15) return "excellent"; // 15%+ above target
        if (styleRevenue >= styleRevenueTarget) return "good"; // At or above target
        if (styleRevenue >= styleRevenueTarget * 0.9) return "near"; // Within 10% of target
        return "poor"; // Below 90% of target

      case "margin":
        // Use category-specific margin target or program target
        const marginTarget =
          category.targetMetrics?.margin || currentLinePlan.targetOverallMargin;

        if (product.margin >= marginTarget * 1.05) return "excellent"; // 5%+ above target
        if (product.margin >= marginTarget) return "good"; // At or above target
        if (product.margin >= marginTarget * 0.95) return "near"; // Within 5% of target
        return "poor"; // Below 95% of target

      case "sell-in":
        // Use even distribution of category volume as target
        const styleSellInTarget = volumePerStyle;
        const styleSellIn =
          "projectedSellIn" in product
            ? product.projectedSellIn || volumePerStyle
            : volumePerStyle;

        if (styleSellIn >= styleSellInTarget * 1.1) return "excellent"; // 10%+ above target
        if (styleSellIn >= styleSellInTarget) return "good"; // At or above target
        if (styleSellIn >= styleSellInTarget * 0.9) return "near"; // Within 10% of target
        return "poor"; // Below 90% of target

      case "sell-through":
        // Use category-specific target or program target
        const sellThroughTarget =
          category.targetMetrics?.sellThrough ||
          currentLinePlan.targetOverallSellThrough;
        const styleSellThrough =
          "projectedSellThrough" in product
            ? product.projectedSellThrough ?? 0.8
            : "sellThrough" in product
            ? product.sellThrough ?? 0.8
            : 0.8;

        if (styleSellThrough >= sellThroughTarget * 1.05) return "excellent"; // 5%+ above target
        if (styleSellThrough >= sellThroughTarget) return "good"; // At or above target
        if (styleSellThrough >= sellThroughTarget * 0.95) return "near"; // Within 5% of target
        return "poor"; // Below 95% of target

      default:
        return null;
    }
  };

  // Product-level highlight reason function
  const getProductHighlightReason = (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ): string => {
    if (!currentLinePlan) return "";

    const status = getProductPerformanceStatus(product, category, metricType);
    if (!status) return "";

    // Calculate individual style metrics
    const volumePerStyle =
      category.targetVolume / (category.plannedStyles.length || 1);
    const styleRevenue = product.sellingPrice * volumePerStyle;
    const styleSellIn =
      "projectedSellIn" in product
        ? product.projectedSellIn || volumePerStyle
        : volumePerStyle;
    const styleSellThrough =
      "projectedSellThrough" in product
        ? product.projectedSellThrough ?? 0.8
        : "sellThrough" in product
        ? product.sellThrough ?? 0.8
        : 0.8;

    const statusEmoji = {
      excellent: "✅",
      good: "✅",
      near: "⚠️",
      poor: "🔴",
    };

    switch (metricType) {
      case "revenue":
        const categoryRevenueTarget =
          category.targetMetrics?.revenue ||
          currentLinePlan.targetOverallRevenue /
            currentLinePlan.categories.length;
        const styleRevenueTarget =
          categoryRevenueTarget / (category.plannedStyles.length || 1);
        const revenuePercent = (
          (styleRevenue / styleRevenueTarget) *
          100
        ).toFixed(0);
        return `${statusEmoji[status]} ${product.name}: $${(
          styleRevenue / 1000
        ).toFixed(1)}K revenue (${revenuePercent}% of target)`;

      case "margin":
        const marginTarget =
          category.targetMetrics?.margin || currentLinePlan.targetOverallMargin;
        const marginDiff = ((product.margin - marginTarget) * 100).toFixed(1);
        return `${statusEmoji[status]} ${product.name}: ${(
          product.margin * 100
        ).toFixed(1)}% margin (${
          marginDiff > "0" ? "+" : ""
        }${marginDiff}% vs target)`;

      case "sell-in":
        const styleSellInTarget = volumePerStyle;
        const sellInPercent = ((styleSellIn / styleSellInTarget) * 100).toFixed(
          0
        );
        return `${statusEmoji[status]} ${product.name}: ${(
          styleSellIn / 1000
        ).toFixed(1)}K sell-in (${sellInPercent}% of target)`;

      case "sell-through":
        const sellThroughTarget =
          category.targetMetrics?.sellThrough ||
          currentLinePlan.targetOverallSellThrough;
        const sellThroughPercent = (
          (styleSellThrough / sellThroughTarget) *
          100
        ).toFixed(0);
        return `${statusEmoji[status]} ${product.name}: ${(
          styleSellThrough * 100
        ).toFixed(1)}% sell-through (${sellThroughPercent}% of target)`;

      default:
        return "";
    }
  };

  // Product-level poor performer function (for backward compatibility)
  const isProductPoorPerformer = (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ): boolean => {
    const status = getProductPerformanceStatus(product, category, metricType);
    console.log(
      `[PRODUCT PERFORMANCE DEBUG] ${product.name} - ${metricType}: status = ${status}`
    );

    // TEMPORARY: Highlight ALL products for testing - remove this once confirmed working
    if (selectedMetricForHighlighting) {
      console.log(
        `[TEMP DEBUG] Highlighting ALL products for testing purposes`
      );
      return true;
    }

    return status === "poor";
  };

  if (!currentLinePlan) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center h-full">
        <InformationCircleIcon className="w-12 h-12 text-sky-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          No active program found
        </h2>
        <p className="text-slate-500 mt-2">
          Please select a program to view category details.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          Back to Overview
        </button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center h-full">
        <InformationCircleIcon className="w-12 h-12 text-sky-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          Category not found
        </h2>
        <p className="text-slate-500 mt-2">
          The requested category does not exist in the current program.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          Back to Overview
        </button>
      </div>
    );
  }

  console.log(
    "onProductSelect passed to CategoryDetailView:",
    handleProductSelect
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{category?.name}</h1>
            <div className="flex items-center space-x-2">
              <StatusBadge
                status={
                  category?.plmStatus || calculateCategoryStatus(category!)
                }
              />
              <span className="text-sm text-muted-foreground">
                {category?.plannedStyles.length || 0} styles
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedMetricForHighlighting || ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedMetricForHighlighting(
                value === ""
                  ? null
                  : (value as "revenue" | "margin" | "sell-in" | "sell-through")
              );
            }}
            className="text-sm border rounded-md px-2 py-1"
          >
            <option value="">Highlight by...</option>
            <option value="revenue">Revenue</option>
            <option value="margin">Margin</option>
            <option value="sell-in">Sell-in</option>
            <option value="sell-through">Sell-through</option>
          </select>
          <select
            value={styleMetricView}
            className="text-sm border rounded-md px-2 py-1"
          >
            {STYLE_METRIC_VIEW_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => openStyleModal()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <PlusCircleIcon className="w-5 h-5" />
            <span>Add Style</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <CategoryDetailView
          category={category}
          onUpdateStyle={onUpdateStyle}
          onAddStyle={onAddStyle}
          currentLayout="standard"
          programName={currentLinePlan.name}
          selectedProductId={selectedProductId}
          onProductSelect={handleProductSelect}
          onProductBack={handleProductBack}
          isStyleModalOpen={isStyleModalOpen}
          onStyleModalClose={() => setIsStyleModalOpen(false)}
          selectedMetricForHighlighting={selectedMetricForHighlighting}
          isProductPoorPerformer={isProductPoorPerformer}
          getProductHighlightReason={getProductHighlightReason}
          getProductPerformanceStatus={getProductPerformanceStatus}
        />
      </div>
    </div>
  );
};

export default CategoryDetailPage;
