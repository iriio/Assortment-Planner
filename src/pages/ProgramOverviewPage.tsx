/**
 * PROGRAM OVERVIEW PAGE - Main dashboard for managing assortment planning programs
 *
 * LAYOUT STRUCTURE:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    Main Container (flex)                    │
 * ├──────────────────┬──────────────────────────────────────────┤
 * │   SIDEBAR        │           MAIN CONTENT AREA             │
 * │   (collapsible)  │   ┌──────────────────────────────────┐   │
 * │                  │   │      HEADER BAR (sticky)        │   │
 * │  - Program List  │   │  - Breadcrumbs                  │   │
 * │  - New Program   │   │  - Action Buttons               │   │
 * │  - Status        │   └──────────────────────────────────┤   │
 * │                  │   │                                  │   │
 * │                  │   │        CONTENT AREA              │   │
 * │                  │   │  ┌─────────────┬──────────────┐  │   │
 * │                  │   │  │  TARGETS    │   PROJECTS   │  │   │
 * │                  │   │  │  PANEL      │   GRID/LIST  │  │   │
 * │                  │   │  │ (resizable) │              │  │   │
 * │                  │   │  │             │              │  │   │
 * │                  │   │  └─────────────┴──────────────┘  │   │
 * │                  │   └──────────────────────────────────┘   │
 * └──────────────────┴──────────────────────────────────────────┘
 *
 * VIEW MODES:
 * - overview: Shows all project categories in grid/list
 * - category: Shows detailed view of single category with styles
 * - composition: Shows program composition analysis
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LinePlan,
  ProductCatalogueItem,
  GlobalMetricViewOption,
  CategoryMetricViewOption,
  PlannedStyle,
  PLMStatusStage,
  UserRole,
  LinePlanCategory,
  ProjectCreationInput,
} from "../types";
import { productCatalogueData as allCatalogueItems } from "../data";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  MinusIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  PercentIcon,
  ChartBarIcon as ChartBarIconPhosphor,
  LayoutDashboardIcon as LayoutDashboardIconPhosphor,
  TableCellsIcon as TableCellsIconPhosphor,
  ViewColumnsIcon as ViewColumnsIconPhosphor,
  PlusIcon as PlusIconPhosphor,
  CollectionIcon,
  XMarkIcon as XIcon,
  ChartLineUpIcon,
  DownloadSimpleIcon,
  UploadSimpleIcon,
  PackageIcon,
  ChevronRightIcon as ChevronRight,
} from "../components/icons";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard as LayoutDashboardIcon,
  List as ListIcon,
  Columns as ColumnsIcon,
  Plus as PlusIcon,
  BarChart2 as BarChart2Icon,
  Folder,
  Settings,
  Calendar,
} from "lucide-react";

import Modal from "../components/Modal";
import { MetricDisplayCard } from "../components/MetricDisplayCard";
import CatalogueModal from "../components/CatalogueModal";
import ProductLineCategoryCard from "../components/ProductLineCategoryCard";
import AddCategoryModal from "../components/AddCategoryModal";
import EditProgramTargetsModal from "../components/EditProgramTargetsModal";
import CategoryTargetsModal from "../components/CategoryTargetsModal";
import AddOptionsPopover from "../components/AddOptionsPopover";
import CategoryDetailView from "../components/CategoryDetailView";
import CompositionView, { FilterState } from "../components/CompositionView";
import StatusFilter from "../components/StatusFilter";
import {
  calculateProgramStatus,
  calculateCategoryStatus,
} from "../utils/statusSystem";
import StatusBadge from "../components/StatusBadge";
import {
  loadUIPreferences,
  saveUIPreference,
  UIPreferences,
} from "../utils/localStorage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "../../components/ui/progress";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
} from "recharts";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type LayoutViewOption = "standard" | "compactList" | "wideView";
type ViewMode = "overview" | "category" | "composition";

const LAYOUT_OPTIONS: {
  value: LayoutViewOption;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { value: "standard", label: "Standard Dashboard", icon: LayoutDashboardIcon },
  { value: "compactList", label: "Compact List", icon: ListIcon },
  { value: "wideView", label: "Wide View (Horizontal)", icon: ColumnsIcon },
];

type ActiveTargetFilterType = "revenue" | "margin" | "sellin" | "sellthrough";
interface ActiveTargetFilter {
  type: ActiveTargetFilterType;
  displayName: string;
}

interface ConfirmAddCarryoverModalState {
  isOpen: boolean;
  itemToAdd: ProductCatalogueItem | null;
  selectedCategoryId: string;
}

interface ProjectFormInput {
  name: string;
  targetVolume: number | "";
  targetRevenue: number | "";
  targetMargin: number | "";
  targetSellThrough: number | "";
}

interface ProgramDetailsForUpdate {
  name: string;
  season: string;
  targetOverallMargin: number;
  targetOverallSellThrough: number;
  targetOverallRevenue: number;
  projects: ProjectCreationInput[];
}

interface ProgramOverviewPageProps {
  linePlans: LinePlan[];
  currentLinePlan: LinePlan | null;
  setCurrentLinePlanId: (id: string) => void;
  onUpdateTargets: (
    margin: number,
    sellThrough: number,
    revenue: number
  ) => void;
  onPullInStyle: (categoryId: string, style: ProductCatalogueItem) => void;
  onAddCategory: () => void;
  globalMetricView: GlobalMetricViewOption;
  setGlobalMetricView: (view: GlobalMetricViewOption) => void;
  categoryMetricView: CategoryMetricViewOption;
  setCategoryMetricView: (view: CategoryMetricViewOption) => void;
  setLinePlans: React.Dispatch<React.SetStateAction<LinePlan[]>>;
  onInitiateNewDraftProgram: () => void;
  onUpdateProgramDetails: (
    programId: string,
    details: ProgramDetailsForUpdate
  ) => void;
}

const ProgramOverviewPage = ({
  linePlans,
  currentLinePlan,
  setCurrentLinePlanId,
  onUpdateTargets,
  onPullInStyle,
  onAddCategory,
  categoryMetricView,
  setLinePlans,
  onInitiateNewDraftProgram,
  onUpdateProgramDetails,
}: ProgramOverviewPageProps): JSX.Element => {
  const navigate = useNavigate();

  // UI PREFERENCES: Load saved user interface preferences from localStorage
  const uiPreferences = useMemo(() => loadUIPreferences(), []);

  // LAYOUT STATE: Current view layout (grid, list, etc.)
  const [currentLayout, setCurrentLayout] = useState<LayoutViewOption>(
    () => uiPreferences.currentLayout || "standard"
  );

  // SIDEBAR STATE: Manage sidebar open/close state with localStorage persistence
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => uiPreferences.sidebarCollapsed !== true
  );

  // FORM STATE: Program creation form visibility
  const [showCreateProgramForm, setShowCreateProgramForm] = useState<boolean>(
    !currentLinePlan && linePlans.length === 0
  );

  // FILTER STATE: Active target performance filter
  const [activeTargetFilter, setActiveTargetFilter] =
    useState<ActiveTargetFilter | null>(null);

  // NAVIGATION STATE: Current selected category and product for drill-down navigation
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  // VIEW STATE: Current view mode (overview/category/composition)
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // MODAL STATES: Various modal dialog visibility states
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditTargetsModalOpen, setIsEditTargetsModalOpen] = useState(false);
  const [isEditCategoryTargetsModalOpen, setIsEditCategoryTargetsModalOpen] =
    useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );

  // CARRYOVER MODAL STATE: State for adding carryover styles from catalogue
  const [confirmAddModalState, setConfirmAddModalState] =
    useState<ConfirmAddCarryoverModalState>({
      isOpen: false,
      itemToAdd: null,
      selectedCategoryId: currentLinePlan?.categories[0]?.id || "",
    });

  // POPOVER STATE: Add options dropdown menu
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(
    null
  ) as React.MutableRefObject<HTMLButtonElement>;

  // FILTER STATE: Composition view filters with localStorage persistence
  const [filters, setFilters] = useState<FilterState>(
    () =>
      uiPreferences.lastActiveFilters || {
        categories: [],
        excludeCategories: [],
        tags: [],
        excludeTags: [],
        priceRange: { min: 0, max: 1000 },
        marginRange: { min: 0, max: 100 },
        status: [],
      }
  );

  // USER STATE: Current user role and status filters
  const [userRole, _setUserRole] = useState<UserRole>(UserRole.MERCHANT);
  const [statusFilters, setStatusFilters] = useState<PLMStatusStage[]>([]);

  // RESIZABLE PANEL STATE: Targets panel width with drag-to-resize functionality
  const [targetsPanelWidth, setTargetsPanelWidth] = useState(
    () => uiPreferences.targetsPanelWidth || 320
  ); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = React.useRef(false);
  const MIN_PANEL_WIDTH = 280;
  const MAX_PANEL_WIDTH = 500;

  // FORM STATE: Program creation form fields
  const [programName, setProgramName] = useState("");
  const [programSeason, setProgramSeason] = useState("");
  const [programTargetMargin, setProgramTargetMargin] = useState<number | "">(
    60
  );
  const [programTargetSellThrough, setProgramTargetSellThrough] = useState<
    number | ""
  >(85);
  const [programTargetRevenue, setProgramTargetRevenue] = useState<number | "">(
    500000
  );

  // PROJECT FORM STATE: Dynamic project creation fields
  const initialProjectFormState: ProjectFormInput = {
    name: "",
    targetVolume: "",
    targetRevenue: "",
    targetMargin: "",
    targetSellThrough: "",
  };
  const [projects, setProjects] = useState<ProjectFormInput[]>([
    { ...initialProjectFormState },
  ]);

  /**
   * UTILITY FUNCTION: Reset all form fields to initial state
   */
  const resetFormFields = () => {
    setProgramName("");
    setProgramSeason("");
    setProgramTargetMargin(60);
    setProgramTargetSellThrough(85);
    setProgramTargetRevenue(500000);
    setProjects([{ ...initialProjectFormState }]);
  };

  // UI PREFERENCES PERSISTENCE: Save UI state changes to localStorage
  useEffect(() => {
    saveUIPreference("currentLayout", currentLayout);
  }, [currentLayout]);

  useEffect(() => {
    saveUIPreference("lastActiveFilters", filters);
  }, [filters]);

  useEffect(() => {
    saveUIPreference("targetsPanelWidth", targetsPanelWidth);
  }, [targetsPanelWidth]);

  // Persist sidebar state changes to localStorage
  useEffect(() => {
    saveUIPreference("sidebarCollapsed", !sidebarOpen);
  }, [sidebarOpen]);

  const handleProjectDetailChange = (
    index: number,
    field: keyof ProjectFormInput,
    value: string | number
  ) => {
    const updatedProjects = [...projects];
    if (
      field === "targetVolume" ||
      field === "targetRevenue" ||
      field === "targetMargin" ||
      field === "targetSellThrough"
    ) {
      (updatedProjects[index] as any)[field] =
        value === "" ? "" : Number(value);
    } else {
      (updatedProjects[index] as any)[field] = value;
    }
    setProjects(updatedProjects);
  };

  const addProjectField = () => {
    setProjects([...projects, { ...initialProjectFormState }]);
  };

  const removeProjectField = (index: number) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    if (updatedProjects.length === 0) {
      setProjects([{ ...initialProjectFormState }]);
    } else {
      setProjects(updatedProjects);
    }
  };

  const handleProgramFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLinePlan) {
      console.error("No current program to update. This should not happen.");
      alert("Error: No program selected to update.");
      return;
    }

    const finalProgramName =
      programName.trim() === "" ? "Untitled Program" : programName.trim();

    if (!finalProgramName || !programSeason) {
      alert("Program Name and Season are required.");
      return;
    }
    if (
      programTargetMargin === "" ||
      programTargetSellThrough === "" ||
      programTargetRevenue === ""
    ) {
      alert(
        "All program-level targets (Margin, Sell-Through, Revenue) are required."
      );
      return;
    }

    const programMarginValue = Number(programTargetMargin) / 100;
    const programSellThroughValue = Number(programTargetSellThrough) / 100;
    const programRevenueValue = Number(programTargetRevenue);

    const validProjects: ProjectCreationInput[] = projects
      .filter((p) => p.name.trim() !== "")
      .map((p) => ({
        name: p.name.trim(),
        targetVolume: p.targetVolume === "" ? 0 : Number(p.targetVolume),
        targetRevenue: p.targetRevenue === "" ? 0 : Number(p.targetRevenue),
        targetMargin: p.targetMargin === "" ? 0 : Number(p.targetMargin) / 100,
        targetSellThrough:
          p.targetSellThrough === "" ? 0 : Number(p.targetSellThrough) / 100,
      }));

    onUpdateProgramDetails(currentLinePlan.id, {
      name: finalProgramName,
      season: programSeason,
      targetOverallMargin: programMarginValue,
      targetOverallSellThrough: programSellThroughValue,
      targetOverallRevenue: programRevenueValue,
      projects: validProjects,
    });
    setShowCreateProgramForm(false);
  };

  // Add new function to handle initial program creation
  const handleInitiateProgramCreation = () => {
    onInitiateNewDraftProgram();
    setShowCreateProgramForm(true);
    resetFormFields();
  };

  const handleCancelCreateProgram = () => {
    setShowCreateProgramForm(false);
    resetFormFields();
    if (
      currentLinePlan &&
      currentLinePlan.name === "Untitled Program" &&
      linePlans.length > 1
    ) {
      const otherPlan =
        linePlans.find((lp) => lp.id !== currentLinePlan.id) || linePlans[0];
      if (otherPlan) setCurrentLinePlanId(otherPlan.id);
    } else if (
      currentLinePlan &&
      currentLinePlan.name === "Untitled Program" &&
      linePlans.length <= 1
    ) {
      // If it's the only plan and it's an unsaved draft, what to do?
      // For now, we keep it selected. User can delete it if they wish or try editing again.
    }
  };

  useEffect(() => {
    if (showCreateProgramForm && currentLinePlan) {
      setProgramName(
        currentLinePlan.name === "Untitled Program" ? "" : currentLinePlan.name
      );
      setProgramSeason(currentLinePlan.season);
      setProgramTargetMargin(currentLinePlan.targetOverallMargin * 100);
      setProgramTargetSellThrough(
        currentLinePlan.targetOverallSellThrough * 100
      );
      setProgramTargetRevenue(currentLinePlan.targetOverallRevenue);
      if (currentLinePlan.categories && currentLinePlan.categories.length > 0) {
        setProjects(
          currentLinePlan.categories.map((cat) => ({
            name: cat.name,
            targetVolume: cat.targetVolume || "",
            targetRevenue: cat.targetMetrics?.revenue || "",
            targetMargin: cat.targetMetrics?.margin
              ? cat.targetMetrics.margin * 100
              : "",
            targetSellThrough: cat.targetMetrics?.sellThrough
              ? cat.targetMetrics.sellThrough * 100
              : "",
          }))
        );
      } else {
        setProjects([{ ...initialProjectFormState }]);
      }
    } else if (!showCreateProgramForm) {
      // Optional: If form is hidden, reset fields to prevent stale data showing if re-opened for a *different* new draft.
      // resetFormFields(); // Consider if this is needed or if effect for population is enough.
    }
  }, [showCreateProgramForm, currentLinePlan]);

  useEffect(() => {
    if (currentLinePlan && currentLinePlan.name !== "Untitled Program") {
      setShowCreateProgramForm(false);
    } else if (!currentLinePlan && linePlans.length === 0) {
      setShowCreateProgramForm(true);
      resetFormFields();
    } else if (currentLinePlan && currentLinePlan.name === "Untitled Program") {
      setShowCreateProgramForm(true);
    }
  }, [currentLinePlan, linePlans]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleStatusFiltersChange = (statuses: PLMStatusStage[]) => {
    setStatusFilters(statuses);
  };

  const handleTargetFilterClick = (
    filterType: ActiveTargetFilterType,
    displayName: string
  ) => {
    setActiveTargetFilter((prev) =>
      prev?.type === filterType ? null : { type: filterType, displayName }
    );
  };

  const openCatalogueModal = () => setIsCatalogueModalOpen(true);
  const closeCatalogueModal = () => setIsCatalogueModalOpen(false);

  const handleSelectItemFromCatalogue = (item: ProductCatalogueItem) => {
    setConfirmAddModalState({
      isOpen: true,
      itemToAdd: item,
      selectedCategoryId:
        currentLinePlan?.categories.find((c) => c.name === item.categoryName)
          ?.id ||
        currentLinePlan?.categories[0]?.id ||
        "",
    });
  };

  const closeConfirmAddModal = () => {
    setConfirmAddModalState((prev) => ({
      ...prev,
      isOpen: false,
      itemToAdd: null,
    }));
  };

  const handleConfirmAddCarryover = () => {
    if (
      confirmAddModalState.itemToAdd &&
      confirmAddModalState.selectedCategoryId
    ) {
      onPullInStyle(
        confirmAddModalState.selectedCategoryId,
        confirmAddModalState.itemToAdd
      );
    }
    closeConfirmAddModal();
  };

  const handleAddNewStyleToCategory = (category: LinePlanCategory) => {
    navigate(`/category/${category.id}?action=add`);
  };

  const handleAddPlaceholder = (categoryId: string) => {
    navigate(`/category/${categoryId}?action=add&type=placeholder`);
  };

  const overallProjectedRevenue = useMemo(() => {
    if (!currentLinePlan?.categories) return 0;
    return (
      (currentLinePlan.categories || []).reduce(
        (sum, cat) =>
          sum +
          (cat.plannedStyles || []).reduce(
            (styleSum, style) =>
              styleSum +
              style.sellingPrice *
                (cat.targetVolume / ((cat.plannedStyles || []).length || 1)),
            0
          ),
        0
      ) / 1000000
    );
  }, [currentLinePlan?.categories]);

  const overallAchievedMargin = useMemo(() => {
    if (!currentLinePlan?.categories) return 0;
    let totalRevenue = 0;
    let totalCost = 0;
    (currentLinePlan.categories || []).forEach((cat) => {
      (cat.plannedStyles || []).forEach((style) => {
        const styleVolume =
          cat.targetVolume / ((cat.plannedStyles || []).length || 1);
        totalRevenue += style.sellingPrice * styleVolume;
        totalCost += style.costPrice * styleVolume;
      });
    });
    return totalRevenue === 0 ? 0 : (totalRevenue - totalCost) / totalRevenue;
  }, [currentLinePlan?.categories]);

  const sortedCategories = useMemo(() => {
    if (!currentLinePlan?.categories) return [];
    let categoriesCopy = [...(currentLinePlan.categories || [])];

    if (statusFilters.length > 0) {
      categoriesCopy = categoriesCopy.filter((cat) => {
        const categoryStatus = cat.plmStatus || calculateCategoryStatus(cat);
        return statusFilters.includes(categoryStatus);
      });
    }

    if (!activeTargetFilter) return categoriesCopy;

    switch (activeTargetFilter.type) {
      case "margin":
        return categoriesCopy.sort((a, b) => {
          const marginA =
            (a.plannedStyles || []).length > 0
              ? (a.plannedStyles || []).reduce(
                  (s: number, st: PlannedStyle) => s + st.margin,
                  0
                ) / (a.plannedStyles || []).length
              : -1;
          const marginB =
            (b.plannedStyles || []).length > 0
              ? (b.plannedStyles || []).reduce(
                  (s: number, st: PlannedStyle) => s + st.margin,
                  0
                ) / (b.plannedStyles || []).length
              : -1;
          return marginB - marginA;
        });
      default:
        return categoriesCopy;
    }
  }, [currentLinePlan?.categories, activeTargetFilter, statusFilters]);

  const getLayoutConfig = (
    layout: LayoutViewOption
  ): { containerClasses: string; cardDisplayMode: "grid" | "list" } => {
    switch (layout) {
      case "standard":
        return {
          containerClasses:
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 items-start auto-rows-auto",
          cardDisplayMode: "grid",
        };
      case "compactList":
        return {
          containerClasses: "space-y-3.5 p-5",
          cardDisplayMode: "list",
        };
      case "wideView":
      default:
        return {
          containerClasses:
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 items-start auto-rows-auto",
          cardDisplayMode: "grid",
        };
    }
  };

  const renderTargetsSectionContent = (
    layout: LayoutViewOption = "standard"
  ) => {
    const isCompact = layout === "compactList";
    const selectedCategory = selectedCategoryId
      ? (currentLinePlan?.categories || []).find(
          (cat) => cat.id === selectedCategoryId
        )
      : null;

    // Calculations for metrics
    const sellInProjected = (currentLinePlan?.categories || []).reduce(
      (sum, cat) => {
        const stylesCount = (cat.plannedStyles || []).length || 1;
        const volumePerStyle = cat.targetVolume / stylesCount;
        return (
          sum +
          (cat.plannedStyles || []).reduce(
            (styleSum, style) =>
              styleSum + (style.projectedSellIn || volumePerStyle),
            0
          )
        );
      },
      0
    );
    const sellInTarget = (currentLinePlan?.categories || []).reduce(
      (sum, cat) => sum + cat.targetVolume,
      0
    );
    const sellThroughProjected = (() => {
      if (!currentLinePlan?.categories) return 0;
      let totalProjectedSellThroughUnits = 0;
      let totalBaseUnits = 0;
      (currentLinePlan.categories || []).forEach((cat) => {
        const stylesCount = (cat.plannedStyles || []).length || 1;
        const volumePerStyle = cat.targetVolume / stylesCount;
        (cat.plannedStyles || []).forEach((style) => {
          const baseVolume = style.projectedSellIn || volumePerStyle;
          totalBaseUnits += baseVolume;
          totalProjectedSellThroughUnits +=
            (style.projectedSellThrough ?? 0.8) * baseVolume;
        });
      });
      return totalBaseUnits > 0
        ? (totalProjectedSellThroughUnits / totalBaseUnits) * 100
        : 0;
    })();
    const overallProjectedRevenue =
      (currentLinePlan?.categories || []).reduce(
        (sum, cat) =>
          sum +
          (cat.plannedStyles || []).reduce(
            (styleSum, style) =>
              styleSum +
              style.sellingPrice *
                (cat.targetVolume / ((cat.plannedStyles || []).length || 1)),
            0
          ),
        0
      ) / 1000000;
    const overallAchievedMargin = (() => {
      if (!currentLinePlan?.categories) return 0;
      let totalRevenue = 0;
      let totalCost = 0;
      (currentLinePlan.categories || []).forEach((cat) => {
        (cat.plannedStyles || []).forEach((style) => {
          const styleVolume =
            cat.targetVolume / ((cat.plannedStyles || []).length || 1);
          totalRevenue += style.sellingPrice * styleVolume;
          totalCost += style.costPrice * styleVolume;
        });
      });
      return totalRevenue === 0 ? 0 : (totalRevenue - totalCost) / totalRevenue;
    })();

    // Metric card data
    const metricCards = [
      {
        key: "revenue",
        title: "Revenue",
        projectedValue: overallProjectedRevenue,
        targetValue: (currentLinePlan?.targetOverallRevenue ?? 0) / 1000000,
        unit: "$M",
        icon: <CurrencyDollarIcon className="w-5 h-5" />,
        higherIsBetter: true,
        displayValueFormatter: (v: number) => `$${v.toFixed(1)}M`,
      },
      {
        key: "margin",
        title: "Margin",
        projectedValue: overallAchievedMargin * 100,
        targetValue: (currentLinePlan?.targetOverallMargin ?? 0) * 100,
        unit: "%",
        icon: <ScaleIcon className="w-5 h-5" />,
        higherIsBetter: true,
        displayValueFormatter: (v: number) => `${v.toFixed(1)}%`,
      },
      {
        key: "sellin",
        title: "Sell-In",
        projectedValue: sellInProjected,
        targetValue: sellInTarget,
        unit: "units",
        icon: <PackageIcon className="w-5 h-5" />,
        higherIsBetter: true,
        displayValueFormatter: (v: number) => v.toLocaleString(),
      },
      {
        key: "sellthrough",
        title: "Sell-Through",
        projectedValue: sellThroughProjected,
        targetValue: (currentLinePlan?.targetOverallSellThrough ?? 0) * 100,
        unit: "%",
        icon: <PercentIcon className="w-5 h-5" />,
        higherIsBetter: true,
        displayValueFormatter: (v: number) => `${v.toFixed(1)}%`,
      },
    ];

    // Show dependencies or lower-level cards if a metric is active
    let dependenciesContent = null;
    if (activeTargetFilter) {
      // Example: show a list of categories or styles that contribute to the selected metric
      if (
        activeTargetFilter.type === "revenue" &&
        currentLinePlan?.categories
      ) {
        dependenciesContent = (
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Category Revenue Breakdown
            </div>
            <div className="space-y-2">
              {currentLinePlan.categories.map((cat) => {
                const catRevenue =
                  (cat.plannedStyles || []).reduce(
                    (sum, style) =>
                      sum +
                      style.sellingPrice *
                        (cat.targetVolume /
                          ((cat.plannedStyles || []).length || 1)),
                    0
                  ) / 1000000;
                return (
                  <div
                    key={cat.id}
                    className="flex justify-between text-xs px-2 py-1 rounded bg-muted/50"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="font-mono">${catRevenue.toFixed(2)}M</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else if (
        activeTargetFilter.type === "margin" &&
        currentLinePlan?.categories
      ) {
        dependenciesContent = (
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Category Margin Breakdown
            </div>
            <div className="space-y-2">
              {currentLinePlan.categories.map((cat) => {
                let totalRevenue = 0;
                let totalCost = 0;
                (cat.plannedStyles || []).forEach((style) => {
                  const styleVolume =
                    cat.targetVolume / ((cat.plannedStyles || []).length || 1);
                  totalRevenue += style.sellingPrice * styleVolume;
                  totalCost += style.costPrice * styleVolume;
                });
                const margin =
                  totalRevenue === 0
                    ? 0
                    : ((totalRevenue - totalCost) / totalRevenue) * 100;
                return (
                  <div
                    key={cat.id}
                    className="flex justify-between text-xs px-2 py-1 rounded bg-muted/50"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="font-mono">{margin.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else if (
        activeTargetFilter.type === "sellin" &&
        currentLinePlan?.categories
      ) {
        dependenciesContent = (
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Category Sell-In Breakdown
            </div>
            <div className="space-y-2">
              {currentLinePlan.categories.map((cat) => {
                const projected = (cat.plannedStyles || []).reduce(
                  (sum, style) => sum + (style.projectedSellIn || 0),
                  0
                );
                return (
                  <div
                    key={cat.id}
                    className="flex justify-between text-xs px-2 py-1 rounded bg-muted/50"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="font-mono">
                      {projected.toLocaleString()} /{" "}
                      {cat.targetVolume.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else if (
        activeTargetFilter.type === "sellthrough" &&
        currentLinePlan?.categories
      ) {
        dependenciesContent = (
          <div className="mt-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Category Sell-Through Breakdown
            </div>
            <div className="space-y-2">
              {currentLinePlan.categories.map((cat) => {
                let totalProjectedSellThroughUnits = 0;
                let totalBaseUnits = 0;
                (cat.plannedStyles || []).forEach((style) => {
                  const baseVolume = style.projectedSellIn || 0;
                  totalBaseUnits += baseVolume;
                  totalProjectedSellThroughUnits +=
                    (style.projectedSellThrough ?? 0.8) * baseVolume;
                });
                const sellThrough =
                  totalBaseUnits > 0
                    ? (totalProjectedSellThroughUnits / totalBaseUnits) * 100
                    : 0;
                return (
                  <div
                    key={cat.id}
                    className="flex justify-between text-xs px-2 py-1 rounded bg-muted/50"
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="font-mono">{sellThrough.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    }

    return (
      <div className="bg-card shadow-none border-none p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Program Targets</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditTargetsModalOpen(true)}
          >
            Edit Targets
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {metricCards.map((metric) => {
            // Calculate progress and delta
            const projected = metric.projectedValue;
            const target = metric.targetValue;
            const isPercent = metric.unit === "%";
            const isCurrency = metric.unit === "$M";
            const progress = target === 0 ? 0 : (projected / target) * 100;
            const delta = projected - target;
            const deltaPercent =
              target === 0 ? 0 : ((projected - target) / target) * 100;
            // Status thresholds
            let status: "over" | "near" | "under";
            if (progress >= 105) {
              status = "over";
            } else if (progress >= 95) {
              status = "near";
            } else {
              status = "under";
            }
            // Icon and color for status (top right)
            let StatusIcon = null;
            let statusColor = "text-gray-400";
            if (status === "over") {
              StatusIcon = ChevronUpIcon;
              statusColor = "text-green-600";
            } else if (status === "near") {
              StatusIcon = ChevronRightIcon;
              statusColor = "text-yellow-500";
            } else {
              StatusIcon = MinusIcon;
              statusColor = "text-red-500";
            }
            // Delta string
            let deltaString = "";
            if (isPercent) {
              deltaString = `${delta >= 0 ? "+" : ""}${deltaPercent.toFixed(
                1
              )}% ${delta >= 0 ? "over" : "below"} target`;
            } else if (isCurrency) {
              deltaString = `${delta >= 0 ? "+" : "-"}$${Math.abs(
                delta
              ).toFixed(2)}M ${delta >= 0 ? "over" : "below"} target`;
            } else {
              deltaString = `${delta >= 0 ? "+" : "-"}${Math.abs(
                delta
              ).toLocaleString()} ${delta >= 0 ? "over" : "below"} target`;
            }
            return (
              <div
                key={metric.key}
                className="relative p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer flex flex-col gap-1 transition-colors duration-200"
                onClick={() =>
                  setActiveTargetFilter((prev) =>
                    prev?.type === metric.key
                      ? null
                      : {
                          type: metric.key as ActiveTargetFilterType,
                          displayName: metric.title,
                        }
                  )
                }
              >
                {/* Title row with icon and status icon */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="text-sm font-medium">{metric.title}</span>
                  </div>
                  <span
                    className={`ml-2 ${statusColor}`}
                    title={
                      status === "over"
                        ? "Over Target"
                        : status === "near"
                        ? "Near Target"
                        : "Under Target"
                    }
                  >
                    <StatusIcon className="w-5 h-5" />
                  </span>
                </div>
                <div className="flex items-end justify-between mb-1">
                  <span className="text-xl font-bold">
                    {metric.displayValueFormatter(projected)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Target: {metric.displayValueFormatter(target)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full transition-all duration-300 ${statusColor.replace(
                      "text-",
                      "bg-"
                    )}`}
                    style={{
                      width: `${Math.min(100, progress)}%`,
                    }}
                  />
                </div>
                <div className={`text-xs font-medium ${statusColor}`}>
                  {deltaString}
                </div>
              </div>
            );
          })}
        </div>
        {dependenciesContent}
      </div>
    );
  };

  const handleSelectCategory = (category: LinePlanCategory) => {
    setSelectedCategoryId(category.id);
    setSelectedProductId(null);
    setViewMode("category");
  };

  const handleBackToOverview = () => {
    setSelectedCategoryId(null);
    setSelectedProductId(null);
    setViewMode("overview");
  };

  const handleBackToCategory = () => {
    setSelectedProductId(null);
    // Keep selectedCategoryId and viewMode as "category"
  };

  const handleShowComposition = () => {
    setViewMode("composition");
  };

  const handleBackFromComposition = () => {
    setViewMode("overview");
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleProductBack = () => {
    setSelectedProductId(null);
  };

  const handleProductClickFromComposition = (
    projectId: string,
    _productId: string
  ) => {
    setSelectedCategoryId(projectId);
    setViewMode("category");
  };

  const renderProductLinesSectionContent = (layout: LayoutViewOption) => {
    const { containerClasses, cardDisplayMode } = getLayoutConfig(layout);

    if (viewMode === "composition" && currentLinePlan) {
      return (
        <div className="flex-grow p-5">
          <CompositionView
            linePlan={currentLinePlan}
            onBack={handleBackFromComposition}
            onProductClick={handleProductClickFromComposition}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      );
    }

    if (viewMode === "category" && selectedCategoryId) {
      const selectedCategory = (currentLinePlan?.categories || []).find(
        (cat) => cat.id === selectedCategoryId
      );
      if (!selectedCategory) {
        setSelectedCategoryId(null);
        setViewMode("overview");
        return null;
      }

      return (
        <div className="flex-1 h-full overflow-hidden">
          <CategoryDetailView
            category={selectedCategory}
            onUpdateStyle={handleUpdateStyle}
            onAddStyle={handleAddStyle}
            currentLayout={layout}
            userRole={userRole}
            programName={currentLinePlan?.name || "Untitled Program"}
            selectedProductId={selectedProductId}
            onProductSelect={handleProductSelect}
            onProductBack={handleProductBack}
          />
        </div>
      );
    }

    return (
      <div className={`${containerClasses} items-start auto-rows-min gap-5`}>
        {(sortedCategories || []).map((category) => (
          <ProductLineCategoryCard
            key={category.id}
            category={category}
            onSelectCategory={handleSelectCategory}
            onAddNewStyle={handleAddNewStyleToCategory}
            activeTargetFilter={activeTargetFilter?.type || null}
            targetOverallMargin={currentLinePlan?.targetOverallMargin ?? 0}
            season={currentLinePlan?.season ?? ""}
            displayMode={cardDisplayMode}
            metricViewStyle={categoryMetricView}
            userRole={userRole}
            onStatusChange={handleCategoryStatusChange}
          />
        ))}
        {(currentLinePlan?.categories || []).length === 0 && (
          <div className="md:col-span-full text-center py-16 px-6">
            <CollectionIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="text-md font-semibold text-card-foreground">
              This Plan is Empty
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Add categories (projects) and styles to start planning your
              assortment.
            </p>
            <Button
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="mt-4"
            >
              Add Category
            </Button>
          </div>
        )}
      </div>
    );
  };

  const handleUpdateStyle = (
    categoryId: string,
    updatedStyle: PlannedStyle
  ) => {
    setLinePlans((prevPlans: LinePlan[]) =>
      prevPlans.map((plan: LinePlan) =>
        plan.id === currentLinePlan?.id
          ? {
              ...plan,
              categories: plan.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      plannedStyles: cat.plannedStyles.map((style) =>
                        style.id === updatedStyle.id ? updatedStyle : style
                      ),
                    }
                  : cat
              ),
            }
          : plan
      )
    );
  };

  const handleAddStyle = (categoryId: string, newStyle: PlannedStyle) => {
    setLinePlans((prevPlans: LinePlan[]) =>
      prevPlans.map((plan: LinePlan) =>
        plan.id === currentLinePlan?.id
          ? {
              ...plan,
              categories: plan.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      plannedStyles: [...cat.plannedStyles, newStyle],
                    }
                  : cat
              ),
            }
          : plan
      )
    );
  };

  const handleCategoryStatusChange = (
    category: LinePlanCategory,
    newStatus: PLMStatusStage
  ) => {
    setLinePlans((prevPlans: LinePlan[]) =>
      prevPlans.map((plan: LinePlan) =>
        plan.id === currentLinePlan?.id
          ? {
              ...plan,
              categories: plan.categories.map((cat) =>
                cat.id === category.id ? { ...cat, plmStatus: newStatus } : cat
              ),
            }
          : plan
      )
    );
  };

  const handleOpenEditCategoryTargetsModal = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setIsEditCategoryTargetsModalOpen(true);
  };

  const handleCloseEditCategoryTargetsModal = () => {
    setEditingCategoryId(null);
    setIsEditCategoryTargetsModalOpen(false);
  };

  const handleSaveCategoryTargets = (
    categoryId: string,
    updatedData: Partial<LinePlanCategory>
  ) => {
    setLinePlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === currentLinePlan?.id
          ? {
              ...plan,
              categories: plan.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      name: updatedData.name ?? cat.name,
                      targetVolume:
                        updatedData.targetVolume ?? cat.targetVolume,
                      targetMetrics: {
                        ...cat.targetMetrics,
                        ...(updatedData.targetMetrics || {}),
                        margin:
                          updatedData.targetMetrics?.margin ??
                          cat.targetMetrics?.margin,
                        revenue:
                          updatedData.targetMetrics?.revenue ??
                          cat.targetMetrics?.revenue,
                        sellThrough:
                          updatedData.targetMetrics?.sellThrough ??
                          cat.targetMetrics?.sellThrough,
                      },
                    }
                  : cat
              ),
            }
          : plan
      )
    );
    handleCloseEditCategoryTargetsModal();
  };

  const handleProgramStatusChange = (newStatus: PLMStatusStage) => {
    setLinePlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === currentLinePlan?.id
          ? { ...plan, plmStatus: newStatus }
          : plan
      )
    );
  };

  // Resize handling functions
  const handleResizeMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isResizingRef.current) return;

      console.log(
        "Mouse move",
        e.clientX,
        "isResizing:",
        isResizingRef.current
      );

      // Get the sidebar width
      const sidebarWidth = 288;

      // Calculate new width based on mouse position relative to sidebar
      const newWidth = Math.min(
        MAX_PANEL_WIDTH,
        Math.max(MIN_PANEL_WIDTH, e.clientX - sidebarWidth)
      );

      console.log(
        "New width:",
        newWidth,
        "clientX:",
        e.clientX,
        "sidebarWidth:",
        sidebarWidth
      );

      setTargetsPanelWidth(newWidth);
    },
    [MIN_PANEL_WIDTH, MAX_PANEL_WIDTH]
  );

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isResizingRef.current || e.touches.length === 0) return;

      const touch = e.touches[0];
      const sidebarWidth = 288;

      const newWidth = Math.min(
        MAX_PANEL_WIDTH,
        Math.max(MIN_PANEL_WIDTH, touch.clientX - sidebarWidth)
      );

      setTargetsPanelWidth(newWidth);
    },
    [MIN_PANEL_WIDTH, MAX_PANEL_WIDTH]
  );

  const handleResizeEnd = React.useCallback(() => {
    console.log("Resize end");
    isResizingRef.current = false;
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleResizeMove]);

  const handleTouchEnd = React.useCallback(() => {
    isResizingRef.current = false;
    setIsResizing(false);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.body.style.userSelect = "";
  }, [handleTouchMove]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Resize start", e.clientX);
    isResizingRef.current = true;
    setIsResizing(true);
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    console.log("Touch start");
    isResizingRef.current = true;
    setIsResizing(true);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    document.body.style.userSelect = "none";
  };

  // Cleanup resize listeners on unmount
  React.useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [handleResizeMove, handleResizeEnd, handleTouchMove, handleTouchEnd]);

  // Helper to group programs by status
  type ProgramStatus = "draft" | "archived" | string;
  type ProgramWithStatus = LinePlan & { status?: ProgramStatus };

  // Utility to get status from program (default to 'current' if not draft/archived)
  function getProgramStatus(plan: ProgramWithStatus): ProgramStatus {
    if (plan.plmStatus === PLMStatusStage.DRAFT) return "draft";
    if (plan.plmStatus === PLMStatusStage.LAUNCHED) return "archived";
    return "current";
  }

  const drafts: ProgramWithStatus[] = (linePlans as ProgramWithStatus[]).filter(
    (p: ProgramWithStatus) => getProgramStatus(p) === "draft"
  );
  const current: ProgramWithStatus[] = (
    linePlans as ProgramWithStatus[]
  ).filter((p: ProgramWithStatus) => getProgramStatus(p) === "current");
  const archived: ProgramWithStatus[] = (
    linePlans as ProgramWithStatus[]
  ).filter((p: ProgramWithStatus) => getProgramStatus(p) === "archived");

  const renderProgramSection = (
    programs: ProgramWithStatus[],
    sectionLabel: string
  ) => (
    <SidebarGroup>
      <SidebarGroupLabel>{sectionLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {programs.map((plan: ProgramWithStatus) => {
          const hasProjects = plan.categories && plan.categories.length > 0;
          return (
            <Collapsible
              key={plan.id}
              asChild
              defaultOpen={currentLinePlan?.id === plan.id}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={plan.name}
                    isActive={currentLinePlan?.id === plan.id}
                    onClick={() => setCurrentLinePlanId(plan.id)}
                    className="pl-4 flex items-center w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span>{plan.name}</span>
                    </div>
                    {hasProjects && (
                      <ChevronRight className="ml-2 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {hasProjects && (
                  <CollapsibleContent>
                    <SidebarMenu className="ml-6 border-l border-border">
                      {plan.categories.map((project: any) => (
                        <SidebarMenuItem key={project.id}>
                          <SidebarMenuButton
                            tooltip={project.name}
                            isActive={
                              categoryMetricView &&
                              (categoryMetricView as any).id === project.id
                            }
                            className="pl-4"
                          >
                            <Folder className="w-4 h-4" />
                            <span>{project.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={onAddCategory}
                          tooltip="Add Project"
                          className="pl-4"
                        >
                          <PlusIcon className="w-4 h-4" />
                          <span>Add Project</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );

  /**
   * MAIN RENDER: Shadcn Sidebar layout with program navigation and main content
   *
   * STRUCTURE:
   * 1. SidebarProvider: Wraps entire layout with sidebar context
   * 2. Sidebar: Program navigation and creation
   * 3. SidebarInset: Main content area (header bar + content area)
   */
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-x-hidden bg-background">
        <Sidebar collapsible="icon" variant="inset">
          <SidebarHeader>
            <div className="flex items-center gap-2 pl-4 pr-2">
              <span className="font-semibold text-lg">Line Planner</span>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* Add Program CTA at the top */}
            <div className="px-4 pt-4 pb-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleInitiateProgramCreation}
                className="w-full text-sm font-medium"
              >
                <PlusIcon className="h-4 h-4 mr-2" /> Add Program
              </Button>
            </div>
            {renderProgramSection(drafts, "Drafts")}
            {renderProgramSection(current, "Current")}
            {renderProgramSection(archived, "Archived")}
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-center w-full">
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="flex-1">
          {/* --- BEGIN: Program Overview Top Navigation Bar --- */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-6 py-3 gap-4">
            {/* Breadcrumbs */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="[&>svg]:w-3 [&>svg]:h-3" />
                <BreadcrumbItem>
                  {viewMode === "category" && selectedCategoryId ? (
                    <>
                      <BreadcrumbLink asChild>
                        <Link to="/">Program Overview</Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator className="[&>svg]:w-3 [&>svg]:h-3" />
                      <BreadcrumbPage>
                        {currentLinePlan?.categories.find(
                          (cat) => cat.id === selectedCategoryId
                        )?.name || "Category"}
                      </BreadcrumbPage>
                    </>
                  ) : viewMode === "composition" ? (
                    <>
                      <BreadcrumbLink asChild>
                        <Link to="/">Program Overview</Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator className="[&>svg]:w-3 [&>svg]:h-3" />
                      <BreadcrumbPage>Composition</BreadcrumbPage>
                    </>
                  ) : (
                    <BreadcrumbPage>Program Overview</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            {/* Layout toggle and actions */}
            <div className="flex items-center gap-2">
              {/* View/layout toggle */}
              <ToggleGroup
                type="single"
                value={currentLayout}
                onValueChange={(val) =>
                  val && setCurrentLayout(val as LayoutViewOption)
                }
                className="mr-2"
              >
                {LAYOUT_OPTIONS.map((opt) => (
                  <ToggleGroupItem
                    key={opt.value}
                    value={opt.value}
                    aria-label={opt.label}
                    className="h-8 w-8"
                  >
                    <opt.icon className="h-4 w-4" />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {/* Composition button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowComposition}
                className="h-8"
              >
                <BarChart2Icon className="h-4 w-4 mr-1" /> Composition
              </Button>
              {/* Create/Add button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCreateProgramForm(true)}
                className="h-8"
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Create
              </Button>
            </div>
          </div>
          {/* --- END: Program Overview Top Navigation Bar --- */}
          {/* --- BEGIN: Full dashboard content --- */}
          <div className="flex flex-col h-full">
            <div className="flex flex-1 overflow-hidden">
              {/* If creating a new program, show the three-column entry form */}
              {showCreateProgramForm ? (
                <div className="flex-1 h-full bg-muted/30 w-full">
                  <div className="h-full w-full relative">
                    <div className="h-full grid grid-cols-3 gap-0 w-full">
                      {/* LEFT PANEL – Program Basic Info */}
                      <div className="h-full bg-background border-r">
                        <div className="h-full flex flex-col">
                          <div className="p-6 border-b bg-background">
                            <div className="space-y-1">
                              <h1 className="text-xl font-semibold tracking-tight">
                                Basic Information
                              </h1>
                              <p className="text-sm text-muted-foreground">
                                Program name and season details
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 p-6 overflow-y-auto">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                  Program Details
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="programName">
                                    Program Name
                                  </Label>
                                  <Input
                                    id="programName"
                                    type="text"
                                    value={programName}
                                    onChange={(e) =>
                                      setProgramName(e.target.value)
                                    }
                                    placeholder="Enter program name"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="programSeason">Season</Label>
                                  <Input
                                    id="programSeason"
                                    type="text"
                                    value={programSeason}
                                    onChange={(e) =>
                                      setProgramSeason(e.target.value)
                                    }
                                    placeholder="e.g., Spring 2024"
                                    required
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </div>

                      {/* MIDDLE PANEL – Target Metrics */}
                      <div className="h-full bg-background border-r">
                        <div className="h-full flex flex-col">
                          <div className="p-6 border-b bg-background">
                            <div className="space-y-1">
                              <h1 className="text-xl font-semibold tracking-tight">
                                Target Metrics
                              </h1>
                              <p className="text-sm text-muted-foreground">
                                Set performance targets for this program
                              </p>
                            </div>
                          </div>

                          <div className="flex-1 p-6 overflow-y-auto">
                            <form
                              onSubmit={handleProgramFormSubmit}
                              className="space-y-6"
                            >
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">
                                    Financial Targets
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="targetMargin">
                                      Margin (%)
                                    </Label>
                                    <Input
                                      id="targetMargin"
                                      type="number"
                                      value={programTargetMargin}
                                      onChange={(e) =>
                                        setProgramTargetMargin(
                                          e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                        )
                                      }
                                      min={0}
                                      max={100}
                                      placeholder="60"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="targetSellThrough">
                                      Sell-Through (%)
                                    </Label>
                                    <Input
                                      id="targetSellThrough"
                                      type="number"
                                      value={programTargetSellThrough}
                                      onChange={(e) =>
                                        setProgramTargetSellThrough(
                                          e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                        )
                                      }
                                      min={0}
                                      max={100}
                                      placeholder="85"
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="targetRevenue">
                                      Revenue ($)
                                    </Label>
                                    <Input
                                      id="targetRevenue"
                                      type="number"
                                      value={programTargetRevenue}
                                      onChange={(e) =>
                                        setProgramTargetRevenue(
                                          e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                        )
                                      }
                                      min={0}
                                      placeholder="500,000"
                                      required
                                    />
                                  </div>
                                </CardContent>
                              </Card>

                              <div className="flex gap-3 pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleCancelCreateProgram}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                  Create Program
                                </Button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT PANEL – Projects */}
                      <div className="h-full bg-background">
                        <div className="h-full flex flex-col">
                          <div className="p-6 border-b bg-background">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <h1 className="text-xl font-semibold tracking-tight">
                                  Projects
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                  Add projects to organize your program
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addProjectField}
                                className="shrink-0"
                              >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Project
                              </Button>
                            </div>
                          </div>

                          <div className="flex-1 p-6 overflow-y-auto">
                            <div className="space-y-4">
                              {projects.map((project, idx) => (
                                <Card key={idx}>
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base">
                                        Project {idx + 1}
                                      </CardTitle>
                                      {projects.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeProjectField(idx)
                                          }
                                          className="text-destructive hover:text-destructive shrink-0"
                                        >
                                          Remove
                                        </Button>
                                      )}
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor={`projectName-${idx}`}>
                                        Project Name
                                      </Label>
                                      <Input
                                        id={`projectName-${idx}`}
                                        type="text"
                                        placeholder="Enter project name"
                                        value={project.name}
                                        onChange={(e) =>
                                          handleProjectDetailChange(
                                            idx,
                                            "name",
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label htmlFor={`targetVolume-${idx}`}>
                                          Volume
                                        </Label>
                                        <Input
                                          id={`targetVolume-${idx}`}
                                          type="number"
                                          placeholder="1,000"
                                          value={project.targetVolume}
                                          onChange={(e) =>
                                            handleProjectDetailChange(
                                              idx,
                                              "targetVolume",
                                              e.target.value
                                            )
                                          }
                                          min={0}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`targetRevenue-${idx}`}>
                                          Revenue ($)
                                        </Label>
                                        <Input
                                          id={`targetRevenue-${idx}`}
                                          type="number"
                                          placeholder="100,000"
                                          value={project.targetRevenue}
                                          onChange={(e) =>
                                            handleProjectDetailChange(
                                              idx,
                                              "targetRevenue",
                                              e.target.value
                                            )
                                          }
                                          min={0}
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="space-y-2">
                                        <Label htmlFor={`targetMargin-${idx}`}>
                                          Margin (%)
                                        </Label>
                                        <Input
                                          id={`targetMargin-${idx}`}
                                          type="number"
                                          placeholder="60"
                                          value={project.targetMargin}
                                          onChange={(e) =>
                                            handleProjectDetailChange(
                                              idx,
                                              "targetMargin",
                                              e.target.value
                                            )
                                          }
                                          min={0}
                                          max={100}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label
                                          htmlFor={`targetSellThrough-${idx}`}
                                        >
                                          Sell-Through (%)
                                        </Label>
                                        <Input
                                          id={`targetSellThrough-${idx}`}
                                          type="number"
                                          placeholder="85"
                                          value={project.targetSellThrough}
                                          onChange={(e) =>
                                            handleProjectDetailChange(
                                              idx,
                                              "targetSellThrough",
                                              e.target.value
                                            )
                                          }
                                          min={0}
                                          max={100}
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}

                              {projects.length === 0 && (
                                <div className="text-center py-12">
                                  <p className="text-sm text-muted-foreground mb-4">
                                    No projects added yet
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addProjectField}
                                  >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add First Project
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Default dashboard view
                <>
                  {/* Targets panel */}
                  <section
                    className="bg-card border-r border-border overflow-y-auto styled-scrollbar flex-shrink-0"
                    style={{ width: targetsPanelWidth + "px" }}
                  >
                    {renderTargetsSectionContent(currentLayout)}
                  </section>
                  {/* Main grid/list area */}
                  <div className="flex-1 overflow-y-auto styled-scrollbar">
                    {renderProductLinesSectionContent(currentLayout)}
                  </div>
                </>
              )}
            </div>
          </div>
          {/* --- END: Full dashboard content --- */}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProgramOverviewPage;
