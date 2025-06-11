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
} from "@/types";

import {
  PlusCircleIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
} from "../components/common/icons";
import StatusBadge from "../components/common/StatusBadge";
import { calculateCategoryStatus } from "../utils/statusSystem";

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

  styleMetricView,
}) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // COMPONENT STATE: Current category and editing states
  const [category, setCategory] = useState<LinePlanCategory | undefined>(
    undefined
  );

  // MODAL STATES: Control for different modal dialogs
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  // EFFECT: Load category data when route parameter changes
  useEffect(() => {
    const currentCategory = currentLinePlan?.categories.find(
      (c) => c.id === categoryId
    );
    setCategory(currentCategory);
  }, [categoryId, currentLinePlan]);

  // EFFECT: Handle URL-based actions (e.g., ?action=add for creating new styles)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("action") === "add" && category && !isStyleModalOpen) {
      openStyleModal();
    }
  }, [location.search, category, isStyleModalOpen]);

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

  if (!category) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center h-full">
        <InformationCircleIcon className="w-12 h-12 text-sky-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          Loading category details...
        </h2>
        <p className="text-slate-500 mt-2">
          If this persists, the category may not exist in the current plan.
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
      <div className="p-5 md:p-6 space-y-6 bg-slate-50 flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-grow min-w-0">
              <div className="flex items-center mb-1.5">
                <button
                  onClick={() => navigate("/")}
                  className="p-2 mr-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200"
                  title="Back to Overview"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h1
                  className="text-2xl lg:text-3xl font-bold text-slate-800 truncate"
                  title={category?.name}
                >
                  {category?.name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailPage;
