import {
  LinePlan,
  CategoryMetricViewOption,
  StyleMetricViewOption,
} from "../types";

// Storage keys
const STORAGE_KEYS = {
  LINE_PLANS: "assortment_planner_line_plans",
  CURRENT_LINE_PLAN_ID: "assortment_planner_current_line_plan_id",
  CATEGORY_METRIC_VIEW: "assortment_planner_category_metric_view",
  STYLE_METRIC_VIEW: "assortment_planner_style_metric_view",
  UI_PREFERENCES: "assortment_planner_ui_preferences",
} as const;

// UI Preferences interface
export interface UIPreferences {
  sidebarCollapsed?: boolean;
  targetsPanelWidth?: number;
  currentLayout?: "standard" | "compactList" | "wideView";
  lastActiveFilters?: any;
}

// Generic localStorage wrapper with error handling
class LocalStorageManager {
  private isAvailable(): boolean {
    try {
      const testKey = "__localStorage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      console.warn("localStorage is not available, using default value");
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  public setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      console.warn("localStorage is not available, cannot save data");
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  public removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }

  public clear(): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  }
}

const storageManager = new LocalStorageManager();

// Line Plans operations
export const saveLinePlans = (linePlans: LinePlan[]): boolean => {
  return storageManager.setItem(STORAGE_KEYS.LINE_PLANS, linePlans);
};

export const loadLinePlans = (defaultValue: LinePlan[] = []): LinePlan[] => {
  return storageManager.getItem(STORAGE_KEYS.LINE_PLANS, defaultValue);
};

// Current Line Plan ID operations
export const saveCurrentLinePlanId = (id: string): boolean => {
  return storageManager.setItem(STORAGE_KEYS.CURRENT_LINE_PLAN_ID, id);
};

export const loadCurrentLinePlanId = (defaultValue: string = ""): string => {
  return storageManager.getItem(
    STORAGE_KEYS.CURRENT_LINE_PLAN_ID,
    defaultValue
  );
};

// Metric view preferences
export const saveCategoryMetricView = (
  view: CategoryMetricViewOption
): boolean => {
  return storageManager.setItem(STORAGE_KEYS.CATEGORY_METRIC_VIEW, view);
};

export const loadCategoryMetricView = (
  defaultValue: CategoryMetricViewOption = "current"
): CategoryMetricViewOption => {
  return storageManager.getItem(
    STORAGE_KEYS.CATEGORY_METRIC_VIEW,
    defaultValue
  );
};

export const saveStyleMetricView = (view: StyleMetricViewOption): boolean => {
  return storageManager.setItem(STORAGE_KEYS.STYLE_METRIC_VIEW, view);
};

export const loadStyleMetricView = (
  defaultValue: StyleMetricViewOption = "current"
): StyleMetricViewOption => {
  return storageManager.getItem(STORAGE_KEYS.STYLE_METRIC_VIEW, defaultValue);
};

// UI Preferences operations
export const saveUIPreferences = (preferences: UIPreferences): boolean => {
  return storageManager.setItem(STORAGE_KEYS.UI_PREFERENCES, preferences);
};

export const loadUIPreferences = (
  defaultValue: UIPreferences = {}
): UIPreferences => {
  return storageManager.getItem(STORAGE_KEYS.UI_PREFERENCES, defaultValue);
};

// Utility function to save specific UI preference
export const saveUIPreference = <K extends keyof UIPreferences>(
  key: K,
  value: UIPreferences[K]
): boolean => {
  const currentPreferences = loadUIPreferences();
  return saveUIPreferences({
    ...currentPreferences,
    [key]: value,
  });
};

// Auto-save functionality
export const enableAutoSave = (
  getLinePlans: () => LinePlan[],
  getCurrentLinePlanId: () => string,
  intervalMs: number = 5000 // Auto-save every 5 seconds
): (() => void) => {
  const interval = setInterval(() => {
    const linePlans = getLinePlans();
    const currentId = getCurrentLinePlanId();

    if (linePlans.length > 0) {
      saveLinePlans(linePlans);
    }

    if (currentId) {
      saveCurrentLinePlanId(currentId);
    }
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
};

// Data migration utilities (for future updates)
export const migrateData = (version: string = "1.0.0"): void => {
  const currentVersion = storageManager.getItem("data_version", "1.0.0");

  if (currentVersion === version) {
    return; // No migration needed
  }

  // Future migration logic would go here
  console.log(`Migrating data from version ${currentVersion} to ${version}`);

  storageManager.setItem("data_version", version);
};

// Export utilities for debugging/development
export const clearAllData = (): boolean => {
  console.warn("Clearing all assortment planner data from localStorage");
  return (
    storageManager.removeItem(STORAGE_KEYS.LINE_PLANS) &&
    storageManager.removeItem(STORAGE_KEYS.CURRENT_LINE_PLAN_ID) &&
    storageManager.removeItem(STORAGE_KEYS.CATEGORY_METRIC_VIEW) &&
    storageManager.removeItem(STORAGE_KEYS.STYLE_METRIC_VIEW) &&
    storageManager.removeItem(STORAGE_KEYS.UI_PREFERENCES)
  );
};

export const exportData = (): string => {
  const data = {
    linePlans: loadLinePlans(),
    currentLinePlanId: loadCurrentLinePlanId(),
    categoryMetricView: loadCategoryMetricView(),
    styleMetricView: loadStyleMetricView(),
    uiPreferences: loadUIPreferences(),
    exportedAt: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);

    if (data.linePlans) saveLinePlans(data.linePlans);
    if (data.currentLinePlanId) saveCurrentLinePlanId(data.currentLinePlanId);
    if (data.categoryMetricView)
      saveCategoryMetricView(data.categoryMetricView);
    if (data.styleMetricView) saveStyleMetricView(data.styleMetricView);
    if (data.uiPreferences) saveUIPreferences(data.uiPreferences);

    return true;
  } catch (error) {
    console.error("Error importing data:", error);
    return false;
  }
};
