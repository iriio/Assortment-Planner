export interface LinePlanStyle {
  id: string;
  name: string;
  revenue?: number;
  cost?: number;
  units?: number;
  soldUnits?: number;
}

export interface LinePlanCategory {
  id: string;
  name: string;
  styles?: LinePlanStyle[];
}

export interface LinePlan {
  id: string;
  name: string;
  season: string;
  targetOverallRevenue: number;
  targetOverallMargin: number;
  targetOverallSellThrough: number;
  categories?: LinePlanCategory[];
}
