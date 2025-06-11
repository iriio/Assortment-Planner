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
import { Routes, Route } from "react-router-dom";
import ProgramOverviewPage from "./pages/ProgramOverviewPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import { initialLinePlan } from "./data/index";
import {
  PLMStatusStage,
  LinePlan,
  LinePlanCategory,
  PlannedStyle,
  ProjectCreationInput,
  GlobalMetricViewOption,
  CategoryMetricViewOption,
  StyleMetricViewOption,
} from "@/types/index";
import {
  saveLinePlans,
  loadLinePlans,
  saveCurrentLinePlanId,
  loadCurrentLinePlanId,
  saveCategoryMetricView,
  saveStyleMetricView,
  loadStyleMetricView,
  enableAutoSave,
  migrateData,
} from "./utils/localStorage";
import { generateId } from "./services/planningService";

interface ProgramDetailsPayload {
  name: string;
  season: string;
  targetOverallMargin: number;
  targetOverallSellThrough: number;
  targetOverallRevenue: number;
  projects: ProjectCreationInput[];
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">
            Something went wrong
          </h2>
          <p className="text-red-600">{this.state.error?.message}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  // GLOBAL STATE: Line plans with localStorage initialization
  const [linePlans, setLinePlans] = useState<LinePlan[]>(() => {
    const savedPlans = loadLinePlans();
    console.log("Loaded line plans:", savedPlans);
    return savedPlans.length > 0 ? savedPlans : [initialLinePlan];
  });

  // CURRENT SELECTION: Active line plan with validation
  const [currentLinePlanId, setCurrentLinePlanId] = useState<string>(() => {
    const savedId = loadCurrentLinePlanId();
    console.log("Loaded current line plan ID:", savedId);
    // Validate that the saved ID exists in the line plans
    const validId =
      savedId && linePlans.some((lp) => lp.id === savedId)
        ? savedId
        : linePlans[0]?.id || initialLinePlan.id;
    console.log("Using line plan ID:", validId);
    return validId;
  });

  // UI PREFERENCES: Metric display options with localStorage persistence
  const [globalMetricView, setGlobalMetricView] =
    useState<GlobalMetricViewOption>("bullet");
  const [categoryMetricView, setCategoryMetricView] =
    useState<CategoryMetricViewOption>("current");
  const [styleMetricView] = useState<StyleMetricViewOption>(() =>
    loadStyleMetricView("current")
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
  }, []);

  const handleUpdateProgramDetails = useCallback(
    (programId: string, details: ProgramDetailsPayload) => {
      setLinePlans((prevLPs) =>
        prevLPs.map((lp) => {
          if (lp.id === programId) {
            const updatedCategories: LinePlanCategory[] = details.projects.map(
              (project) => ({
                id: generateId(),
                name: project.name,
                targetVolume: project.targetVolume,
                plannedStyles: [],
                targetMetrics: {
                  revenue: project.targetRevenue,
                  margin: project.targetMargin,
                  sellThrough: project.targetSellThrough,
                },
              })
            );
            return {
              ...lp,
              name: details.name,
              season: details.season,
              targetOverallMargin: details.targetOverallMargin,
              targetOverallSellThrough: details.targetOverallSellThrough,
              targetOverallRevenue: details.targetOverallRevenue,
              categories: updatedCategories,
              plmStatus: PLMStatusStage.PLANNING,
            };
          }
          return lp;
        })
      );
    },
    []
  );

  const handleAddCategory = useCallback(() => {
    // Implement category addition logic
    console.log("Adding new category");
  }, []);

  return (
    <ErrorBoundary>
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
              onAddCategory={handleAddCategory}
              globalMetricView={globalMetricView}
              setGlobalMetricView={setGlobalMetricView}
              categoryMetricView={categoryMetricView}
              setCategoryMetricView={setCategoryMetricView}
              setLinePlans={setLinePlans}
              onInitiateNewDraftProgram={handleInitiateNewDraftProgram}
              onUpdateProgramDetails={handleUpdateProgramDetails}
            />
          }
        />
        <Route
          path="/category/:categoryId"
          element={
            <CategoryDetailPage
              linePlans={linePlans}
              currentLinePlan={currentLinePlan}
              setLinePlans={setLinePlans}
              onUpdateStyle={handleUpdateStyle}
              onAddStyle={handleAddStyle}
              onCategoryStatusChange={() => {}}
              styleMetricView={styleMetricView}
            />
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
