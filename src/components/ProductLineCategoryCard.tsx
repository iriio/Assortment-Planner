import React from "react";
import {
  LinePlanCategory,
  CategoryMetricViewOption,
  PlannedStyleStatus,
} from "../types";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ArrowUpRightIcon,
  CollectionIcon,
  EllipsisVerticalIcon,
} from "./icons";

interface ProductLineCategoryCardProps {
  category: LinePlanCategory;
  onSelectCategory: (categoryId: string) => void;
  onAddNewStyle: (categoryId: string) => void;
  activeTargetFilter: { type: string; displayName: string } | null;
  targetOverallMargin: number;
  season: string;
  displayMode?: "grid" | "list";
  metricViewStyle?: CategoryMetricViewOption;
}

const ProductLineCategoryCard: React.FC<ProductLineCategoryCardProps> = ({
  category,
  onSelectCategory,
  onAddNewStyle,
  activeTargetFilter,
  targetOverallMargin,
  season,
  displayMode = "grid",
  metricViewStyle = "current",
}) => {
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

  const avgSellThrough =
    category.plannedStyles.length > 0
      ? category.plannedStyles.reduce(
          (sum, style) => sum + (style.projectedSellThrough || 0),
          0
        ) / category.plannedStyles.length
      : 0;

  let cardBorderClass = "border-slate-200";
  let statusColorName = "slate";

  const getMetricStatus = () => {
    if (!activeTargetFilter) return null;

    let status: {
      message: string;
      color: string;
      icon: React.ReactElement;
    } | null = null;

    switch (activeTargetFilter.type) {
      case "margin":
        if (avgCategoryMargin < targetOverallMargin * 0.85) {
          status = {
            message: "Below Target",
            color: "red",
            icon: (
              <ExclamationTriangleIcon className="w-3 h-3 mr-1 text-red-600" />
            ),
          };
        } else if (avgCategoryMargin < targetOverallMargin) {
          status = {
            message: "Near Target",
            color: "amber",
            icon: <ArrowUpRightIcon className="w-3 h-3 mr-1 text-amber-600" />,
          };
        } else {
          status = {
            message: "On Target",
            color: "green",
            icon: (
              <CheckBadgeIcon className="w-3.5 h-3.5 mr-1 text-green-600" />
            ),
          };
        }
        break;
      case "revenue":
        if (totalRevenue < 100000) {
          status = {
            message: "Below Target",
            color: "red",
            icon: (
              <ExclamationTriangleIcon className="w-3 h-3 mr-1 text-red-600" />
            ),
          };
        } else if (totalRevenue < 200000) {
          status = {
            message: "Near Target",
            color: "amber",
            icon: <ArrowUpRightIcon className="w-3 h-3 mr-1 text-amber-600" />,
          };
        } else {
          status = {
            message: "On Target",
            color: "green",
            icon: (
              <CheckBadgeIcon className="w-3.5 h-3.5 mr-1 text-green-600" />
            ),
          };
        }
        break;
      case "sellin":
        const totalProjectedSellIn = category.plannedStyles.reduce(
          (sum, style) => sum + (style.projectedSellIn || 0),
          0
        );
        if (category.plannedStyles.length === 0) {
          status = {
            message: "Below Target",
            color: "red",
            icon: (
              <ExclamationTriangleIcon className="w-3 h-3 mr-1 text-red-600" />
            ),
          };
        } else if (totalProjectedSellIn < category.targetVolume * 0.85) {
          status = {
            message: "Near Target",
            color: "amber",
            icon: <ArrowUpRightIcon className="w-3 h-3 mr-1 text-amber-600" />,
          };
        } else {
          status = {
            message: "On Target",
            color: "green",
            icon: (
              <CheckBadgeIcon className="w-3.5 h-3.5 mr-1 text-green-600" />
            ),
          };
        }
        break;
      case "sellthrough":
        if (avgSellThrough < 0.7) {
          status = {
            message: "Below Target",
            color: "red",
            icon: (
              <ExclamationTriangleIcon className="w-3 h-3 mr-1 text-red-600" />
            ),
          };
        } else if (avgSellThrough < 0.85) {
          status = {
            message: "Near Target",
            color: "amber",
            icon: <ArrowUpRightIcon className="w-3 h-3 mr-1 text-amber-600" />,
          };
        } else {
          status = {
            message: "On Target",
            color: "green",
            icon: (
              <CheckBadgeIcon className="w-3.5 h-3.5 mr-1 text-green-600" />
            ),
          };
        }
        break;
    }

    if (status) {
      cardBorderClass = `border-${status.color}-300 ring-1 ring-${status.color}-200 bg-${status.color}-50/50`;
      statusColorName = status.color;
    }

    return status;
  };

  const status = getMetricStatus();
  const baseCardClasses = `bg-white rounded-xl shadow-lg border transition-all group hover:shadow-xl hover:border-slate-300/70 ${
    status && status.color !== "green" ? cardBorderClass : "border-slate-200"
  }`;

  const marginText = `${(avgCategoryMargin * 100).toFixed(1)}% / ${(
    targetOverallMargin * 100
  ).toFixed(1)}%`;

  const renderMetricValue = () => {
    if (!activeTargetFilter) {
      return marginText;
    }

    switch (activeTargetFilter.type) {
      case "margin":
        return marginText;
      case "revenue":
        return `$${(totalRevenue / 1000).toFixed(1)}K`;
      case "sellin":
        const totalProjectedSellIn = category.plannedStyles.reduce(
          (sum, style) => sum + (style.projectedSellIn || 0),
          0
        );
        return `${(totalProjectedSellIn / 1000).toFixed(1)}K / ${(
          category.targetVolume / 1000
        ).toFixed(1)}K`;
      case "sellthrough":
        return `${(avgSellThrough * 100).toFixed(1)}%`;
      default:
        return marginText;
    }
  };

  const renderMarginMetric = () => {
    const marginColorClassText = `text-${statusColorName}-600`;
    const barFillClass = `bg-${statusColorName}-500`;
    let barWidth = "w-full";
    let statusIcon = null;

    if (!activeTargetFilter || activeTargetFilter.type === "margin") {
      if (avgCategoryMargin < targetOverallMargin * 0.85) {
        statusIcon = (
          <ExclamationTriangleIcon className="w-3.5 h-3.5 ml-1 text-red-500" />
        );
        barWidth = "w-1/3"; // Low
      } else if (avgCategoryMargin < targetOverallMargin) {
        statusIcon = (
          <ArrowUpRightIcon className="w-3.5 h-3.5 ml-1 text-amber-500" />
        );
        barWidth = "w-2/3"; // Medium
      } else {
        statusIcon = (
          <CheckBadgeIcon className="w-3.5 h-3.5 ml-1 text-green-500" />
        );
        barWidth = "w-full"; // High
      }
    } else {
      statusIcon = status?.icon;
      switch (activeTargetFilter.type) {
        case "revenue":
          barWidth =
            totalRevenue < 100000
              ? "w-1/3"
              : totalRevenue < 200000
              ? "w-2/3"
              : "w-full";
          break;
        case "sellin":
          const totalProjectedSellIn = category.plannedStyles.reduce(
            (sum, style) => sum + (style.projectedSellIn || 0),
            0
          );
          barWidth =
            totalProjectedSellIn < category.targetVolume * 0.85
              ? "w-1/3"
              : "w-2/3";
          break;
        case "sellthrough":
          barWidth =
            avgSellThrough < 0.7
              ? "w-1/3"
              : avgSellThrough < 0.85
              ? "w-2/3"
              : "w-full";
          break;
      }
    }

    switch (metricViewStyle) {
      case "miniBullet":
      case "statusBar":
        return (
          <div className="mt-1.5">
            <div
              className={`text-xs font-semibold flex items-center ${marginColorClassText}`}
            >
              {renderMetricValue()} {statusIcon}
            </div>
            <div className="h-1 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${barFillClass} ${barWidth}`}
              ></div>
            </div>
          </div>
        );
      case "current":
      default:
        return (
          <div
            className={`text-sm font-semibold flex items-center mt-1 ${marginColorClassText}`}
          >
            {renderMetricValue()}
            {statusIcon}
          </div>
        );
    }
  };

  if (displayMode === "list") {
    return (
      <div
        className={`${baseCardClasses} p-3.5 flex items-center space-x-4 transform hover:-translate-y-0.5 duration-150 ease-out relative`}
        onClick={() => onSelectCategory(category.id)}
        role="button"
        tabIndex={0}
      >
        <div className="flex-shrink-0">
          {category.plannedStyles[0]?.imageUrl ? (
            <img
              src={category.plannedStyles[0].imageUrl}
              alt={category.name}
              className="w-16 h-16 object-cover rounded-lg shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
              <CollectionIcon className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start">
            <h4
              className="text-sm font-semibold text-sky-700 group-hover:text-sky-600 transition-colors cursor-pointer truncate max-w-[70%]"
              title={category.name}
            >
              {category.name}
            </h4>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNewStyle(category.id);
                }}
                className="text-slate-400 hover:text-sky-600 p-1.5 rounded-full hover:bg-sky-100 transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Add new style"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="More options"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {season} ({category.plannedStyles.length} styles)
          </div>
          {category.plannedStyles.length > 0 && renderMarginMetric()}
        </div>
        {status && (
          <div
            className={`absolute bottom-3.5 right-3.5 text-[11px] font-medium inline-flex items-center py-1 px-2.5 rounded-md shadow-md border transition-all duration-150
              ${
                status.color === "red"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : status.color === "amber"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
          >
            {status.icon}
            <span className="font-semibold tracking-wide ml-1">
              {status.message}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer aspect-square flex flex-col overflow-hidden`}
      onClick={() => onSelectCategory(category.id)}
      role="button"
      tabIndex={0}
    >
      {/* Image grid container: flex-1 to take space, min-h-0 to allow shrinking, overflow-hidden to clip, p-3 for padding */}
      <div className="p-3 flex-1 min-h-0 overflow-hidden">
        {/* Grid fills this padded container */}
        <div className="grid grid-cols-3 gap-1.5 h-full">
          {/* First column - Large image (2/3 width, full height) */}
          <div className="col-span-2 h-full overflow-hidden rounded-md">
            {category.plannedStyles[0] ? (
              category.plannedStyles[0].status ===
              PlannedStyleStatus.PLACEHOLDER ? (
                <div className="bg-slate-50 rounded-md h-full flex flex-col items-center justify-center text-center p-2 border-2 border-dashed border-slate-200 hover:border-sky-200 transition-colors">
                  <div className="w-10 h-10 mb-1 rounded-full bg-slate-100 flex items-center justify-center">
                    <CollectionIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 line-clamp-2 text-center">
                    {category.plannedStyles[0].name}
                  </span>
                </div>
              ) : (
                <div className="rounded-md overflow-hidden bg-slate-100 h-full">
                  <img
                    src={category.plannedStyles[0].imageUrl || ""}
                    alt={category.plannedStyles[0].name}
                    className="w-full h-full object-cover aspect-square"
                  />
                </div>
              )
            ) : (
              <div className="bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center h-full">
                <CollectionIcon className="w-10 h-10 text-slate-300" />
              </div>
            )}
          </div>

          {/* Second column - Two stacked smaller images (1/3 width, full height) */}
          <div className="flex flex-col gap-1.5 h-full">
            {/* Top small image */}
            <div className="flex-1 overflow-hidden rounded-md">
              {category.plannedStyles[1] ? (
                category.plannedStyles[1].status ===
                PlannedStyleStatus.PLACEHOLDER ? (
                  <div className="bg-slate-50 rounded-md h-full flex flex-col items-center justify-center text-center p-1 border-2 border-dashed border-slate-200 hover:border-sky-200 transition-colors">
                    <div className="w-5 h-5 mb-0.5 rounded-full bg-slate-100 flex items-center justify-center">
                      <CollectionIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 line-clamp-1 text-center">
                      {category.plannedStyles[1].name}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-md overflow-hidden bg-slate-100 h-full">
                    <img
                      src={category.plannedStyles[1].imageUrl || ""}
                      alt={category.plannedStyles[1].name}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                )
              ) : (
                <div className="bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center h-full">
                  <CollectionIcon className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>

            {/* Bottom small image */}
            <div className="flex-1 overflow-hidden rounded-md">
              {category.plannedStyles[2] ? (
                category.plannedStyles[2].status ===
                PlannedStyleStatus.PLACEHOLDER ? (
                  <div className="bg-slate-50 rounded-md h-full flex flex-col items-center justify-center text-center p-1 border-2 border-dashed border-slate-200 hover:border-sky-200 transition-colors">
                    <div className="w-5 h-5 mb-0.5 rounded-full bg-slate-100 flex items-center justify-center">
                      <CollectionIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 line-clamp-1 text-center">
                      {category.plannedStyles[2].name}
                    </span>
                  </div>
                ) : (
                  <div className="rounded-md overflow-hidden bg-slate-100 h-full">
                    <img
                      src={category.plannedStyles[2].imageUrl || ""}
                      alt={category.plannedStyles[2].name}
                      className="w-full h-full object-cover aspect-square"
                    />
                  </div>
                )
              ) : (
                <div className="bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center h-full">
                  <CollectionIcon className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed height metadata area with title */}
      <div
        className="bg-slate-50/50 border-t border-slate-100 p-3 flex-shrink-0"
        style={{ height: "90px" }}
      >
        <div className="flex justify-between items-start h-full">
          {/* Left side - Title, Season and metrics */}
          <div className="flex flex-col justify-between h-full min-w-0 flex-1">
            <div>
              <h4
                className="text-base font-semibold text-slate-800 group-hover:text-sky-700 transition-colors truncate"
                title={category.name}
              >
                {category.name}
              </h4>
              <div className="text-xs text-slate-600 truncate mt-0.5">
                {season}
              </div>
            </div>
            {/* Metrics */}
            {category.plannedStyles.length > 0 && (
              <div className="text-xs">{renderMarginMetric()}</div>
            )}
          </div>

          {/* Right side - Style count and status */}
          <div className="flex flex-col justify-between items-end h-full text-right ml-2">
            <div className="text-sm text-slate-600 flex-shrink-0">
              {category.plannedStyles.length} styles
            </div>
            {/* Status indicator at bottom right */}
            {status && (
              <div
                className={`text-xs font-medium inline-flex items-center py-1 px-2.5 rounded-md shadow-md border transition-all duration-150
                  ${
                    status.color === "red"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : status.color === "amber"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
              >
                {status.icon}
                <span className="font-semibold tracking-wide ml-1 truncate">
                  {status.message}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLineCategoryCard;
