import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LinePlan,
  GlobalMetricViewOption,
  CategoryMetricViewOption,
  PLMStatusStage,
  LinePlanCategory,
  ProjectCreationInput,
} from "@/types";
import { LayoutViewOption } from "@/types/layout";
import {
  CurrencyDollarIcon,
  ScaleIcon,
  PercentIcon,
  CollectionIcon,
  PackageIcon,
  ChevronRightIcon as ChevronRight,
} from "../components";

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
  LayoutDashboard as LayoutDashboardIcon,
  List as ListIcon,
  Columns as ColumnsIcon,
  Plus as PlusIcon,
  BarChart2 as BarChart2Icon,
  Folder,
  Settings,
  Menu,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  MetricBulletCard,
  ProductLineCategoryCard,
  AddCategoryModal,
  EditProgramTargetsModal,
  CategoryTargetsModal,
  AddOptionsPopover,
  FilterState,
} from "../components";
import { CompactListView } from "../components/views/CompactListView";
import { ProgramSidebar } from "../components/ProgramSidebar";
import {
  loadUIPreferences,
  saveUIPreference,
  saveUIPreferences,
  saveLinePlans,
  saveCurrentLinePlanId,
} from "../utils/localStorage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProgramWideView } from "../components/views/ProgramWideView";
import { Separator } from "@/components/ui/separator";
import CompositionView from "../components/views/CompositionView";
import { CategoryDetailView } from "../components/views/CategoryDetailView";

type ViewMode = "overview" | "category" | "composition";

const LAYOUT_OPTIONS: {
  value: LayoutViewOption;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { value: "compactList", label: "Compact List", icon: ListIcon },
  { value: "standard", label: "Standard Dashboard", icon: LayoutDashboardIcon },
  { value: "wideView", label: "Wide View (Horizontal)", icon: ColumnsIcon },
];

type ActiveTargetFilterType = "revenue" | "margin" | "sellin" | "sellthrough";
interface ActiveTargetFilter {
  type: ActiveTargetFilterType;
  displayName: string;
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
  const [currentLayout, setCurrentLayout] = useState<LayoutViewOption>(() => {
    const savedLayout = uiPreferences.currentLayout;
    return savedLayout &&
      LAYOUT_OPTIONS.some((opt) => opt.value === savedLayout)
      ? savedLayout
      : "compactList";
  });

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

