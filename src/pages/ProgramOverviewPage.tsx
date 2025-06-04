import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LinePlan,
  ProductCatalogueItem,
  GlobalMetricViewOption,
  CategoryMetricViewOption,
  PlannedStyle,
} from "../types";
import { productCatalogueData as allCatalogueItems } from "../data";
import {
  ChevronRightIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  PercentIcon,
  ChartBarIcon,
  LayoutDashboardIcon,
  TableCellsIcon,
  ViewColumnsIcon,
  PlusIcon,
  CollectionIcon,
} from "../components/icons";
import Modal from "../components/Modal";
import MetricDisplayCard from "../components/MetricDisplayCard";
import CatalogueModal from "../components/CatalogueModal";
import ProductLineCategoryCard from "../components/ProductLineCategoryCard";
import CreateProgramModal from "../components/CreateProgramModal";
import AddCategoryModal from "../components/AddCategoryModal";
import EditProgramTargetsModal from "../components/EditProgramTargetsModal";
import AddOptionsPopover from "../components/AddOptionsPopover";
import CategoryDetailView from "../components/CategoryDetailView";
import CompositionView, { FilterState } from "../components/CompositionView";

type LayoutViewOption = "standard" | "compactList" | "wideView";
type ViewMode = "overview" | "category" | "composition";

