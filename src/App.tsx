import React, { useState, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProgramOverviewPage from "./pages/ProgramOverviewPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import { initialLinePlan, masterComponentsData } from "./data";
import {
  LinePlan,
  PlannedStyle,
  ProductCatalogueItem,
  PlannedStyleStatus,
  LinePlanCategory as LinePlanCategoryType,
  GlobalMetricViewOption,
  CategoryMetricViewOption,
  StyleMetricViewOption,
} from "./types";
import { updateStyleFinancials, generateId } from "./services/planningService";

const App: React.FC = () => {
  const [linePlans, setLinePlans] = useState<LinePlan[]>([initialLinePlan]);
  const [currentLinePlanId, setCurrentLinePlanId] = useState<string>(
    initialLinePlan.id
  );
  const navigate = useNavigate();

  const [globalMetricView] = useState<GlobalMetricViewOption>("bullet");
  const [categoryMetricView, setCategoryMetricView] =
    useState<CategoryMetricViewOption>("current");
  const [styleMetricView, setStyleMetricView] =
    useState<StyleMetricViewOption>("current");

  const currentLinePlan =
    linePlans.find((lp) => lp.id === currentLinePlanId) || linePlans[0];

  useEffect(() => {
    if (
      !linePlans.find((lp) => lp.id === currentLinePlanId) &&
      linePlans.length > 0
    ) {
      setCurrentLinePlanId(linePlans[0].id);
    }
  }, [linePlans, currentLinePlanId]);

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

  const handlePullInStyleAsCarryover = useCallback(
    (targetCategoryId: string, catalogueItem: ProductCatalogueItem) => {
      const targetLinePlan = linePlans.find(
        (lp) => lp.id === currentLinePlanId
      );
      if (!targetLinePlan) return;

      const targetCategory = targetLinePlan.categories.find(
        (c) => c.id === targetCategoryId
      );
      const newCarryoverStyle: PlannedStyle = updateStyleFinancials(
        {
          id: generateId(),
          name: `${catalogueItem.name} (CO ${catalogueItem.season})`,
          status: PlannedStyleStatus.CARRYOVER,
          sourceStyleId: catalogueItem.id,
          color: "As Original",
          imageUrl: catalogueItem.imageUrl,
          costPrice: catalogueItem.costPrice,
          sellingPrice: catalogueItem.sellingPrice,
          margin: catalogueItem.margin,
          components: [...catalogueItem.components],
          notes: `Carryover from ${catalogueItem.season}. Original margin: ${(
            catalogueItem.margin * 100
          ).toFixed(1)}%. Added to ${targetCategory?.name || "category"}.`,
        },
        masterComponentsData
      );

      handleAddStyle(targetCategoryId, newCarryoverStyle);
    },
    [handleAddStyle, linePlans, currentLinePlanId]
  );

  const handleCreateProgram = useCallback(
    (
      name: string,
      season: string,
      targetMargin: number,
      targetSellThrough: number,
      targetRevenue: number
    ) => {
      const newProgram: LinePlan = {
        id: generateId(),
        name,
        season,
        targetOverallMargin: targetMargin / 100,
        targetOverallSellThrough: targetSellThrough / 100,
        targetOverallRevenue: targetRevenue,
        categories: [],
        trends: initialLinePlan.trends, // Default trends for now
      };
      setLinePlans((prevLPs) => [...prevLPs, newProgram]);
      setCurrentLinePlanId(newProgram.id);
      navigate("/"); // Navigate to the overview of the new program
    },
    [navigate]
  );

  const handleAddCategory = useCallback(
    (name: string, targetVolume: number) => {
      const newCategory: LinePlanCategoryType = {
        id: generateId(),
        name,
        targetVolume,
        plannedStyles: [],
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

  if (!currentLinePlan) {
    if (linePlans.length > 0 && !currentLinePlanId) {
      setCurrentLinePlanId(linePlans[0].id);
      return <div>Loading default plan...</div>;
    }
    return <div>No line plan selected or available. Create a new program.</div>;
  }

  return (
    <Layout linePlanName={currentLinePlan.name}>
      <Routes>
        <Route
          path="/"
          element={
            <ProgramOverviewPage
              linePlans={linePlans}
              currentLinePlan={currentLinePlan}
              setCurrentLinePlanId={setCurrentLinePlanId}
              onUpdateTargets={handleUpdateTargets}
              onPullInStyle={handlePullInStyleAsCarryover}
              onCreateProgram={handleCreateProgram}
              onAddCategory={handleAddCategory}
              globalMetricView={globalMetricView}
              setGlobalMetricView={() => {}}
              categoryMetricView={categoryMetricView}
              setCategoryMetricView={setCategoryMetricView}
              setLinePlans={setLinePlans}
            />
          }
        />
        <Route
          path="/category/:categoryId"
          element={
            <CategoryDetailPage
              categories={currentLinePlan.categories}
              targetOverallMargin={currentLinePlan.targetOverallMargin}
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