  // VIEW STATE: Current view mode (overview/category/composition)
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // MODAL STATES: Various modal dialog visibility states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditTargetsModalOpen, setIsEditTargetsModalOpen] = useState(false);
  const [isEditCategoryTargetsModalOpen, setIsEditCategoryTargetsModalOpen] =
    useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );

  // POPOVER STATE: Add options dropdown menu
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(
    null
  ) as React.MutableRefObject<HTMLButtonElement>;

  // FILTER STATE: Composition view filters with localStorage persistence
  const [filters, setFilters] = useState<FilterState>(() => {
    const savedFilters = localStorage.getItem("compositionFilters");
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (e) {
        console.error("Error parsing saved filters:", e);
      }
    }
    return {
      categories: [],
      excludeCategories: [],
      tags: [],
      excludeTags: [],
      priceRange: { min: 0, max: 1000 },
      marginRange: { min: 0, max: 100 },
      status: [],
    };
  });

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem("compositionFilters", JSON.stringify(filters));
  }, [filters]);

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

  // Add state at the top-level of the component
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMetricsPanelCollapsed, setIsMetricsPanelCollapsed] =
    React.useState(false);

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

  const handleBackToOverview = () => {
    setSelectedCategoryId(null);

    setViewMode("overview");
  };

  const handleShowComposition = () => {
    if (!currentLinePlan) {
      return;
    }
    setViewMode(viewMode === "composition" ? "overview" : "composition");
    setSelectedCategoryId(null);
  };

  const openCatalogueModal = () => setIsAddCategoryModalOpen(true);

  const handleAddPlaceholder = (categoryId: string) => {
    navigate(`/category/${categoryId}?action=add&type=placeholder`);
  };

  const renderTargetsSectionContent = () => {
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

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 space-y-3">
          <MetricBulletCard
            title="Revenue"
            target={(currentLinePlan?.targetOverallRevenue ?? 0) / 1000000}
            current={overallProjectedRevenue}
            unit="$M"
            icon={<CurrencyDollarIcon className="w-4 h-4" />}
          />
          <MetricBulletCard
            title="Margin"
            target={(currentLinePlan?.targetOverallMargin ?? 0) * 100}
            current={overallAchievedMargin * 100}
            unit="%"
            icon={<ScaleIcon className="w-4 h-4" />}
          />
          <MetricBulletCard
            title="Sell-In"
            target={sellInTarget}
            current={sellInProjected}
            unit="units"
            icon={<PackageIcon className="w-4 h-4" />}
          />
          <MetricBulletCard
            title="Sell-Through"
            target={(currentLinePlan?.targetOverallSellThrough ?? 0) * 100}
            current={sellThroughProjected}
            unit="%"
            icon={<PercentIcon className="w-4 h-4" />}
          />
        </div>
      </div>
    );
  };

  const renderProductLinesSectionContent = (layout: LayoutViewOption) => {
    if (!currentLinePlan) return null;

    if (layout === "compactList") {
      return (
        <CompactListView
          categories={currentLinePlan.categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          onSelectStyle={handleSelectStyle}
          activeTargetFilter={activeTargetFilter?.type || null}
          targetOverallMargin={currentLinePlan.targetOverallMargin}
          onStatusChange={handleCategoryStatusChange}
          onBackToCategories={handleBackToOverview}
        />
      );
    }

    if (layout === "wideView") {
      return (
        <ProgramWideView
          categories={currentLinePlan.categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          onSelectStyle={handleSelectStyle}
          activeTargetFilter={activeTargetFilter?.type || null}
          targetOverallMargin={currentLinePlan.targetOverallMargin}
          onStatusChange={handleCategoryStatusChange}
          onBackToCategories={handleBackToOverview}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start auto-rows-auto">
        {(currentLinePlan.categories || []).map((category) => (
          <ProductLineCategoryCard
            key={category.id}
            category={category}
            onSelectCategory={handleSelectCategory}
            onAddNewStyle={handleAddNewStyleToCategory}
            activeTargetFilter={activeTargetFilter?.type || null}
            targetOverallMargin={currentLinePlan?.targetOverallMargin ?? 0}
            displayMode="grid"
            metricViewStyle={categoryMetricView}
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

  const handleSelectCategory = (category: LinePlanCategory) => {
    setSelectedCategoryId(category.id);
    if (currentLayout !== "compactList") {
      setViewMode("category");
    }
  };

  const handleSelectStyle = () => {
    // Style selection logic if needed
  };

  const handleAddNewStyleToCategory = (category: LinePlanCategory) => {
    navigate(`/category/${category.id}?action=add`);
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

  const handleCloseEditTargetsModal = () => {
    setIsEditTargetsModalOpen(false);
  };

  useEffect(() => {
    // Initialize values when currentLinePlan changes
  }, [currentLinePlan]);

  const handleReset = () => {
    // Reset all filters
    setFilters({
      categories: [],
      excludeCategories: [],
      tags: [],
      excludeTags: [],
      priceRange: { min: 0, max: 1000 },
      marginRange: { min: 0, max: 100 },
      status: [],
    });

    // Reset view states
    setSelectedCategoryId(null);
    setViewMode("overview");
    setCurrentLayout("compactList");
    setActiveTargetFilter(null);

    // Reset panel states
    setIsMetricsPanelCollapsed(false);
    setIsCollapsed(false);

    // Reset modal states
    setIsAddCategoryModalOpen(false);
    setIsEditTargetsModalOpen(false);
    setIsEditCategoryTargetsModalOpen(false);
    setEditingCategoryId(null);
    setIsAddPopoverOpen(false);

    // Clear local storage UI preferences
    saveUIPreferences({});

    // Clear all line plans and current line plan ID
    saveLinePlans([]);
    saveCurrentLinePlanId("");
    setLinePlans([]);
    setCurrentLinePlanId("");
  };

  return (
    <div className="flex h-screen w-full overflow-x-hidden bg-background">
      <div className="flex flex-col w-full">
        {/* Header */}
        <header className="h-14 border-b bg-background px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-md font-semibold">Line Planner</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <ProgramSidebar
            onInitiateProgramCreation={handleInitiateProgramCreation}
            drafts={drafts}
            current={current}
            archived={archived}
            onProgramSelect={setCurrentLinePlanId}
            currentLinePlanId={currentLinePlan?.id || null}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Content Area */}
          <div className="flex flex-col h-full flex-1 overflow-hidden">
            {/* Toolbar */}
            <nav className="border-b bg-background pr-6">
              <div className="flex items-center justify-between">
                {/* Left Side - Navigation */}
                <div className="flex items-center">
                  <div className="flex items-center p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-slate-100 flex-shrink-0"
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      aria-label={
                        isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                      }
                    >
                      {isCollapsed ? (
                        <ChevronsRight className="h-4 w-4" />
                      ) : (
                        <ChevronsLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <Separator
                    orientation="vertical"
                    className="h-12 w-[1px] bg-border"
                  />

                  <Breadcrumb className="pl-4">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={() => {
                            setViewMode("overview");
                            setSelectedCategoryId(null);
                          }}
                          className="text-slate-500 hover:text-slate-700"
                        >
                          Programs
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {viewMode === "composition" ? (
                          <>
                            <BreadcrumbLink
                              onClick={() => {
                                setViewMode("overview");
                                setSelectedCategoryId(null);
                              }}
                              className="text-slate-500 hover:text-slate-700"
                            >
                              {currentLinePlan?.name}
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                            <BreadcrumbPage>Composition View</BreadcrumbPage>
                          </>
                        ) : selectedCategoryId ? (
                          <>
                            <BreadcrumbLink
                              onClick={() => setSelectedCategoryId(null)}
                              className="text-slate-500 hover:text-slate-700"
                            >
                              {currentLinePlan?.name}
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                            <BreadcrumbPage>
                              {currentLinePlan?.categories.find(
                                (c) => c.id === selectedCategoryId
                              )?.name || "Category"}
                            </BreadcrumbPage>
                          </>
                        ) : (
                          <BreadcrumbPage>
                            {currentLinePlan?.name}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowComposition}
                    className={cn(
                      "transition-colors",
                      viewMode === "composition" &&
                        "bg-blue-100 hover:bg-blue-200"
                    )}
                  >
                    <BarChart2Icon className="w-4 h-4 mr-2" />
                    Composition
                  </Button>

                  <ToggleGroup
                    type="single"
                    value={currentLayout}
                    onValueChange={(value) =>
                      value && setCurrentLayout(value as LayoutViewOption)
                    }
                  >
                    {LAYOUT_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        size="sm"
                        title={option.label}
                        className={cn(
                          currentLayout === option.value && "bg-blue-100",
                          "hover:bg-slate-100"
                        )}
                      >
                        <option.icon className="w-4 h-4" />
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsAddCategoryModalOpen(true)}
                      >
                        <Folder className="w-4 h-4 mr-2" />
                        Add Category
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openCatalogueModal}>
                        <PackageIcon className="w-4 h-4 mr-2" />
                        Add from Catalogue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
              {showCreateProgramForm ? (
                <div className="flex-1 h-full bg-muted/30 w-full ">
                  <div className="h-full w-full relative ">
                    <div className="h-full grid grid-cols-3 gap-0 w-full">
                      {/* MIDDLE PANEL – Target Metrics */}
                      <div className="h-full bg-background border-r ">
                        <div className="h-full flex flex-col">
                          <div className="p-6 border-b bg-background">
                            <div className="space-y-1">
                              <h1 className="text-xl font-semibold tracking-tight">
                                Program Details
                              </h1>
                              <p className="text-sm text-muted-foreground">
                                Configure program information and targets
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
                                    Basic Information
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
                                    <Label htmlFor="programSeason">
                                      Season
                                    </Label>
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

                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">
                                    Target Metrics
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
                      <div className="h-full bg-background ">
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
                <>
                  <div className="flex-1 overflow-y-auto styled-scrollbar bg-slate-50">
                    <div className="flex gap-5 p-5">
                      <div className="flex-1">
                        <div className="space-y-5">
                          {viewMode === "composition" ? (
                            currentLinePlan ? (
                              <CompositionView
                                linePlan={currentLinePlan}
                                onBack={handleBackToOverview}
                                onProductClick={(projectId) => {
                                  setSelectedCategoryId(projectId);
                                  // Handle product selection if needed
                                }}
                                filters={filters}
                                onFiltersChange={setFilters}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-slate-500">
                                  No line plan selected
                                </p>
                              </div>
                            )
                          ) : viewMode === "category" &&
                            selectedCategoryId &&
                            currentLinePlan ? (
                            <CategoryDetailView
                              category={
                                currentLinePlan.categories.find(
                                  (c) => c.id === selectedCategoryId
                                )!
                              }
                              onUpdateStyle={(categoryId, style) => {
                                setLinePlans((prevPlans) =>
                                  prevPlans.map((plan) =>
                                    plan.id === currentLinePlan.id
                                      ? {
                                          ...plan,
                                          categories: plan.categories.map(
                                            (cat) =>
                                              cat.id === categoryId
                                                ? {
                                                    ...cat,
                                                    plannedStyles:
                                                      cat.plannedStyles.map(
                                                        (s) =>
                                                          s.id === style.id
                                                            ? style
                                                            : s
                                                      ),
                                                  }
                                                : cat
                                          ),
                                        }
                                      : plan
                                  )
                                );
                              }}
                              onAddStyle={(categoryId, style) => {
                                setLinePlans((prevPlans) =>
                                  prevPlans.map((plan) =>
                                    plan.id === currentLinePlan.id
                                      ? {
                                          ...plan,
                                          categories: plan.categories.map(
                                            (cat) =>
                                              cat.id === categoryId
                                                ? {
                                                    ...cat,
                                                    plannedStyles: [
                                                      ...cat.plannedStyles,
                                                      style,
                                                    ],
                                                  }
                                                : cat
                                          ),
                                        }
                                      : plan
                                  )
                                );
                              }}
                              currentLayout={currentLayout}
                              programName={currentLinePlan.name}
                            />
                          ) : (
                            renderProductLinesSectionContent(currentLayout)
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "bg-card rounded-lg border transition-all duration-200",
                          isMetricsPanelCollapsed ? "w-[60px]" : "w-[280px]"
                        )}
                      >
                        <div
                          className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-accent/50"
                          onClick={() =>
                            setIsMetricsPanelCollapsed(!isMetricsPanelCollapsed)
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Settings className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div
                              className={cn(
                                "flex items-center gap-2",
                                isMetricsPanelCollapsed && "hidden"
                              )}
                            >
                              <span className="text-sm font-medium truncate">
                                Target Metrics
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditTargetsModalOpen(true)}
                                className="h-7 px-2 text-xs"
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                          <ChevronRight
                            className={cn(
                              "w-4 h-4 transition-transform",
                              !isMetricsPanelCollapsed && "rotate-180"
                            )}
                          />
                        </div>
                        {isMetricsPanelCollapsed
                          ? (() => {
                              // Calculations for metrics
                              const sellInProjected = (
                                currentLinePlan?.categories || []
                              ).reduce((sum, cat) => {
                                const stylesCount =
                                  (cat.plannedStyles || []).length || 1;
                                const volumePerStyle =
                                  cat.targetVolume / stylesCount;
                                return (
                                  sum +
                                  (cat.plannedStyles || []).reduce(
                                    (styleSum, style) =>
                                      styleSum +
                                      (style.projectedSellIn || volumePerStyle),
                                    0
                                  )
                                );
                              }, 0);
                              const sellInTarget = (
                                currentLinePlan?.categories || []
                              ).reduce((sum, cat) => sum + cat.targetVolume, 0);
                              const sellThroughProjected = (() => {
                                if (!currentLinePlan?.categories) return 0;
                                let totalProjectedSellThroughUnits = 0;
                                let totalBaseUnits = 0;
                                (currentLinePlan.categories || []).forEach(
                                  (cat) => {
                                    const stylesCount =
                                      (cat.plannedStyles || []).length || 1;
                                    const volumePerStyle =
                                      cat.targetVolume / stylesCount;
                                    (cat.plannedStyles || []).forEach(
                                      (style) => {
                                        const baseVolume =
                                          style.projectedSellIn ||
                                          volumePerStyle;
                                        totalBaseUnits += baseVolume;
                                        totalProjectedSellThroughUnits +=
                                          (style.projectedSellThrough ?? 0.8) *
                                          baseVolume;
                                      }
                                    );
                                  }
                                );
                                return totalBaseUnits > 0
                                  ? (totalProjectedSellThroughUnits /
                                      totalBaseUnits) *
                                      100
                                  : 0;
                              })();

                              return (
                                <div className="p-2 space-y-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="p-2 rounded-md hover:bg-accent/50 cursor-pointer flex items-center justify-center relative">
                                          <CurrencyDollarIcon className="w-4 h-4 text-muted-foreground" />
                                          <div
                                            className={cn(
                                              "absolute bottom-0 right-0 w-2 h-2 rounded-full",
                                              overallProjectedRevenue >=
                                                (currentLinePlan?.targetOverallRevenue ??
                                                  0) /
                                                  1000000
                                                ? "bg-green-500"
                                                : overallProjectedRevenue >=
                                                  ((currentLinePlan?.targetOverallRevenue ??
                                                    0) /
                                                    1000000) *
                                                    0.9
                                                ? "bg-orange-500"
                                                : "bg-red-500"
                                            )}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">Revenue</p>
                                        <p className="text-sm">
                                          Target: $
                                          {(currentLinePlan?.targetOverallRevenue ??
                                            0) / 1000000}
                                          M
                                        </p>
                                        <p className="text-sm">
                                          Current: ${overallProjectedRevenue}M
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="p-2 rounded-md hover:bg-accent/50 cursor-pointer flex items-center justify-center relative">
                                          <ScaleIcon className="w-4 h-4 text-muted-foreground" />
                                          <div
                                            className={cn(
                                              "absolute bottom-0 right-0 w-2 h-2 rounded-full",
                                              overallAchievedMargin >=
                                                (currentLinePlan?.targetOverallMargin ??
                                                  0)
                                                ? "bg-green-500"
                                                : overallAchievedMargin >=
                                                  (currentLinePlan?.targetOverallMargin ??
                                                    0) *
                                                    0.9
                                                ? "bg-orange-500"
                                                : "bg-red-500"
                                            )}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">Margin</p>
                                        <p className="text-sm">
                                          Target:{" "}
                                          {(currentLinePlan?.targetOverallMargin ??
                                            0) * 100}
                                          %
                                        </p>
                                        <p className="text-sm">
                                          Current:{" "}
                                          {(
                                            overallAchievedMargin * 100
                                          ).toFixed(1)}
                                          %
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="p-2 rounded-md hover:bg-accent/50 cursor-pointer flex items-center justify-center relative">
                                          <PackageIcon className="w-4 h-4 text-muted-foreground" />
                                          <div
                                            className={cn(
                                              "absolute bottom-0 right-0 w-2 h-2 rounded-full",
                                              sellInProjected >= sellInTarget
                                                ? "bg-green-500"
                                                : sellInProjected >=
                                                  sellInTarget * 0.9
                                                ? "bg-orange-500"
                                                : "bg-red-500"
                                            )}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">Sell-In</p>
                                        <p className="text-sm">
                                          Target: {sellInTarget} units
                                        </p>
                                        <p className="text-sm">
                                          Current: {sellInProjected} units
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="p-2 rounded-md hover:bg-accent/50 cursor-pointer flex items-center justify-center relative">
                                          <PercentIcon className="w-4 h-4 text-muted-foreground" />
                                          <div
                                            className={cn(
                                              "absolute bottom-0 right-0 w-2 h-2 rounded-full",
                                              sellThroughProjected >=
                                                (currentLinePlan?.targetOverallSellThrough ??
                                                  0) *
                                                  100
                                                ? "bg-green-500"
                                                : sellThroughProjected >=
                                                  (currentLinePlan?.targetOverallSellThrough ??
                                                    0) *
                                                    90
                                                ? "bg-orange-500"
                                                : "bg-red-500"
                                            )}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">
                                          Sell-Through
                                        </p>
                                        <p className="text-sm">
                                          Target:{" "}
                                          {(currentLinePlan?.targetOverallSellThrough ??
                                            0) * 100}
                                          %
                                        </p>
                                        <p className="text-sm">
                                          Current:{" "}
                                          {sellThroughProjected.toFixed(1)}%
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              );
                            })()
                          : renderTargetsSectionContent()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={() => {
          onAddCategory();
          setIsAddCategoryModalOpen(false);
        }}
      />

      {/* Edit Program Targets Modal */}
      {currentLinePlan && (
        <EditProgramTargetsModal
          isOpen={isEditTargetsModalOpen}
          onClose={handleCloseEditTargetsModal}
          currentLinePlan={currentLinePlan}
          onUpdateTargets={onUpdateTargets}
        />
      )}

      {/* Category Targets Modal */}
      {editingCategoryId && currentLinePlan && (
        <CategoryTargetsModal
          isOpen={isEditCategoryTargetsModalOpen}
          onClose={handleCloseEditCategoryTargetsModal}
          initialValues={currentLinePlan.categories.find(
            (cat) => cat.id === editingCategoryId
          )}
          onSave={(updatedData) =>
            handleSaveCategoryTargets(editingCategoryId, updatedData)
          }
        />
      )}

      {/* Add Options Popover */}
      <AddOptionsPopover
        isOpen={isAddPopoverOpen}
        onClose={() => setIsAddPopoverOpen(false)}
        anchorRef={addButtonRef}
        onAddCategory={() => setIsAddCategoryModalOpen(true)}
        onAddCarryover={openCatalogueModal}
        onAddPlaceholder={() => {
          if (selectedCategoryId) {
            handleAddPlaceholder(selectedCategoryId);
          }
        }}
      />
    </div>
  );
};

export default ProgramOverviewPage;