const LAYOUT_OPTIONS: {
  value: LayoutViewOption;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { value: "standard", label: "Standard Dashboard", icon: LayoutDashboardIcon },
  { value: "compactList", label: "Compact List", icon: TableCellsIcon },
  { value: "wideView", label: "Wide View (Horizontal)", icon: ViewColumnsIcon },
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

interface ProgramOverviewPageProps {
  linePlans: LinePlan[];
  currentLinePlan: LinePlan;
  setCurrentLinePlanId: (id: string) => void;
  onUpdateTargets: (
    margin: number,
    sellThrough: number,
    revenue: number
  ) => void;
  onPullInStyle: (categoryId: string, style: ProductCatalogueItem) => void;
  onCreateProgram: (
    name: string,
    season: string,
    targetMargin: number,
    targetSellThrough: number,
    targetRevenue: number
  ) => void;
  onAddCategory: (name: string, targetVolume: number) => void;
  globalMetricView: GlobalMetricViewOption;
  setGlobalMetricView: (view: GlobalMetricViewOption) => void;
  categoryMetricView: CategoryMetricViewOption;
  setCategoryMetricView: (view: CategoryMetricViewOption) => void;
  setLinePlans: React.Dispatch<React.SetStateAction<LinePlan[]>>;
}

const ProgramOverviewPage: React.FC<ProgramOverviewPageProps> = ({
  linePlans,
  currentLinePlan,
  setCurrentLinePlanId,
  onUpdateTargets,
  onPullInStyle,
  onCreateProgram,
  onAddCategory,
  categoryMetricView,
  setLinePlans,
}) => {
  const navigate = useNavigate();
  const [currentLayout, setCurrentLayout] =
    useState<LayoutViewOption>("standard");
  const [activeTargetFilter, setActiveTargetFilter] =
    useState<ActiveTargetFilter | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("overview");

  const [isCatalogueModalOpen, setIsCatalogueModalOpen] = useState(false);
  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] =
    useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isEditTargetsModalOpen, setIsEditTargetsModalOpen] = useState(false);

  const [confirmAddModalState, setConfirmAddModalState] =
    useState<ConfirmAddCarryoverModalState>({
      isOpen: false,
      itemToAdd: null,
      selectedCategoryId: currentLinePlan.categories[0]?.id || "",
    });

  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(
    null
  ) as React.MutableRefObject<HTMLButtonElement>;

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    excludeCategories: [],
    tags: [],
    excludeTags: [],
    priceRange: { min: 0, max: 1000 },
    marginRange: { min: 0, max: 100 },
    status: [],
  });

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
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
        currentLinePlan.categories.find((c) => c.name === item.categoryName)
          ?.id ||
        currentLinePlan.categories[0]?.id ||
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

  const handleAddNewStyleToCategory = (categoryId: string) => {
    navigate(`/category/${categoryId}?action=add`);
  };

  const handleAddPlaceholder = (categoryId: string) => {
    navigate(`/category/${categoryId}?action=add&type=placeholder`);
  };

  const overallProjectedRevenue =
    currentLinePlan.categories.reduce(
      (sum, cat) =>
        sum +
        cat.plannedStyles.reduce(
          (styleSum, style) =>
            styleSum +
            style.sellingPrice *
              (cat.targetVolume / (cat.plannedStyles.length || 1)),
          0
        ),
      0
    ) / 1000000;

  const overallAchievedMargin = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    currentLinePlan.categories.forEach((cat) => {
      cat.plannedStyles.forEach((style) => {
        const styleVolume = cat.targetVolume / (cat.plannedStyles.length || 1);
        totalRevenue += style.sellingPrice * styleVolume;
        totalCost += style.costPrice * styleVolume;
      });
    });
    return totalRevenue === 0 ? 0 : (totalRevenue - totalCost) / totalRevenue;
  }, [currentLinePlan.categories]);

  const sortedCategories = useMemo(() => {
    const categoriesCopy = [...currentLinePlan.categories];
    if (!activeTargetFilter) return categoriesCopy;

    switch (activeTargetFilter.type) {
      case "margin":
        return categoriesCopy.sort((a, b) => {
          const marginA =
            a.plannedStyles.length > 0
              ? a.plannedStyles.reduce((s, st) => s + st.margin, 0) /
                a.plannedStyles.length
              : -1;
          const marginB =
            b.plannedStyles.length > 0
              ? b.plannedStyles.reduce((s, st) => s + st.margin, 0) /
                b.plannedStyles.length
              : -1;
          return marginB - marginA;
        });
      default:
        return categoriesCopy;
    }
  }, [currentLinePlan.categories, activeTargetFilter]);

  const getLayoutConfig = (
    layout: LayoutViewOption
  ): { containerClasses: string; cardDisplayMode: "grid" | "list" } => {
    switch (layout) {
      case "standard":
        return {
          containerClasses:
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5",
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
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5",
          cardDisplayMode: "grid",
        };
    }
  };

  const renderTargetsSectionContent = (
    layout: LayoutViewOption = "standard"
  ) => {
    const isCompact = layout === "compactList";

    const metrics = (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Program Targets
          </h2>
          <button
            onClick={() => setIsEditTargetsModalOpen(true)}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            Edit Targets
          </button>
        </div>
        <MetricDisplayCard
          title="Revenue"
          projectedValue={overallProjectedRevenue}
          targetValue={currentLinePlan.targetOverallRevenue / 1000000}
          unit="$M"
          displayValueFormatter={(val) => `$${val.toFixed(1)}M`}
          icon={<CurrencyDollarIcon />}
          isActive={activeTargetFilter?.type === "revenue"}
          onClick={() => handleTargetFilterClick("revenue", "Revenue Impact")}
          higherIsBetter={true}
          isCompact={isCompact}
          viewStyle="bullet"
        />
        <MetricDisplayCard
          title="Margin"
          projectedValue={overallAchievedMargin * 100}
          targetValue={currentLinePlan.targetOverallMargin * 100}
          unit="%"
          displayValueFormatter={(val) => `${val.toFixed(1)}%`}
          icon={<PercentIcon />}
          isActive={activeTargetFilter?.type === "margin"}
          onClick={() =>
            handleTargetFilterClick("margin", "Margin Performance")
          }
          higherIsBetter={true}
          isCompact={isCompact}
          viewStyle="bullet"
        />
        <MetricDisplayCard
          title="Sell-In"
          projectedValue={currentLinePlan.categories.reduce(
            (sum, cat) =>
              sum +
              cat.plannedStyles.reduce(
                (styleSum, style) => styleSum + (style.projectedSellIn || 0),
                0
              ),
            0
          )}
          targetValue={currentLinePlan.categories.reduce(
            (sum, cat) => sum + cat.targetVolume,
            0
          )}
          unit="K"
          displayValueFormatter={(val) => `${(val / 1000).toFixed(1)}K`}
          icon={<ScaleIcon />}
          isActive={activeTargetFilter?.type === "sellin"}
          onClick={() => handleTargetFilterClick("sellin", "Sell-In Units")}
          higherIsBetter={true}
          isCompact={isCompact}
          viewStyle="bullet"
        />
        <MetricDisplayCard
          title="Sell-Through"
          projectedValue={
            (currentLinePlan.categories.reduce(
              (sum, cat) =>
                sum +
                cat.plannedStyles.reduce(
                  (styleSum, style) =>
                    styleSum + (style.projectedSellThrough || 0),
                  0
                ) /
                  (cat.plannedStyles.length || 1),
              0
            ) /
              (currentLinePlan.categories.length || 1)) *
            100
          }
          targetValue={currentLinePlan.targetOverallSellThrough * 100}
          unit="%"
          displayValueFormatter={(val) => `${val.toFixed(1)}%`}
          icon={<ChartBarIcon />}
          isActive={activeTargetFilter?.type === "sellthrough"}
          onClick={() =>
            handleTargetFilterClick("sellthrough", "Sell-Through Rate")
          }
          higherIsBetter={true}
          isCompact={isCompact}
          viewStyle="bullet"
        />
      </div>
    );

    return <div className="h-full bg-white p-5">{metrics}</div>;
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setViewMode("category");
  };

  const handleBackToOverview = () => {
    setSelectedCategoryId(null);
    setViewMode("overview");
  };

  const handleShowComposition = () => {
    setViewMode("composition");
  };

  const handleBackFromComposition = () => {
    setViewMode("overview");
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

    if (viewMode === "composition") {
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
      const selectedCategory = currentLinePlan.categories.find(
        (cat) => cat.id === selectedCategoryId
      );
      if (!selectedCategory) {
        setSelectedCategoryId(null);
        setViewMode("overview");
        return null;
      }

      return (
        <div className="flex-grow p-5">
          <CategoryDetailView
            category={selectedCategory}
            onBack={handleBackToOverview}
            onUpdateStyle={handleUpdateStyle}
            onAddStyle={handleAddStyle}
            currentLayout={layout}
          />
        </div>
      );
    }

    if (selectedCategoryId) {
      const selectedCategory = currentLinePlan.categories.find(
        (cat) => cat.id === selectedCategoryId
      );
      if (!selectedCategory) {
        setSelectedCategoryId(null);
        return null;
      }

      return (
        <div className="flex-grow p-5">
          <CategoryDetailView
            category={selectedCategory}
            onBack={handleBackToOverview}
            onUpdateStyle={handleUpdateStyle}
            onAddStyle={handleAddStyle}
            currentLayout={layout}
          />
        </div>
      );
    }

    return (
      <div className={`${containerClasses} flex-grow`}>
        {sortedCategories.map((category) => (
          <ProductLineCategoryCard
            key={category.id}
            category={category}
            onSelectCategory={handleSelectCategory}
            onAddNewStyle={handleAddNewStyleToCategory}
            activeTargetFilter={activeTargetFilter}
            targetOverallMargin={currentLinePlan.targetOverallMargin}
            season={currentLinePlan.season}
            displayMode={cardDisplayMode}
            metricViewStyle={categoryMetricView}
          />
        ))}
        {currentLinePlan.categories.length === 0 && (
          <div className="md:col-span-full text-center py-16 px-6">
            <CollectionIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-md font-semibold text-slate-700">
              This Plan is Empty
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Add categories (projects) and styles to start planning your
              assortment.
            </p>
            <button
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="mt-4 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
            >
              Add Category
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleCreateProgram = (
    name: string,
    season: string,
    targetMargin: number,
    targetSellThrough: number,
    targetRevenue: number
  ) => {
    onCreateProgram(
      name,
      season,
      targetMargin,
      targetSellThrough,
      targetRevenue
    );
  };

  const handleAddCategory = (name: string, targetVolume: number) => {
    onAddCategory(name, targetVolume);
  };

  const handleUpdateStyle = (
    categoryId: string,
    updatedStyle: PlannedStyle
  ) => {
    setLinePlans((prevPlans: LinePlan[]) =>
      prevPlans.map((plan: LinePlan) =>
        plan.id === currentLinePlan.id
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
        plan.id === currentLinePlan.id
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

  return (
    <div className="flex flex-1 h-full bg-slate-100">
      <aside className="w-64 bg-white border-r border-slate-200/80 p-4 space-y-4 flex-shrink-0 h-full overflow-y-auto styled-scrollbar shadow-sm">
        <button
          onClick={() => setIsCreateProgramModalOpen(true)}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-3.5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 active:bg-sky-700 active:scale-[0.98]"
          title="Create a new program"
        >
          Create New Program
        </button>
        <div className="pt-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Programs
          </h3>
          {linePlans.map((lp) => (
            <div
              key={lp.id}
              onClick={() => setCurrentLinePlanId(lp.id)}
              className={`p-2.5 rounded-lg cursor-pointer text-sm group transition-all duration-150 ease-in-out relative mb-1.5
                    ${
                      lp.id === currentLinePlan.id
                        ? "bg-sky-100/70 text-sky-700 border-l-4 border-sky-500 font-semibold shadow-inner"
                        : "hover:bg-slate-100 text-slate-600 hover:text-slate-800 active:bg-slate-200/70"
                    }`}
              title={`View program ${lp.name}`}
            >
              <div className="flex justify-between items-center">
                <span>{lp.name}</span>
                {lp.id !== currentLinePlan.id && (
                  <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-500 transition-colors" />
                )}
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  lp.id === currentLinePlan.id
                    ? "text-sky-600"
                    : "text-slate-500 group-hover:text-slate-600"
                }`}
              >
                {lp.season}
              </p>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        <div className="px-5 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {currentLinePlan.name} Product Lines
            </h3>
            <div className="relative"></div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShowComposition}
              className="flex items-center space-x-1.5 px-3.5 py-2 border border-emerald-500 text-emerald-600 bg-emerald-50/80 hover:bg-emerald-100/80 hover:border-emerald-600 rounded-lg text-sm font-medium shadow-sm transition-all duration-150 ease-in-out active:bg-emerald-200/70 active:scale-[0.98]"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Composition</span>
            </button>
            <div className="flex items-center space-x-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shadow-sm">
              {LAYOUT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCurrentLayout(opt.value)}
                  title={opt.label}
                  className={`p-1.5 rounded-md transition-all duration-150 ease-in-out group
                    ${
                      currentLayout === opt.value
                        ? "bg-sky-500 text-white shadow-md"
                        : "text-slate-500 hover:bg-white hover:text-sky-600 hover:shadow-sm active:bg-slate-200"
                    }
                  `}
                >
                  <opt.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
            <button
              ref={addButtonRef}
              onClick={() => setIsAddPopoverOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 border border-sky-500 text-sky-600 bg-sky-50/80 hover:bg-sky-100/80 hover:border-sky-600 rounded-lg text-sm font-medium shadow-sm transition-all duration-150 ease-in-out active:bg-sky-200/70 active:scale-[0.98]"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto styled-scrollbar">
          {currentLayout === "standard" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-0 h-full">
              <section className="md:col-span-4 lg:col-span-3 xl:col-span-3 bg-white border-r border-slate-200/80 overflow-y-auto styled-scrollbar">
                <div className="sticky top-0 bg-white z-10 border-b border-slate-200/80 pb-4">
                  {renderTargetsSectionContent("standard")}
                </div>
              </section>
              <section className="md:col-span-8 lg:col-span-9 xl:col-span-9 flex flex-col overflow-y-auto styled-scrollbar">
                {renderProductLinesSectionContent("standard")}
              </section>
            </div>
          )}
          {currentLayout === "compactList" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-0 h-full">
              <section className="md:col-span-4 lg:col-span-3 xl:col-span-3 bg-white border-r border-slate-200/80 overflow-y-auto styled-scrollbar">
                <div className="sticky top-0 bg-white z-10 border-b border-slate-200/80 pb-4">
                  {renderTargetsSectionContent("compactList")}
                </div>
              </section>
              <section className="md:col-span-8 lg:col-span-9 xl:col-span-9 flex flex-col overflow-y-auto styled-scrollbar">
                {renderProductLinesSectionContent("compactList")}
              </section>
            </div>
          )}
          {currentLayout === "wideView" && (
            <div className="grid grid-cols-12 gap-x-0 h-full">
              <section className="col-span-3 bg-white border-r border-slate-200/80 overflow-y-auto styled-scrollbar">
                <div className="sticky top-0 bg-white z-10 border-b border-slate-200/80 pb-4">
                  {renderTargetsSectionContent("wideView")}
                </div>
              </section>
              <section className="col-span-9 flex flex-col overflow-hidden">
                {renderProductLinesSectionContent("wideView")}
              </section>
            </div>
          )}
        </div>
      </main>

      <CatalogueModal
        isOpen={isCatalogueModalOpen}
        onClose={closeCatalogueModal}
        catalogueItems={allCatalogueItems}
        onSelectItemForAdding={handleSelectItemFromCatalogue}
      />

      <Modal
        isOpen={confirmAddModalState.isOpen}
        onClose={closeConfirmAddModal}
        title={`Add "${
          confirmAddModalState.itemToAdd?.name || "Item"
        }" to Line Plan`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Select a category in{" "}
            <span className="font-semibold">{currentLinePlan.name}</span> to add
            this carryover style to.
          </p>
          <div>
            <label
              htmlFor="targetCategory"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Target Category
            </label>
            <select
              id="targetCategory"
              name="targetCategory"
              value={confirmAddModalState.selectedCategoryId}
              onChange={(e) =>
                setConfirmAddModalState((prev) => ({
                  ...prev,
                  selectedCategoryId: e.target.value,
                }))
              }
              className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
              disabled={currentLinePlan.categories.length === 0}
            >
              {currentLinePlan.categories.length > 0 ? (
                currentLinePlan.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No categories available in this plan
                </option>
              )}
            </select>
            {confirmAddModalState.itemToAdd && (
              <div className="mt-3 text-xs p-3 bg-slate-50 rounded-md border border-slate-200">
                Selected:{" "}
                <span className="font-medium">
                  {confirmAddModalState.itemToAdd.name}
                </span>{" "}
                ({confirmAddModalState.itemToAdd.season}, Margin:{" "}
                {(confirmAddModalState.itemToAdd.margin * 100).toFixed(1)}%)
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={closeConfirmAddModal}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition-all duration-150 ease-in-out active:bg-slate-200/70 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAddCarryover}
              disabled={
                !confirmAddModalState.selectedCategoryId ||
                currentLinePlan.categories.length === 0
              }
              className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all duration-150 ease-in-out disabled:bg-slate-400 disabled:cursor-not-allowed active:bg-sky-700 active:scale-[0.98]"
            >
              Confirm Add
            </button>
          </div>
        </div>
      </Modal>
      <CreateProgramModal
        isOpen={isCreateProgramModalOpen}
        onClose={() => setIsCreateProgramModalOpen(false)}
        onCreateProgram={handleCreateProgram}
      />
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />
      <EditProgramTargetsModal
        isOpen={isEditTargetsModalOpen}
        onClose={() => setIsEditTargetsModalOpen(false)}
        currentLinePlan={currentLinePlan}
        onUpdateTargets={onUpdateTargets}
      />
      <AddOptionsPopover
        isOpen={isAddPopoverOpen}
        onClose={() => setIsAddPopoverOpen(false)}
        anchorRef={addButtonRef}
        onAddCategory={() => setIsAddCategoryModalOpen(true)}
        onAddCarryover={openCatalogueModal}
        onAddPlaceholder={() => {
          if (currentLinePlan.categories.length > 0) {
            handleAddPlaceholder(currentLinePlan.categories[0].id);
          }
        }}
      />
    </div>
  );
};

export default ProgramOverviewPage;
