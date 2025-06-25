import React from "react";
import { BulletGraph } from "./BulletGraph";
import { cn } from "@/utils";
import { LinePlanCategory, PlannedStyle } from "@/types";

import { getMetricStatus, getMetricColor } from "@/utils/metricCalculations";

interface MetricBulletCardProps {
  title: string;
  target: number;
  current: number;
  unit: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  showDelta?: boolean;
  relatedCategories?: LinePlanCategory[];
  relatedProducts?: PlannedStyle[];
  onCategorySelect?: (category: LinePlanCategory) => void;
  onProductSelect?: (product: PlannedStyle) => void;
  isProjectLevel?: boolean;
}

export const MetricBulletCard: React.FC<MetricBulletCardProps> = ({
  title,
  target,
  current,
  unit,
  icon,
  className,
  onClick,
  isActive,
  showDelta = true,
}) => {
  // Calculate progress and status

  const deltaPercent = target === 0 ? 0 : ((current - target) / target) * 100;

  // Determine metric type from title
  const getMetricType = (
    title: string
  ): "revenue" | "margin" | "sell-in" | "sell-through" => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("revenue")) return "revenue";
    if (lowerTitle.includes("margin")) return "margin";
    if (lowerTitle.includes("sell-in")) return "sell-in";
    if (lowerTitle.includes("sell-through")) return "sell-through";
    return "revenue"; // default
  };

  const metricType = getMetricType(title);
  const status = getMetricStatus(current, target);
  const colors = getMetricColor(metricType, status);

  // Format display value
  const formatValue = (value: number) => {
    if (unit === "$M") {
      return `$${value.toFixed(1)}M`;
    } else if (unit === "%") {
      return `${value.toFixed(1)}%`;
    } else if (unit.toLowerCase().includes("k")) {
      return `${value.toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })}K`;
    } else {
      return value.toLocaleString();
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg p-4 flex flex-col gap-0 relative transition-colors duration-200 border border-gray-200",
        isActive && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      {/* Title row with icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className="text-gray-500">{icon}</div>}
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        {showDelta && (
          <div className={`text-xs font-medium ${colors.text}`}>
            {deltaPercent >= 0 ? "+" : ""}
            {deltaPercent.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Values */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-semibold ${colors.text}`}>
            {formatValue(current)}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            / {formatValue(target)}
          </span>
        </div>
      </div>

      {/* Bullet Graph */}
      <BulletGraph
        current={current}
        target={target}
        barColor={colors.bar}
        className="mt-1"
      />
    </div>
  );
};
