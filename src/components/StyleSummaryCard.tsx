import React from "react";
import { PlannedStyle, StyleMetricViewOption } from "../types";
import { ArrowUpRightIcon, ArrowDownLeftIcon, MinusSmallIcon } from "./icons";

interface StyleSummaryCardProps {
  style: PlannedStyle;
  categoryTargetMargin: number;
  metricViewStyle?: StyleMetricViewOption;
}

const StyleSummaryCard: React.FC<StyleSummaryCardProps> = ({
  style,
  categoryTargetMargin,
  metricViewStyle = "current",
}) => {
  let marginColorName = "slate";
  let marginTextColorClass = "text-slate-600";
  let MarginStatusIcon = <MinusSmallIcon className="w-3 h-3 text-slate-500" />;

  if (style.margin < categoryTargetMargin * 0.85) {
    marginColorName = "red";
    marginTextColorClass = "text-red-600";
    MarginStatusIcon = <ArrowDownLeftIcon className="w-3 h-3 text-red-500" />;
  } else if (style.margin < categoryTargetMargin) {
    marginColorName = "amber";
    marginTextColorClass = "text-amber-600";
    MarginStatusIcon = <MinusSmallIcon className="w-3 h-3 text-amber-500" />;
  } else {
    marginColorName = "green";
    marginTextColorClass = "text-green-600";
    MarginStatusIcon = <ArrowUpRightIcon className="w-3 h-3 text-green-500" />;
  }

  const marginPercent = style.margin * 100;

  const renderMargin = () => {
    switch (metricViewStyle) {
      case "dataBar":
        const barWidth = Math.max(
          0,
          Math.min(100, (style.margin / (categoryTargetMargin * 1.2)) * 100)
        );
        return (
          <div className="flex items-center text-xs">
            <span className={`mr-1.5 font-semibold ${marginTextColorClass}`}>
              {marginPercent.toFixed(1)}%
            </span>
            <div className="w-10 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-${marginColorName}-400`}
                style={{ width: `${barWidth}%` }}
              ></div>
            </div>
          </div>
        );
      case "chip":
        return (
          <span
            className={`px-1.5 py-0.5 rounded-full text-2xs font-medium bg-${marginColorName}-100 text-${marginColorName}-700`}
          >
            {marginPercent.toFixed(1)}%
          </span>
        );
      case "current":
      default:
        return (
          <div
            className={`text-xs font-semibold flex items-center ${marginTextColorClass}`}
          >
            {MarginStatusIcon}
            <span className="ml-1">{(style.margin * 100).toFixed(1)}%</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium text-slate-800">{style.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            {style.status} • {style.color}
          </p>
        </div>
        {renderMargin()}
      </div>
    </div>
  );
};

export default StyleSummaryCard;
