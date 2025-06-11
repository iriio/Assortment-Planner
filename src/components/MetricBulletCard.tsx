import React from "react";
import { BulletGraph } from "./BulletGraph";
import { cn } from "@/utils";

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
}

// Helper to pick color based on metric type or status
const getBarColor = (title: string, status: "over" | "near" | "under") => {
  if (
    title.toLowerCase().includes("revenue") ||
    title.toLowerCase().includes("margin")
  ) {
    return status === "under" ? "bg-amber-500" : "bg-green-500";
  }
  if (title.toLowerCase().includes("sell-in")) {
    return status === "under" ? "bg-amber-500" : "bg-blue-500";
  }
  if (title.toLowerCase().includes("sell-through")) {
    return status === "under" ? "bg-amber-500" : "bg-green-500";
  }
  return status === "under" ? "bg-amber-500" : "bg-blue-500";
};

const getValueColor = (status: "over" | "near" | "under") => {
  if (status === "over") return "text-green-600";
  if (status === "near") return "text-gray-900";
  if (status === "under") return "text-amber-600";
  return "text-gray-900";
};

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
  const progress = target === 0 ? 0 : (current / target) * 100;
  const deltaPercent = target === 0 ? 0 : ((current - target) / target) * 100;

  // Determine status
  let status: "over" | "near" | "under";
  if (progress >= 105) {
    status = "over";
  } else if (progress >= 95) {
    status = "near";
  } else {
    status = "under";
  }

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

  // Get colors based on status
  const barColor = getBarColor(title, status);
  const valueColor = getValueColor(status);

  return (
    <div
      className={cn(
        "bg-white rounded-lg p-4 flex flex-col gap-2.5 relative transition-colors duration-200  border-black",
        isActive && "ring-2 ring-primary",
        className
      )}
      onClick={onClick}
    >
      {/* Title row with icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="text-gray-500">{icon}</div>}
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        {showDelta && (
          <div className={`text-xs font-medium ${valueColor}`}>
            {deltaPercent >= 0 ? "+" : ""}
            {deltaPercent.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Values */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-semibold ${valueColor}`}>
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
        barColor={barColor}
        className="mt-1"
      />
    </div>
  );
};
