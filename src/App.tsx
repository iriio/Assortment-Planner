/**
 * MAIN APPLICATION COMPONENT - Root component managing application state and routing
 *
 * ARCHITECTURE OVERVIEW:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │                             APP.tsx                                 │
 * │                     (Global State Manager)                         │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  ┌───────────────┐  ┌─────────────────┐  ┌────────────────────┐    │
 * │  │   LAYOUT      │  │   ROUTING       │  │   LOCAL STORAGE    │    │
 * │  │   - Header    │  │   - Overview    │  │   - Data Persist   │    │
 * │  │   - Sidebar   │  │   - Category    │  │   - Preferences    │    │
 * │  │   - Footer    │  │   - Products    │  │   - Auto-save      │    │
 * │  └───────────────┘  └─────────────────┘  └────────────────────┘    │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * MAIN RESPONSIBILITIES:
 * - Global state management (line plans, current selection, preferences)
 * - Route configuration and navigation
 * - Data persistence and auto-save functionality
 * - Component lifecycle and state synchronization
 * - Business logic coordination between different views
 */

import React, { useState, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProgramOverviewPage from "./pages/ProgramOverviewPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import { initialLinePlan, masterComponentsData } from "./data";
import {
  PLMStatusStage,
  UserRole,
  LinePlan,
  LinePlanCategory,
  PlannedStyle,
  ProductCatalogueItem,
  PlannedStyleStatus,
  ProjectCreationInput,
  GlobalMetricViewOption,
  CategoryMetricViewOption,
  StyleMetricViewOption,
} from "./types";
import { updateStyleFinancials, generateId } from "./services/planningService";
import {
  saveLinePlans,
  loadLinePlans,
  saveCurrentLinePlanId,
  loadCurrentLinePlanId,
  saveCategoryMetricView,
  loadCategoryMetricView,
  saveStyleMetricView,
  loadStyleMetricView,
  enableAutoSave,
  migrateData,
} from "./utils/localStorage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrencyDollarIcon, ScaleIcon } from "@heroicons/react/24/outline";
import { MetricDisplayCard } from "./components/MetricDisplayCard";
import ProductLineCategoryCard from "./components/ProductLineCategoryCard";
import { LayoutViewOption } from "./types/layout";
import { getLayoutConfig } from "./utils/layout";

interface ProjectFormInput {
  name: string;
  targetVolume: number | "";
  targetRevenue: number | "";
  targetMargin: number | "";
  targetSellThrough: number | "";
}

// Program details payload interface for type safety
interface ProgramDetailsPayload {
  name: string;
  season: string;
  targetOverallMargin: number;
  targetOverallSellThrough: number;
  targetOverallRevenue: number;
  projects: ProjectCreationInput[];
}

/**
 * MAIN APP COMPONENT
 * Central coordinator for the entire assortment planning application
 */
const App: React.FC = () => {
  // GLOBAL STATE: Line plans with localStorage initialization
  const [linePlans, setLinePlans] = useState<LinePlan[]>(() => {
    const savedPlans = loadLinePlans();
    return savedPlans.length > 0 ? savedPlans : [initialLinePlan];
  });

  // CURRENT SELECTION: Active line plan with validation
  const [currentLinePlanId, setCurrentLinePlanId] = useState<string>(() => {
    const savedId = loadCurrentLinePlanId();
    // Validate that the saved ID exists in the line plans
    const validId =
      savedId && linePlans.some((lp) => lp.id === savedId)
        ? savedId
        : linePlans[0]?.id || initialLinePlan.id;
    return validId;
  });

  const navigate = useNavigate();

  // UI PREFERENCES: Metric display options with localStorage persistence
  const [globalMetricView] = useState<GlobalMetricViewOption>("bullet");
  const [categoryMetricView, setCategoryMetricView] =
    useState<CategoryMetricViewOption>(() => loadCategoryMetricView("current"));
  const [styleMetricView, setStyleMetricView] = useState<StyleMetricViewOption>(
    () => loadStyleMetricView("current")
  );

  // DERIVED STATE: Current active line plan
  const currentLinePlan =
    linePlans.find((lp) => lp.id === currentLinePlanId) || null;

  // DATA MIGRATION: Run any necessary data migrations on app start
  useEffect(() => {
    migrateData("1.0.0");
  }, []);

  // AUTO-SAVE SETUP: Automatic data persistence every 3 seconds
  useEffect(() => {
    const cleanup = enableAutoSave(
      () => linePlans,
      () => currentLinePlanId,
      3000 // Save every 3 seconds
    );

    return cleanup;
  }, [linePlans, currentLinePlanId]);

  // PERSISTENCE EFFECTS: Save data when state changes
  useEffect(() => {
    if (linePlans.length > 0) {
      saveLinePlans(linePlans);
    }
  }, [linePlans]);

  useEffect(() => {
    if (currentLinePlanId) {
      saveCurrentLinePlanId(currentLinePlanId);
    }
  }, [currentLinePlanId]);

  useEffect(() => {
    saveCategoryMetricView(categoryMetricView);
  }, [categoryMetricView]);

  useEffect(() => {
    saveStyleMetricView(styleMetricView);
  }, [styleMetricView]);

  // VALIDATION EFFECT: Ensure current selection is valid
  useEffect(() => {
    if (
      !linePlans.find((lp) => lp.id === currentLinePlanId) &&
      linePlans.length > 0
    ) {
      setCurrentLinePlanId(linePlans[0].id);
    }
  }, [linePlans, currentLinePlanId]);

  const [isEditTargetsModalOpen, setIsEditTargetsModalOpen] = useState(false);
  const [activeTargetFilter, setActiveTargetFilter] = useState<string | null>(
    null
  );
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Add calculation functions
  const calculateTotalRevenue = (linePlan: LinePlan) => {
    return (
      linePlan.categories?.reduce(
        (total: number, category: LinePlanCategory) => {
          return (
            total +
            (category.plannedStyles?.reduce(
              (catTotal: number, style: PlannedStyle) => {
                return catTotal + (style.sellingPrice || 0);
              },
              0
            ) || 0)
          );
        },
        0
      ) || 0
    );
  };

  const calculateTotalMargin = (linePlan: LinePlan) => {
    const totalRevenue = calculateTotalRevenue(linePlan);
    if (totalRevenue === 0) return 0;

    const totalCost =
      linePlan.categories?.reduce(
        (total: number, category: LinePlanCategory) => {
          return (
            total +
            (category.plannedStyles?.reduce(
              (catTotal: number, style: PlannedStyle) => {
                return catTotal + (style.costPrice || 0);
              },
              0
            ) || 0)
          );
        },
        0
      ) || 0;

    return (totalRevenue - totalCost) / totalRevenue;
  };

  const calculateTotalSellThrough = (linePlan: LinePlan) => {
    const totalUnits =
      linePlan.categories?.reduce(
        (total: number, category: LinePlanCategory) => {
          return (
            total +
            (category.plannedStyles?.reduce(
              (catTotal: number, style: PlannedStyle) => {
                return catTotal + (style.projectedSellIn || 0);
              },
              0
            ) || 0)
          );
        },
        0
      ) || 0;

    if (totalUnits === 0) return 0;

    const soldUnits =
      linePlan.categories?.reduce(
        (total: number, category: LinePlanCategory) => {
          return (
            total +
            (category.plannedStyles?.reduce(
              (catTotal: number, style: PlannedStyle) => {
                return catTotal + (style.projectedSellThrough || 0);
              },
              0
            ) || 0)
          );
        },
        0
      ) || 0;

    return soldUnits / totalUnits;
  };

  // Add missing state
  const [currentLayout, setCurrentLayout] = useState<LayoutViewOption>("grid");
  const [showCreateProgramForm, setShowCreateProgramForm] = useState(false);
  const [targetsPanelWidth, setTargetsPanelWidth] = useState(300);
  const [open, setOpen] = useState(true);
  const [programName, setProgramName] = useState("");
  const [programSeason, setProgramSeason] = useState("");
  const [programTargetMargin, setProgramTargetMargin] = useState<number | "">(
    ""
  );
  const [programTargetSellThrough, setProgramTargetSellThrough] = useState<
    number | ""
  >("");
  const [programTargetRevenue, setProgramTargetRevenue] = useState<number | "">(
    ""
  );
  const [projects, setProjects] = useState<ProjectFormInput[]>([]);

  // Add missing handlers
  const handleShowComposition = () => {
    // Implement composition view logic
    console.log("Show composition view");
  };

  const handleProgramFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement form submission logic
    console.log("Form submitted");
  };

  const handleCancelCreateProgram = () => {
    setShowCreateProgramForm(false);
  };

  const addProjectField = () => {
    setProjects([
      ...projects,
      {
        name: "",
        targetVolume: "",
        targetRevenue: "",
        targetMargin: "",
        targetSellThrough: "",
      },
    ]);
  };

  const removeProjectField = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleProjectDetailChange = (
    index: number,
    field: keyof ProjectFormInput,
    value: string | number
  ) => {
    const newProjects = [...projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProjects(newProjects);
  };

  // Update handler signatures to match expected types
  const handleUpdateTargets = useCallback(
    (margin: number, sellThrough: number, revenue: number) => {
      setLinePlans((prevLPs) =>
        prevLPs.map((lp) =>
          lp.id === currentLinePlanId
            ? {
                ...lp,
                targetOverallMargin: margin,
                targetOverallSellThrough: sellThrough,
                targetOverallRevenue: revenue,
              }
            : lp
        )
      );
    },
    [currentLinePlanId]
  );

  // Update individual style within a category
  const handleUpdateStyle = useCallback(
    (categoryId: string, updatedStyle: PlannedStyle) => {
      setLinePlans((prevLPs) =>
        prevLPs.map((lp) => {
          if (lp.id === currentLinePlanId) {
            return {
              ...lp,
              categories: lp.categories.map((cat) =>
                cat.id === categoryId
                  ? {
                      ...cat,
                      plannedStyles: cat.plannedStyles.map((s) =>
                        s.id === updatedStyle.id ? updatedStyle : s
                      ),
                    }
                  : cat
              ),
            };
          }
          return lp;
        })
      );
    },
    [currentLinePlanId]
  );

  // Add new style to a category
  const handleAddStyle = useCallback(
    (categoryId: string, newStyle: PlannedStyle) => {
      setLinePlans((prevLPs) =>
        prevLPs.map((lp) => {
          if (lp.id === currentLinePlanId) {
            return {
              ...lp,
              categories: lp.categories.map((cat) =>
                cat.id === categoryId
                  ? { ...cat, plannedStyles: [...cat.plannedStyles, newStyle] }
                  : cat
              ),
            };
          }
          return lp;
        })
      );
    },
    [currentLinePlanId]
  );

  // Pull in carryover style from product catalogue
  const handlePullInStyleAsCarryover = useCallback(
    (targetCategoryId: string, catalogueItem: ProductCatalogueItem) => {
      const targetLinePlan = linePlans.find(
        (lp) => lp.id === currentLinePlanId
      );
      if (!targetLinePlan) return;

      // Create carryover style with updated naming and status
      const newCarryoverStyle: PlannedStyle = updateStyleFinancials(
        {
          id: generateId(),
          name: `${catalogueItem.name} (CO ${catalogueItem.season})`,
          status: PlannedStyleStatus.ACTIVE,
          color: "As Original",
          imageUrl: catalogueItem.imageUrl,
          costPrice: catalogueItem.costPrice,
          sellingPrice: catalogueItem.sellingPrice,
          margin: catalogueItem.margin,
          components: [...catalogueItem.components],
          plmStatus: PLMStatusStage.BRIEFING, // Default status for carryover
        },
        masterComponentsData
      );

      handleAddStyle(targetCategoryId, newCarryoverStyle);
    },
    [handleAddStyle, linePlans, currentLinePlanId]
  );

  const handleInitiateNewDraftProgram = useCallback(() => {
    const newDraftProgram: LinePlan = {
      id: generateId(),
      name: "Untitled Program", // Default name for new drafts
      season: "", // Default empty season
      plmStatus: PLMStatusStage.DRAFT,
      targetOverallMargin: 0.6, // Default target, e.g. 60%
      targetOverallSellThrough: 0.85, // Default target, e.g. 85%
      targetOverallRevenue: 500000, // Default target
      categories: [], // Starts with no projects/categories
    };
    setLinePlans((prevLPs) => [...prevLPs, newDraftProgram]);
    setCurrentLinePlanId(newDraftProgram.id);
    // navigate("/"); // Navigation will occur naturally due to state change and ProgramOverviewPage re-render
  }, []);

  const handleUpdateProgramDetails = useCallback(
    (programId: string, details: ProgramDetailsPayload) => {
      setLinePlans((prevLPs) =>
        prevLPs.map((lp) => {
          if (lp.id === programId) {
            const updatedCategories: LinePlanCategory[] = details.projects.map(
              (project) => ({
                id: generateId(), // Or find existing ones if editing projects is supported
                name: project.name,
                targetVolume: project.targetVolume,
                plannedStyles: [], // Assuming new projects start empty
                targetMetrics: {
                  revenue: project.targetRevenue,
                  margin: project.targetMargin,
                  sellThrough: project.targetSellThrough,
                },
                // plmStatus for categories can be derived or set to a default
              })
            );
            return {
              ...lp,
              name: details.name,
              season: details.season,
              targetOverallMargin: details.targetOverallMargin,
              targetOverallSellThrough: details.targetOverallSellThrough,
              targetOverallRevenue: details.targetOverallRevenue,
              categories: updatedCategories, // Replace categories, or implement merging logic
              plmStatus: PLMStatusStage.PLANNING, // Set status to PLANNING when program details are submitted
            };
          }
          return lp;
        })
      );
    },
    [] // No dependencies, relies on current state via setLinePlans updater
  );

  const handleAddCategory = useCallback(
    (name: string, targetVolume: number) => {
      const newCategory: LinePlanCategory = {
        id: generateId(),
        name,
        targetVolume,
        plannedStyles: [],
        // plmStatus: PLMStatusStage.BRIEFING, // Default status for a new category
      };
      setLinePlans((prevLPs) =>
        prevLPs.map((lp) =>
          lp.id === currentLinePlanId
            ? { ...lp, categories: [...lp.categories, newCategory] }
            : lp
        )
      );
    },
    [currentLinePlanId]
  );

  // Add handlers
  const handleSelectCategory = (category: LinePlanCategory) => {
    // Implement category selection logic
    console.log("Selected category:", category);
  };

  const handleAddNewStyleToCategory = (categoryId: string) => {
    const newStyle: PlannedStyle = {
      id: generateId(),
      name: "New Style",
      color: "#000000",
      sellingPrice: 0,
      costPrice: 0,
      margin: 0,
      status: PlannedStyleStatus.PLACEHOLDER,
      plmStatus: PLMStatusStage.DRAFT,
    };

    setLinePlans((prevPlans) =>
      prevPlans.map((plan) => ({
        ...plan,
        categories: plan.categories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                plannedStyles: [...(category.plannedStyles || []), newStyle],
              }
            : category
        ),
      }))
    );
  };

  const handleCategoryStatusChange = (
    category: LinePlanCategory,
    status: string
  ) => {
    // Implement status change logic
    console.log("Changing status for category:", category, "to:", status);
  };

  // Add render functions for the targets and product lines sections
  const renderTargetsSectionContent = (
    layout: LayoutViewOption
  ): React.ReactElement | null => {
    if (!currentLinePlan) return null;
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
          {/* Revenue Card */}
          <MetricDisplayCard
            title="Revenue"
            target={currentLinePlan.targetOverallRevenue}
            current={calculateTotalRevenue(currentLinePlan)}
            unit="$"
            icon={<CurrencyDollarIcon className="w-5 h-5" />}
          />
          {/* Margin Card */}
          <MetricDisplayCard
            title="Margin"
            target={currentLinePlan.targetOverallMargin * 100}
            current={calculateTotalMargin(currentLinePlan) * 100}
            unit="%"
            icon={<ScaleIcon className="w-5 h-5" />}
          />
          {/* Sell-Through Card */}
          <MetricDisplayCard
            title="Sell-Through"
            target={currentLinePlan.targetOverallSellThrough * 100}
            current={calculateTotalSellThrough(currentLinePlan) * 100}
            unit="%"
            icon={<ScaleIcon className="w-5 h-5" />}
          />
        </div>
      </div>
    );
  };

  const renderProductLinesSectionContent = (
    layout: LayoutViewOption
  ): React.ReactElement | null => {
    if (!currentLinePlan?.categories?.length) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="mb-4 text-gray-500">No categories yet</p>
          <Button onClick={() => setIsAddCategoryModalOpen(true)}>
            Add Category
          </Button>
        </div>
      );
    }
    return (
      <div className="grid gap-4">
        {currentLinePlan.categories.map((category) => (
          <ProductLineCategoryCard
            key={category.id}
            category={category}
            onSelectCategory={() => handleSelectCategory(category)}
            onAddNewStyle={() => handleAddNewStyleToCategory(category.id)}
            activeTargetFilter={activeTargetFilter}
            targetOverallMargin={currentLinePlan.targetOverallMargin}
            season={currentLinePlan.season}
            displayMode={currentLayout as any}
            metricViewStyle={categoryMetricView as any}
            userRole={UserRole.MERCHANT}
            onStatusChange={(cat, status) =>
              handleCategoryStatusChange(cat, status)
            }
          />
        ))}
      </div>
    );
  };

  return (
    <Layout linePlanName={currentLinePlan?.name}>
      <Routes>
        <Route
          path="/"
          element={
            <ProgramOverviewPage
              key={currentLinePlan?.id || "no-plan"}
              linePlans={linePlans}
              currentLinePlan={currentLinePlan}
              setCurrentLinePlanId={setCurrentLinePlanId}
              onUpdateTargets={handleUpdateTargets}
              onPullInStyle={handlePullInStyleAsCarryover}
              onAddCategory={handleAddCategory}
              categoryMetricView={categoryMetricView}
              setLinePlans={setLinePlans}
              onInitiateNewDraftProgram={handleInitiateNewDraftProgram}
              onUpdateProgramDetails={handleUpdateProgramDetails}
              currentLayout={currentLayout}
              setCurrentLayout={setCurrentLayout}
              showCreateProgramForm={showCreateProgramForm}
              setShowCreateProgramForm={setShowCreateProgramForm}
              targetsPanelWidth={targetsPanelWidth}
              open={open}
              renderTargetsSectionContent={renderTargetsSectionContent}
              renderProductLinesSectionContent={
                renderProductLinesSectionContent
              }
              handleShowComposition={handleShowComposition}
              programName={programName}
              setProgramName={setProgramName}
              programSeason={programSeason}
              setProgramSeason={setProgramSeason}
              programTargetMargin={programTargetMargin}
              setProgramTargetMargin={setProgramTargetMargin}
              programTargetSellThrough={programTargetSellThrough}
              setProgramTargetSellThrough={setProgramTargetSellThrough}
              programTargetRevenue={programTargetRevenue}
              setProgramTargetRevenue={setProgramTargetRevenue}
              handleProgramFormSubmit={handleProgramFormSubmit}
              handleCancelCreateProgram={handleCancelCreateProgram}
              projects={projects}
              addProjectField={addProjectField}
              removeProjectField={removeProjectField}
              handleProjectDetailChange={handleProjectDetailChange}
            />
          }
        />
        <Route
          path="/category/:categoryId"
          element={
            <CategoryDetailPage
              categories={currentLinePlan?.categories || []}
              targetOverallMargin={currentLinePlan?.targetOverallMargin || 0}
              onUpdateStyle={handleUpdateStyle}
              onAddStyle={handleAddStyle}
              styleMetricView={styleMetricView}
              setStyleMetricView={setStyleMetricView}
            />
          }
        />
      </Routes>
    </Layout>
  );
};

export default App;
