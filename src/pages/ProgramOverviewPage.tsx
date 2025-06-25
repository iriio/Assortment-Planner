import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LinePlan,
  GlobalMetricViewOption,
  CategoryMetricViewOption,
  PLMStatusStage,
  LinePlanCategory,
  ProjectCreationInput,
  ProductCatalogueItem,
  PlannedStyle,
  Product,
} from "@/types";
import { LayoutViewOption } from "@/types/layout";
import {
  CurrencyDollarIcon,
  ScaleIcon,
  PercentIcon,
  CollectionIcon,
  PackageIcon,
  ChevronRightIcon as ChevronRight,
  FunnelIcon,
  XMarkIcon,
} from "../components";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import CompositionPanelView from "../components/views/CompositionPanelView";
import { CategoryDetailView } from "../components/views/CategoryDetailView";
import CatalogueModal from "../components/modals/CatalogueModal";

import { productCatalogueData } from "@/data";
import {
  getMetricValue,
  getProductMetricValue,
} from "@/utils/metricCalculations";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Modal from "../components/modals/Modal";
import { productTagsData } from "@/data";
import { ProductTag } from "@/types";

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

  // LAYOUT STATE: Current view layout (grid, list, etc.)
  const [currentLayout, setCurrentLayout] =
    useState<LayoutViewOption>("compactList");

  // FORM STATE: Program creation form visibility
  const [showCreateProgramForm, setShowCreateProgramForm] = useState<boolean>(
    !currentLinePlan && linePlans.length === 0
  );

  // FILTER STATE: Active target performance filter
  const [activeTargetFilter] = useState<ActiveTargetFilter | null>(null);

  // METRIC HIGHLIGHTING STATE: Track which metric is selected for highlighting categories
  const [selectedMetricForHighlighting, setSelectedMetricForHighlighting] =
    useState<"revenue" | "margin" | "sell-in" | "sell-through" | null>(null);

  // NAVIGATION STATE: Current selected category and product for drill-down navigation
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  // VIEW STATE: Current view mode (overview/category/composition)
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  // Determine if we're at project level
  const isProjectLevel = selectedCategoryId !== null;

  // MODAL STATES: Various modal dialog visibility states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);
  const [isEditTargetsModalOpen, setIsEditTargetsModalOpen] = useState(false);
  const [isEditCategoryTargetsModalOpen, setIsEditCategoryTargetsModalOpen] =
    useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  // POPOVER STATE: Add options dropdown menu
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(
    null
  ) as React.MutableRefObject<HTMLButtonElement>;

  // FILTER STATE: Composition view filters with default values
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    excludeCategories: [],
    tags: [],
    excludeTags: [],
    priceRange: { min: 0, max: 1000 },
    marginRange: { min: 0, max: 100 },
    status: [],
  });

  // Search state for filter modal
  const [tagSearch, setTagSearch] = useState("");

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

  // Filter products based on current filters
  const filteredCategories = useMemo(() => {
    if (!currentLinePlan?.categories) return [];

    return currentLinePlan.categories
      .map((category) => {
        // Filter products within the category
        const filteredProducts = category.plannedStyles.filter((product) => {
          // Get all unique tags from the product
          const productTags = new Set(product.tags || []);

          // Include tags filter - product must have all matching tags
          if (filters.tags.length > 0) {
            const hasAllMatchingTags = filters.tags.every((tag) =>
              productTags.has(tag)
            );
            if (!hasAllMatchingTags) return false;
          }

          // Exclude tags filter - product must not have any excluded tags
          if (filters.excludeTags.length > 0) {
            const hasExcludedTag = filters.excludeTags.some((tag) =>
              productTags.has(tag)
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
          if (
            product.margin < filters.marginRange.min ||
            product.margin > filters.marginRange.max
          ) {
            return false;
          }

          // Status filter
          if (
            filters.status.length > 0 &&
            !filters.status.includes(product.plmStatus)
          ) {
            return false;
          }

          return true;
        });

        // Return a new category object with filtered products
        return {
          ...category,
          plannedStyles: filteredProducts,
        };
      })
      .filter((category) => {
        // Only keep categories that have products after filtering
        return category.plannedStyles.length > 0;
      });
  }, [currentLinePlan, filters]);

  // Filter the displayed categories based on the current filters

  // Get filtered tags based on search
  const filteredTagsByCategory = useMemo(() => {
    if (!tagSearch) return tagsByCategory;

    const searchLower = tagSearch.toLowerCase();
    return Object.entries(tagsByCategory).reduce((acc, [category, tags]) => {
      const filteredTags = tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchLower) ||
          tag.category.toLowerCase().includes(searchLower)
      );
      if (filteredTags.length > 0) {
        acc[category] = filteredTags;
      }
      return acc;
    }, {} as Record<string, ProductTag[]>);
  }, [tagsByCategory, tagSearch]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return filters.tags.length + filters.excludeTags.length;
  }, [filters]);

  // Save filters to sessionStorage when they change
  useEffect(() => {
    sessionStorage.setItem("compositionFilters", JSON.stringify(filters));
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
  const [panelView, setPanelView] = React.useState<"metrics" | "composition">(
    "metrics"
  );

  const overallProjectedRevenue = useMemo(() => {
    if (!currentLinePlan?.categories) return 0;

    if (isProjectLevel && selectedCategoryId) {
      const selectedCategory = currentLinePlan.categories.find(
        (cat) => cat.id === selectedCategoryId
      );
      if (!selectedCategory) return 0;

      return (
        selectedCategory.plannedStyles.reduce(
          (sum, style) =>
            sum +
            style.sellingPrice *
              (selectedCategory.targetVolume /
                (selectedCategory.plannedStyles.length || 1)),
          0
        ) / 1000000
      );
    }

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
  }, [currentLinePlan?.categories, isProjectLevel, selectedCategoryId]);

  const overallAchievedMargin = useMemo(() => {
    if (!currentLinePlan?.categories) return 0;

    if (isProjectLevel && selectedCategoryId) {
      const selectedCategory = currentLinePlan.categories.find(
        (cat) => cat.id === selectedCategoryId
      );
      if (!selectedCategory) return 0;

      let totalRevenue = 0;
      let totalCost = 0;
      selectedCategory.plannedStyles.forEach((style) => {
        const styleVolume =
          selectedCategory.targetVolume /
          (selectedCategory.plannedStyles.length || 1);
        totalRevenue += style.sellingPrice * styleVolume;
        totalCost += style.costPrice * styleVolume;
      });
      return totalRevenue === 0 ? 0 : (totalRevenue - totalCost) / totalRevenue;
    }

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
  }, [currentLinePlan?.categories, isProjectLevel, selectedCategoryId]);

  // Calculate sell-in metrics at component level
  const sellInMetrics = useMemo(() => {
    if (!currentLinePlan) return { projected: 0, target: 0 };

    const selectedCategory = isProjectLevel
      ? currentLinePlan.categories.find((cat) => cat.id === selectedCategoryId)
      : null;

    if (isProjectLevel && selectedCategory) {
      const stylesCount = (selectedCategory.plannedStyles || []).length || 1;
      const volumePerStyle = selectedCategory.targetVolume / stylesCount;
      const projected = (selectedCategory.plannedStyles || []).reduce(
        (sum, style) => sum + (style.projectedSellIn || volumePerStyle),
        0
      );
      return { projected, target: selectedCategory.targetVolume };
    }

    const projected = (currentLinePlan?.categories || []).reduce((sum, cat) => {
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
    }, 0);

    const target = (currentLinePlan?.categories || []).reduce(
      (sum, cat) => sum + cat.targetVolume,
      0
    );

    return { projected, target };
  }, [currentLinePlan, isProjectLevel, selectedCategoryId]);

  // Calculate sell-through metrics at component level
  const sellThroughMetrics = useMemo(() => {
    if (!currentLinePlan) return { projected: 0, target: 0 };

    const selectedCategory = isProjectLevel
      ? currentLinePlan.categories.find((cat) => cat.id === selectedCategoryId)
      : null;

    if (isProjectLevel && selectedCategory) {
      const styles = selectedCategory.plannedStyles;
      if (styles.length === 0)
        return {
          projected: 0,
          target: (currentLinePlan.targetOverallSellThrough || 0) * 100,
        };
      let totalProjectedSellThroughUnits = 0;
      let totalBaseUnits = 0;
      const volumePerStyle = selectedCategory.targetVolume / styles.length;
      styles.forEach((style) => {
        const baseVolume = style.projectedSellIn || volumePerStyle;
        totalBaseUnits += baseVolume;
        totalProjectedSellThroughUnits +=
          (style.projectedSellThrough ?? 0.8) * baseVolume;
      });
      const projected =
        totalBaseUnits > 0
          ? (totalProjectedSellThroughUnits / totalBaseUnits) * 100
          : 0;
      return {
        projected,
        target: (currentLinePlan.targetOverallSellThrough || 0) * 100,
      };
    }

    if (!currentLinePlan?.categories)
      return {
        projected: 0,
        target: (currentLinePlan.targetOverallSellThrough || 0) * 100,
      };
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
    const projected =
      totalBaseUnits > 0
        ? (totalProjectedSellThroughUnits / totalBaseUnits) * 100
        : 0;
    const target = (currentLinePlan.targetOverallSellThrough || 0) * 100;
    return { projected, target };
  }, [currentLinePlan, isProjectLevel, selectedCategoryId]);

  const handleBackToOverview = () => {
    setSelectedCategoryId(null);
    setSelectedProductId(null);
    setViewMode("overview");
  };

  const openCatalogueModal = () => setIsCatalogueModalOpen(true);

  const handleAddCatalogueItem = (item: ProductCatalogueItem) => {
    console.log("Adding catalogue item:", item);
    setIsCatalogueModalOpen(false);
  };

  // Function to determine if a category is a poor performer for the selected metric
  const getPerformanceStatus = (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ): "excellent" | "good" | "near" | "poor" | null => {
    if (!currentLinePlan) return null;

    const avgCategoryMargin =
      category.plannedStyles.length > 0
        ? category.plannedStyles.reduce((acc, style) => acc + style.margin, 0) /
          category.plannedStyles.length
        : 0;

    const totalRevenue = category.plannedStyles.reduce(
      (sum, style) =>
        sum +
        style.sellingPrice *
          (category.targetVolume / (category.plannedStyles.length || 1)),
      0
    );

    // Calculate weighted sell-through (consistent with sidebar and card)
    let totalProjectedSellThroughUnits = 0;
    let totalBaseUnits = 0;
    const volumePerStyle =
      category.targetVolume / (category.plannedStyles.length || 1);

    category.plannedStyles.forEach((style) => {
      const baseVolume = style.projectedSellIn || volumePerStyle;
      totalBaseUnits += baseVolume;
      totalProjectedSellThroughUnits +=
        (style.projectedSellThrough ?? 0.8) * baseVolume;
    });

    const avgSellThrough =
      totalBaseUnits > 0 ? totalProjectedSellThroughUnits / totalBaseUnits : 0;

    // Calculate consistent sell-in (matching cards)
    const totalProjectedSellIn = category.plannedStyles.reduce(
      (sum, style) => sum + (style.projectedSellIn || volumePerStyle),
      0
    );

    switch (metricType) {
      case "revenue":
        // Use category-specific target or fall back to program target
        const revenueTarget =
          category.targetMetrics?.revenue ||
          currentLinePlan.targetOverallRevenue /
            currentLinePlan.categories.length;

        if (totalRevenue >= revenueTarget * 1.15) return "excellent"; // 15%+ above target
        if (totalRevenue >= revenueTarget) return "good"; // At or above target
        if (totalRevenue >= revenueTarget * 0.9) return "near"; // Within 10% of target
        return "poor"; // Below 90% of target

      case "margin":
        // Use category-specific target or fall back to program target
        const marginTarget =
          category.targetMetrics?.margin || currentLinePlan.targetOverallMargin;

        if (avgCategoryMargin >= marginTarget * 1.05) return "excellent"; // 5%+ above target
        if (avgCategoryMargin >= marginTarget) return "good"; // At or above target
        if (avgCategoryMargin >= marginTarget * 0.95) return "near"; // Within 5% of target
        return "poor"; // Below 95% of target

      case "sell-in":
        // Use category volume target
        const sellInTarget = category.targetVolume;

        if (totalProjectedSellIn >= sellInTarget * 1.1) return "excellent"; // 10%+ above target
        if (totalProjectedSellIn >= sellInTarget) return "good"; // At or above target
        if (totalProjectedSellIn >= sellInTarget * 0.9) return "near"; // Within 10% of target
        return "poor"; // Below 90% of target

      case "sell-through":
        // Use category-specific target or fall back to program target
        const sellThroughTarget =
          category.targetMetrics?.sellThrough ||
          currentLinePlan.targetOverallSellThrough;

        if (avgSellThrough >= sellThroughTarget * 1.05) return "excellent"; // 5%+ above target
        if (avgSellThrough >= sellThroughTarget) return "good"; // At or above target
        if (avgSellThrough >= sellThroughTarget * 0.95) return "near"; // Within 5% of target
        return "poor"; // Below 95% of target

      default:
        return null;
    }
  };

  // Backward compatibility function
  const isPoorPerformer = (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ): boolean => {
    const status = getPerformanceStatus(category, metricType);
    return status === "poor";
  };

  const getHighlightReason = (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ): string => {
    if (!currentLinePlan) return "";

    const status = getPerformanceStatus(category, metricType);
    if (!status) return "";

    const avgCategoryMargin =
      category.plannedStyles.length > 0
        ? category.plannedStyles.reduce((acc, style) => acc + style.margin, 0) /
          category.plannedStyles.length
        : 0;

    const totalRevenue = category.plannedStyles.reduce(
      (sum, style) =>
        sum +
        style.sellingPrice *
          (category.targetVolume / (category.plannedStyles.length || 1)),
      0
    );

    // Calculate weighted sell-through (consistent with sidebar and card)
    let totalProjectedSellThroughUnits = 0;
    let totalBaseUnits = 0;
    const volumePerStyle =
      category.targetVolume / (category.plannedStyles.length || 1);

    category.plannedStyles.forEach((style) => {
      const baseVolume = style.projectedSellIn || volumePerStyle;
      totalBaseUnits += baseVolume;
      totalProjectedSellThroughUnits +=
        (style.projectedSellThrough ?? 0.8) * baseVolume;
    });

    const avgSellThrough =
      totalBaseUnits > 0 ? totalProjectedSellThroughUnits / totalBaseUnits : 0;

    // Calculate consistent sell-in (matching cards)
    const totalProjectedSellIn = category.plannedStyles.reduce(
      (sum, style) => sum + (style.projectedSellIn || volumePerStyle),
      0
    );

    const statusEmoji = {
      excellent: "✅",
      good: "✅",
      near: "⚠️",
      poor: "🔴",
    };

    switch (metricType) {
      case "revenue":
        const revenueTarget =
          category.targetMetrics?.revenue ||
          currentLinePlan.targetOverallRevenue /
            currentLinePlan.categories.length;
        const revenuePercent = ((totalRevenue / revenueTarget) * 100).toFixed(
          0
        );
        return `${statusEmoji[status]} Revenue: $${(
          totalRevenue / 1000
        ).toFixed(0)}K (${revenuePercent}% of target)`;

      case "margin":
        const marginTarget =
          category.targetMetrics?.margin || currentLinePlan.targetOverallMargin;
        const marginDiff = ((avgCategoryMargin - marginTarget) * 100).toFixed(
          1
        );
        return `${statusEmoji[status]} Margin: ${(
          avgCategoryMargin * 100
        ).toFixed(1)}% (${
          marginDiff > "0" ? "+" : ""
        }${marginDiff}% vs target)`;

      case "sell-in":
        const sellInTarget = category.targetVolume;
        const sellInPercent = (
          (totalProjectedSellIn / sellInTarget) *
          100
        ).toFixed(0);
        return `${statusEmoji[status]} Sell-in: ${(
          totalProjectedSellIn / 1000
        ).toFixed(1)}K (${sellInPercent}% of target)`;

      case "sell-through":
        const sellThroughTarget =
          category.targetMetrics?.sellThrough ||
          currentLinePlan.targetOverallSellThrough;
        const sellThroughPercent = (
          (avgSellThrough / sellThroughTarget) *
          100
        ).toFixed(0);
        return `${statusEmoji[status]} Sell-through: ${(
          avgSellThrough * 100
        ).toFixed(0)}% (${sellThroughPercent}% of target)`;

      default:
        return "";
    }
  };

  const renderTargetsSectionContent = () => {
    if (!currentLinePlan) return null;

    // Get the selected category if in project view
    const selectedCategory = isProjectLevel
      ? currentLinePlan.categories.find((cat) => cat.id === selectedCategoryId)
      : null;

    type MetricKey = "revenue" | "margin" | "sellIn" | "sellThrough";

    // Helper function to get target value safely
    const getTargetValue = (
      metric: MetricKey,
      programValue: number,
      defaultValue: number = 0
    ): number => {
      if (
        isProjectLevel &&
        selectedCategory?.targetMetrics?.[metric] !== undefined
      ) {
        return selectedCategory.targetMetrics[metric];
      }
      return programValue ?? defaultValue;
    };

    // Use component-level metrics
    const { projected: sellInProjected, target: sellInTarget } = sellInMetrics;
    const { projected: sellThroughProjected, target: sellThroughTarget } =
      sellThroughMetrics;

    // Sort categories by their contribution to each metric
    const getSortedCategories = (
      metricType: "revenue" | "margin" | "sell-in" | "sell-through"
    ) => {
      if (!currentLinePlan?.categories) return [];

      return [...currentLinePlan.categories].sort((a, b) => {
        const aValue = getMetricValue(a, metricType);
        const bValue = getMetricValue(b, metricType);
        return bValue - aValue;
      });
    };

    // Get sorted products for the selected category
    const getSortedProducts = (
      metricType: "revenue" | "margin" | "sell-in" | "sell-through"
    ) => {
      if (!selectedCategoryId || !currentLinePlan?.categories) return [];

      const selectedCategory = currentLinePlan.categories.find(
        (cat) => cat.id === selectedCategoryId
      );
      if (!selectedCategory) return [];

      return [...selectedCategory.plannedStyles].sort((a, b) => {
        const aValue = getProductMetricValue(a, metricType);
        const bValue = getProductMetricValue(b, metricType);
        return bValue - aValue;
      });
    };

    // Handle metric card click for highlighting
    const handleMetricClick = (
      metricType: "revenue" | "margin" | "sell-in" | "sell-through"
    ) => {
      console.log(
        `[HIGHLIGHT DEBUG] Clicked metric: ${metricType}, current: ${selectedMetricForHighlighting}`
      );
      if (selectedMetricForHighlighting === metricType) {
        // If clicking the same metric, toggle off highlighting
        console.log(
          `[HIGHLIGHT DEBUG] Toggling OFF highlighting for ${metricType}`
        );
        setSelectedMetricForHighlighting(null);
      } else {
        // Set the new metric for highlighting
        console.log(`[HIGHLIGHT DEBUG] Setting highlighting to ${metricType}`);
        setSelectedMetricForHighlighting(metricType);
      }
    };

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 space-y-3">
          <MetricBulletCard
            title="Revenue"
            target={
              getTargetValue(
                "revenue",
                currentLinePlan.targetOverallRevenue,
                0
              ) / 1000000
            }
            current={overallProjectedRevenue}
            unit="$M"
            icon={<CurrencyDollarIcon className="w-4 h-4" />}
            relatedCategories={
              isProjectLevel ? [] : getSortedCategories("revenue")
            }
            relatedProducts={isProjectLevel ? getSortedProducts("revenue") : []}
            onCategorySelect={handleSelectCategory}
            onProductSelect={handleSelectStyle}
            isProjectLevel={isProjectLevel}
            onClick={() => handleMetricClick("revenue")}
            isActive={selectedMetricForHighlighting === "revenue"}
          />
          <MetricBulletCard
            title="Margin"
            target={
              getTargetValue("margin", currentLinePlan.targetOverallMargin, 0) *
              100
            }
            current={overallAchievedMargin * 100}
            unit="%"
            icon={<ScaleIcon className="w-4 h-4" />}
            relatedCategories={
              isProjectLevel ? [] : getSortedCategories("margin")
            }
            relatedProducts={isProjectLevel ? getSortedProducts("margin") : []}
            onCategorySelect={handleSelectCategory}
            onProductSelect={handleSelectStyle}
            isProjectLevel={isProjectLevel}
            onClick={() => handleMetricClick("margin")}
            isActive={selectedMetricForHighlighting === "margin"}
          />
          <MetricBulletCard
            title="Sell-In"
            target={getTargetValue("sellIn", sellInTarget, 0)}
            current={sellInProjected}
            unit="units"
            icon={<PackageIcon className="w-4 h-4" />}
            relatedCategories={
              isProjectLevel ? [] : getSortedCategories("sell-in")
            }
            relatedProducts={isProjectLevel ? getSortedProducts("sell-in") : []}
            onCategorySelect={handleSelectCategory}
            onProductSelect={handleSelectStyle}
            isProjectLevel={isProjectLevel}
            onClick={() => handleMetricClick("sell-in")}
            isActive={selectedMetricForHighlighting === "sell-in"}
          />
          <MetricBulletCard
            title="Sell-Through"
            target={sellThroughTarget}
            current={sellThroughProjected}
            unit="%"
            icon={<PercentIcon className="w-4 h-4" />}
            relatedCategories={
              isProjectLevel ? [] : getSortedCategories("sell-through")
            }
            relatedProducts={
              isProjectLevel ? getSortedProducts("sell-through") : []
            }
            onCategorySelect={handleSelectCategory}
            onProductSelect={handleSelectStyle}
            isProjectLevel={isProjectLevel}
            onClick={() => handleMetricClick("sell-through")}
            isActive={selectedMetricForHighlighting === "sell-through"}
          />
        </div>
      </div>
    );
  };

  const handleSelectCategory = (category: LinePlanCategory) => {
    setSelectedCategoryId(category.id);
    setSelectedProductId(null); // Clear product selection when selecting category
    setViewMode("category");
  };

  const handleProductBack = () => {
    setSelectedProductId(null);
  };

  const handleSelectStyle = () => {
    // Disabled for mockup - no style selection logic
  };

  const handleAddNewStyleToCategory = (category: LinePlanCategory) => {
    setSelectedCategoryId(category.id);
    setViewMode("category");
    // We'll handle the add action in the CategoryDetailView
    openStyleModal();
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

  useEffect(() => {
    if (currentLinePlan && currentLinePlan.name !== "Untitled Program") {
      setShowCreateProgramForm(false);
    } else if (!currentLinePlan && linePlans.length === 0) {
      setShowCreateProgramForm(true);
      // Initialize with default values
      setProgramName("");
      setProgramSeason("");
      setProgramTargetMargin(60);
      setProgramTargetSellThrough(85);
      setProgramTargetRevenue(500000);
      setProjects([{ ...initialProjectFormState }]);
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

  const handleAddPlaceholder = (categoryId: string) => {
    navigate(`/category/${categoryId}?action=add&type=placeholder`);
  };

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

  const handleCancelCreateProgram = () => {
    setShowCreateProgramForm(false);
    setProgramName("");
    setProgramSeason("");
    setProgramTargetMargin(60);
    setProgramTargetSellThrough(85);
    setProgramTargetRevenue(500000);
    setProjects([{ ...initialProjectFormState }]);

    if (
      currentLinePlan &&
      currentLinePlan.name === "Untitled Program" &&
      linePlans.length > 1
    ) {
      const otherPlan =
        linePlans.find((lp) => lp.id !== currentLinePlan.id) || linePlans[0];
      if (otherPlan) setCurrentLinePlanId(otherPlan.id);
    }
  };

  const openStyleModal = () => setIsStyleModalOpen(true);
  const closeStyleModal = () => setIsStyleModalOpen(false);

  // Helper for tag color classes
  const getTagColorClasses = (color: string): string => {
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

  const renderProductLinesSectionContent = (layout: LayoutViewOption) => {
    if (!currentLinePlan) return null;

    if (layout === "compactList") {
      return (
        <CompactListView
          categories={filteredCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          onSelectStyle={handleSelectStyle}
          activeTargetFilter={activeTargetFilter?.type || null}
          targetOverallMargin={currentLinePlan.targetOverallMargin}
          onStatusChange={handleCategoryStatusChange}
          onBackToCategories={handleBackToOverview}
          selectedMetricForHighlighting={selectedMetricForHighlighting}
          isPoorPerformer={isPoorPerformer}
          getHighlightReason={getHighlightReason}
          getPerformanceStatus={getPerformanceStatus}
          isProductPoorPerformer={isProductPoorPerformer}
          getProductHighlightReason={getProductHighlightReason}
          getProductPerformanceStatus={getProductPerformanceStatus}
        />
      );
    }

    if (layout === "wideView") {
      return (
        <ProgramWideView
          categories={filteredCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleSelectCategory}
          onSelectStyle={handleSelectStyle}
          activeTargetFilter={activeTargetFilter?.type || null}
          targetOverallMargin={currentLinePlan.targetOverallMargin}
          onStatusChange={handleCategoryStatusChange}
          onBackToCategories={handleBackToOverview}
          selectedMetricForHighlighting={selectedMetricForHighlighting}
          isPoorPerformer={isPoorPerformer}
          getHighlightReason={getHighlightReason}
        />
      );
    }

    return (
      <div className="bg-white rounded-xl shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start auto-rows-auto">
          {filteredCategories.map((category) => (
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
              selectedMetricForHighlighting={selectedMetricForHighlighting}
              isPoorPerformer={isPoorPerformer}
              getHighlightReason={getHighlightReason}
              getPerformanceStatus={getPerformanceStatus}
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
      </div>
    );
  };

  // Product-level performance functions
  const getProductPerformanceStatus = (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ): "excellent" | "good" | "near" | "poor" | null => {
    if (!currentLinePlan) return null;

    // Handle both PlannedStyle and Product types
    const volumePerStyle =
      category.targetVolume / (category.plannedStyles.length || 1);
    const styleRevenue = product.sellingPrice * volumePerStyle;

    // Handle different property names between PlannedStyle and Product
    let styleSellIn: number;
    let styleSellThrough: number;

    if ("plmStatus" in product) {
      // It's a PlannedStyle
      styleSellIn = product.projectedSellIn || volumePerStyle;
      styleSellThrough = product.projectedSellThrough ?? 0.8;
    } else {
      // It's a Product
      styleSellIn = volumePerStyle; // Products don't have projectedSellIn
      styleSellThrough = product.sellThrough ?? 0.8;
    }

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

        if (styleSellIn >= styleSellInTarget * 1.1) return "excellent"; // 10%+ above target
        if (styleSellIn >= styleSellInTarget) return "good"; // At or above target
        if (styleSellIn >= styleSellInTarget * 0.9) return "near"; // Within 10% of target
        return "poor"; // Below 90% of target

      case "sell-through":
        // Use category-specific target or program target
        const sellThroughTarget =
          category.targetMetrics?.sellThrough ||
          currentLinePlan.targetOverallSellThrough;

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

    // Handle both PlannedStyle and Product types
    const volumePerStyle =
      category.targetVolume / (category.plannedStyles.length || 1);
    const styleRevenue = product.sellingPrice * volumePerStyle;

    // Handle different property names between PlannedStyle and Product
    let styleSellIn: number;
    let styleSellThrough: number;

    if ("plmStatus" in product) {
      // It's a PlannedStyle
      styleSellIn = product.projectedSellIn || volumePerStyle;
      styleSellThrough = product.projectedSellThrough ?? 0.8;
    } else {
      // It's a Product
      styleSellIn = volumePerStyle; // Products don't have projectedSellIn
      styleSellThrough = product.sellThrough ?? 0.8;
    }

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
    return status === "poor";
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
            <Avatar className="h-8 w-8">
              <AvatarFallback>Y</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <ProgramSidebar
            onInitiateProgramCreation={onInitiateNewDraftProgram}
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
                              onClick={() => {
                                setSelectedCategoryId(null);
                                setSelectedProductId(null);
                                setViewMode("overview");
                              }}
                              className="text-slate-500 hover:text-slate-700"
                            >
                              {currentLinePlan?.name}
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                            {selectedProductId ? (
                              <>
                                <BreadcrumbLink
                                  onClick={() => setSelectedProductId(null)}
                                  className="text-slate-500 hover:text-slate-700"
                                >
                                  {currentLinePlan?.categories.find(
                                    (c) => c.id === selectedCategoryId
                                  )?.name || "Category"}
                                </BreadcrumbLink>
                                <BreadcrumbSeparator />
                                <BreadcrumbPage>
                                  {currentLinePlan?.categories
                                    .find((c) => c.id === selectedCategoryId)
                                    ?.plannedStyles.find(
                                      (s) => s.id === selectedProductId
                                    )?.name || "Product"}
                                </BreadcrumbPage>
                              </>
                            ) : (
                              <BreadcrumbPage>
                                {currentLinePlan?.categories.find(
                                  (c) => c.id === selectedCategoryId
                                )?.name || "Category"}
                              </BreadcrumbPage>
                            )}
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
                  <ToggleGroup
                    type="single"
                    value={currentLayout}
                    onValueChange={(value) => {
                      if (value) setCurrentLayout(value as LayoutViewOption);
                    }}
                    className="bg-slate-100/50 p-1 rounded-lg"
                  >
                    {LAYOUT_OPTIONS.map((option) => (
                      <ToggleGroupItem
                        key={option.value}
                        value={option.value}
                        className="data-[state=on]:bg-white"
                      >
                        <option.icon className="w-4 h-4" />
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-sky-100 text-sky-700 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>

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
                      <div className="flex-1 min-w-0">
                        <div className="space-y-5">
                          {viewMode === "composition" ? (
                            currentLinePlan ? (
                              <CompositionView
                                linePlan={currentLinePlan}
                                onBack={handleBackToOverview}
                                onProductClick={(projectId, productId) => {
                                  setSelectedCategoryId(projectId);
                                  setSelectedProductId(productId);
                                  setViewMode("category");
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
                                filteredCategories.find(
                                  (c) => c.id === selectedCategoryId
                                ) ||
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
                                closeStyleModal();
                              }}
                              currentLayout={currentLayout}
                              programName={currentLinePlan.name}
                              selectedProductId={selectedProductId}
                              onProductBack={handleProductBack}
                              isStyleModalOpen={isStyleModalOpen}
                              onStyleModalClose={closeStyleModal}
                            />
                          ) : (
                            renderProductLinesSectionContent(currentLayout)
                          )}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "bg-card rounded-lg border transition-all duration-200 flex flex-col h-full",
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
                                Program Analysis
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChevronRight
                              className={cn(
                                "w-4 h-4 transition-transform",
                                !isMetricsPanelCollapsed && "rotate-180"
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {isMetricsPanelCollapsed ? (
                            (() => {
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
                          ) : (
                            <div className="h-full">
                              <Tabs
                                defaultValue="metrics"
                                value={panelView}
                                onValueChange={(value) =>
                                  setPanelView(
                                    value as "metrics" | "composition"
                                  )
                                }
                                className="w-full h-full flex flex-col"
                              >
                                <div className="px-3 pt-2">
                                  <TabsList className="w-full">
                                    <TabsTrigger
                                      value="metrics"
                                      className="flex-1"
                                    >
                                      <Settings className="w-4 h-4 mr-2" />
                                      Metrics
                                    </TabsTrigger>
                                    <TabsTrigger
                                      value="composition"
                                      className="flex-1"
                                    >
                                      <BarChart2Icon className="w-4 h-4 mr-2" />
                                      Analysis
                                    </TabsTrigger>
                                  </TabsList>
                                </div>
                                <TabsContent
                                  value="metrics"
                                  className="flex-1 overflow-y-auto mt-0"
                                >
                                  {renderTargetsSectionContent()}
                                </TabsContent>
                                <TabsContent
                                  value="composition"
                                  className="flex-1 overflow-y-auto mt-0"
                                >
                                  {currentLinePlan ? (
                                    <CompositionPanelView
                                      linePlan={
                                        selectedCategoryId
                                          ? {
                                              ...currentLinePlan,
                                              categories:
                                                currentLinePlan.categories.filter(
                                                  (c) =>
                                                    c.id === selectedCategoryId
                                                ),
                                            }
                                          : currentLinePlan
                                      }
                                      onProductClick={(
                                        projectId,
                                        productId
                                      ) => {
                                        setSelectedCategoryId(projectId);
                                        setSelectedProductId(productId);
                                        setViewMode("category");
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
                                  )}
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                        </div>
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
      {isAddCategoryModalOpen && (
        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onClose={() => setIsAddCategoryModalOpen(false)}
          onAddCategory={() => {
            onAddCategory();
            setIsAddCategoryModalOpen(false);
          }}
        />
      )}

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

      {/* Catalogue Modal */}
      <CatalogueModal
        isOpen={isCatalogueModalOpen}
        onClose={() => setIsCatalogueModalOpen(false)}
        catalogueItems={productCatalogueData}
        onSelectItemForAdding={handleAddCatalogueItem}
      />

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <Modal
          isOpen={isFilterModalOpen}
          title="Filter by Tags"
          onClose={() => setIsFilterModalOpen(false)}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <span className="text-sm text-slate-500">
                    {activeFilterCount} active filter
                    {activeFilterCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      ...filters,
                      tags: [],
                      excludeTags: [],
                    });
                    setTagSearch("");
                  }}
                >
                  Clear All
                </Button>
                <Button onClick={() => setIsFilterModalOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {tagSearch && (
                <button
                  onClick={() => setTagSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Project Filters */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Projects</h3>
              <div className="grid grid-cols-2 gap-2">
                {currentLinePlan?.categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.name)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...filters.categories, category.name]
                            : filters.categories.filter(
                                (c) => c !== category.name
                              );
                          setFilters({ ...filters, categories: newCategories });
                        }}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <input
                        type="checkbox"
                        checked={filters.excludeCategories.includes(
                          category.name
                        )}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...filters.excludeCategories, category.name]
                            : filters.excludeCategories.filter(
                                (c) => c !== category.name
                              );
                          setFilters({
                            ...filters,
                            excludeCategories: newCategories,
                          });
                        }}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-slate-700">
                        {category.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Filters */}
            {(filters.tags.length > 0 ||
              filters.excludeTags.length > 0 ||
              filters.categories.length > 0 ||
              filters.excludeCategories.length > 0) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-slate-700">
                  Active Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {filters.categories.map((categoryName) => (
                    <div
                      key={`include-category-${categoryName}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 text-sm rounded-md border border-sky-200"
                    >
                      <span>Include: {categoryName}</span>
                      <button
                        onClick={() => {
                          setFilters({
                            ...filters,
                            categories: filters.categories.filter(
                              (c) => c !== categoryName
                            ),
                          });
                        }}
                        className="hover:bg-sky-100 rounded-full p-0.5"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {filters.excludeCategories.map((categoryName) => (
                    <div
                      key={`exclude-category-${categoryName}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-sm rounded-md border border-red-200"
                    >
                      <span>Exclude: {categoryName}</span>
                      <button
                        onClick={() => {
                          setFilters({
                            ...filters,
                            excludeCategories: filters.excludeCategories.filter(
                              (c) => c !== categoryName
                            ),
                          });
                        }}
                        className="hover:bg-red-100 rounded-full p-0.5"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Existing tag filters */}
                  {filters.tags.map((tagId) => {
                    const tag = productTagsData.find((t) => t.id === tagId);
                    return tag ? (
                      <div
                        key={`include-${tagId}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 text-sm rounded-md border border-sky-200"
                      >
                        <span>Include: {tag.name}</span>
                        <button
                          onClick={() => {
                            setFilters({
                              ...filters,
                              tags: filters.tags.filter((t) => t !== tagId),
                            });
                          }}
                          className="hover:bg-sky-100 rounded-full p-0.5"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                  {filters.excludeTags.map((tagId) => {
                    const tag = productTagsData.find((t) => t.id === tagId);
                    return tag ? (
                      <div
                        key={`exclude-${tagId}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-sm rounded-md border border-red-200"
                      >
                        <span>Exclude: {tag.name}</span>
                        <button
                          onClick={() => {
                            setFilters({
                              ...filters,
                              excludeTags: filters.excludeTags.filter(
                                (t) => t !== tagId
                              ),
                            });
                          }}
                          className="hover:bg-red-100 rounded-full p-0.5"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Tag Categories */}
            <div className="space-y-6">
              {Object.entries(filteredTagsByCategory).map(
                ([categoryName, tags]) => (
                  <div key={categoryName} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-slate-700 capitalize">
                        {categoryName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const categoryTagIds = tags.map((t) => t.id);
                            setFilters({
                              ...filters,
                              tags: [
                                ...new Set([
                                  ...filters.tags,
                                  ...categoryTagIds,
                                ]),
                              ],
                            });
                          }}
                          className="text-xs"
                        >
                          Include All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const categoryTagIds = tags.map((t) => t.id);
                            setFilters({
                              ...filters,
                              excludeTags: [
                                ...new Set([
                                  ...filters.excludeTags,
                                  ...categoryTagIds,
                                ]),
                              ],
                            });
                          }}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Exclude All
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.tags.includes(tag.id)}
                              onChange={(e) => {
                                const newTags = e.target.checked
                                  ? [...filters.tags, tag.id]
                                  : filters.tags.filter((t) => t !== tag.id);
                                setFilters({ ...filters, tags: newTags });
                              }}
                              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                            />
                            <input
                              type="checkbox"
                              checked={filters.excludeTags.includes(tag.id)}
                              onChange={(e) => {
                                const newTags = e.target.checked
                                  ? [...filters.excludeTags, tag.id]
                                  : filters.excludeTags.filter(
                                      (t) => t !== tag.id
                                    );
                                setFilters({
                                  ...filters,
                                  excludeTags: newTags,
                                });
                              }}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                            />
                            <span
                              className={`text-sm px-2 py-1 rounded-md border ${getTagColorClasses(
                                tag.color
                              )}`}
                            >
                              {tag.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProgramOverviewPage;
