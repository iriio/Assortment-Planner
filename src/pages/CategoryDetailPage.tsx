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
  MasterComponent,
  PlannedStyleStatus,
  PLMStatusStage,
  StyleComponentUsage,
  StyleMetricViewOption,
  UserRole,
  LinePlan,
} from "../types";
import { masterComponentsData as allMasterComponents } from "../data";
import { updateStyleFinancials, generateId } from "../services/planningService";
import Modal from "../components/Modal";
import {
  PencilIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  CollectionIcon,
  InformationCircleIcon,
  ArrowUpRightIcon,
} from "../components/icons";
import TagListDisplay from "../components/TagListDisplay";
import StatusBadge from "../components/StatusBadge";
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
  linePlans,
  currentLinePlan,
  setLinePlans,
  onUpdateStyle,
  onAddStyle,
  onCategoryStatusChange,
  styleMetricView,
}) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // COMPONENT STATE: Current category and editing states
  const [category, setCategory] = useState<LinePlanCategory | undefined>(
    undefined
  );
  const [editingStyle, setEditingStyle] = useState<PlannedStyle | null>(null);

  // MODAL STATES: Control for different modal dialogs
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  // FORM STATE: Style creation/editing form data
  const [styleForm, setStyleForm] = useState<Partial<PlannedStyle>>({
    name: "",
    color: "",
    sellingPrice: 0,
    costPrice: 0,
    status: PlannedStyleStatus.PLACEHOLDER,
    components: [],
    projectedSellThrough: 0.8,
    projectedSellIn: 100,
  });

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
      setEditingStyle(style);
      setStyleForm({ ...style });
    } else {
      // CREATE MODE: Initialize with default values
      setEditingStyle(null);
      setStyleForm({
        id: generateId(),
        name: "",
        status: PlannedStyleStatus.PLACEHOLDER,
        color: "",
        imageUrl: `https://picsum.photos/seed/${generateId().substring(
          0,
          6
        )}/300/400`,
        sellingPrice: 0,
        components: [],
        projectedSellThrough: 0.8,
        projectedSellIn: 100,
      });
    }
    setIsStyleModalOpen(true);
  };

  const closeStyleModal = () => {
    setIsStyleModalOpen(false);
    setEditingStyle(null);
    setStyleForm({});
    // Clear URL query parameters when closing
    if (new URLSearchParams(location.search).get("action") === "add") {
      navigate(location.pathname, { replace: true });
    }
  };

  /**
   * FORM HANDLERS: Manage form input changes and validation
   */
  const handleStyleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setStyleForm((prev) => ({
      ...prev,
      [name]: name === "sellingPrice" ? parseFloat(value) : value,
    }));
  };

  /**
   * SAVE FUNCTION: Process and save style data with financial calculations
   */
  const handleSaveStyle = () => {
    if (!category) {
      alert("Category not found. Cannot save style.");
      return;
    }
    if (!styleForm.name || !styleForm.color) {
      alert("Style Name and Color are required.");
      return;
    }

    // FINANCIAL CALCULATIONS: Cost, price, and margin computation
    const costPrice = Number(styleForm.costPrice) || 0;
    const sellingPrice = Number(styleForm.sellingPrice) || 0;
    let margin = 0;
    if (sellingPrice > 0) {
      margin = (sellingPrice - costPrice) / sellingPrice;
    }

    // BUILD STYLE OBJECT: Compile all style data
    const styleToSave: PlannedStyle = {
      id: editingStyle?.id || generateId(),
      name: styleForm.name || "New Style",
      color: styleForm.color || "N/A",
      costPrice: costPrice,
      sellingPrice: sellingPrice,
      margin: margin,
      status: styleForm.status || PlannedStyleStatus.PLACEHOLDER,
      plmStatus: editingStyle?.plmStatus || PLMStatusStage.BRIEFING,
      imageUrl: styleForm.imageUrl || editingStyle?.imageUrl,
      components: styleForm.components || editingStyle?.components || [],
      projectedSellThrough: Number(styleForm.projectedSellThrough) || 0,
      projectedSellIn: Number(styleForm.projectedSellIn) || 0,
      tags: styleForm.tags || editingStyle?.tags || [],
    };

    // SAVE ACTION: Update or create style
    if (editingStyle) onUpdateStyle(category.id, styleToSave);
    else onAddStyle(category.id, styleToSave);
    closeStyleModal();
  };

  /**
   * COMPONENT MODAL FUNCTIONS: Handle material/component assignment
   */
  const openComponentModal = (style: PlannedStyle) => {
    setEditingStyle(style);
    setStyleForm({ ...style });
    setIsComponentModalOpen(true);
  };

  const closeComponentModal = () => {
    setIsComponentModalOpen(false);
    setEditingStyle(null);
    setStyleForm({});
  };

  /**
   * COMPONENT MANAGEMENT: Handle adding/removing components from styles
   */
  const handleComponentChange = (
    componentType: MasterComponent["type"],
    newComponentId: string
  ) => {
    if (!editingStyle || !styleForm.components) return;

    // COMPONENT DATA: Get master component details for calculations
    const masterCompDetails = allMasterComponents.find(
      (mc) => mc.id === newComponentId
    );
    const quantity = masterCompDetails?.type === "FABRIC" ? 1.5 : 1;

    // FIND EXISTING: Check if component type already exists
    const existingComponentIndex = styleForm.components.findIndex(
      (c) =>
        allMasterComponents.find((mc) => mc.id === c.componentId)?.type ===
        componentType
    );

    let updatedComponents: StyleComponentUsage[];
    if (existingComponentIndex > -1) {
      if (newComponentId === "")
        // REMOVE: Delete component if empty ID provided
        updatedComponents = styleForm.components.filter(
          (_, index) => index !== existingComponentIndex
        );
      else
        updatedComponents = styleForm.components.map((c, index) =>
          index === existingComponentIndex
            ? { componentId: newComponentId, quantity }
            : c
        );
    } else {
      if (newComponentId !== "")
        updatedComponents = [
          ...styleForm.components,
          { componentId: newComponentId, quantity },
        ];
      else updatedComponents = [...styleForm.components];
    }
    setStyleForm((prev) => ({ ...prev, components: updatedComponents }));
  };

  const handleSaveComponents = () => {
    if (!category || !editingStyle || !styleForm.components) {
      alert("Category or style data missing. Cannot save components.");
      return;
    }
    const styleWithNewComponents: PlannedStyle = {
      ...editingStyle,
      components: styleForm.components,
    };
    const fullyUpdatedStyle = updateStyleFinancials(
      styleWithNewComponents,
      allMasterComponents
    );
    onUpdateStyle(category.id, fullyUpdatedStyle);
    closeComponentModal();
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

  const getMarginIndicator = (margin: number) => {
    if (!currentLinePlan) return null;
    if (margin < currentLinePlan.targetOverallMargin * 0.85) {
      return <ExclamationTriangleIcon className="w-3 h-3 mr-1 text-red-600" />;
    } else if (margin < currentLinePlan.targetOverallMargin) {
      return <ArrowUpRightIcon className="w-3 h-3 mr-1 text-amber-600" />;
    } else {
      return <CheckCircleIcon className="w-3 h-3 mr-1 text-green-600" />;
    }
  };

  const renderStyleMarginCell = (style: PlannedStyle) => {
    if (!currentLinePlan) return null;
    const margin = style.margin;
    const marginColorClass =
      margin < currentLinePlan.targetOverallMargin * 0.85
        ? "text-red-600"
        : margin < currentLinePlan.targetOverallMargin
        ? "text-amber-600"
        : "text-green-600";

    return (
      <div className="flex items-center">
        <span className={`font-medium ${marginColorClass}`}>
          {(margin * 100).toFixed(1)}%
        </span>
        {getMarginIndicator(margin)}
      </div>
    );
  };

  const styleModalFooter = (
    <>
      <button
        type="button"
        onClick={closeStyleModal}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition-all duration-150 ease-in-out active:bg-slate-200"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSaveStyle}
        className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all duration-150 ease-in-out active:bg-sky-700"
      >
        Save Style
      </button>
    </>
  );

  const componentModalFooter = (
    <>
      <button
        type="button"
        onClick={closeComponentModal}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition-all duration-150 ease-in-out active:bg-slate-200"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSaveComponents}
        className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all duration-150 ease-in-out active:bg-sky-700"
      >
        Save Components
      </button>
    </>
  );

  const categoryPlmStatus =
    category.plmStatus || calculateCategoryStatus(category);

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
