import React, { useMemo } from "react";
import {
  LinePlanCategory,
  CategoryMetricViewOption,
  PLMStatusStage,
  ActiveTargetFilterType,
} from "@/types";
import {
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ArrowUpRightIcon,
  CollectionIcon,
  EllipsisVerticalIcon,
} from "../common/icons";
import { calculateCategoryStatus } from "../../utils/statusSystem";
import StatusBadge from "../common/StatusBadge";
import TagListDisplay from "../common/TagListDisplay";
import ProductImagePlaceholder from "../common/ProductImagePlaceholder";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";

interface ProductLineCategoryCardProps {
  category: LinePlanCategory;
  onSelectCategory: (category: LinePlanCategory) => void;
  onAddNewStyle: (category: LinePlanCategory) => void;
  activeTargetFilter: ActiveTargetFilterType | null;
  targetOverallMargin: number;
  displayMode: "grid" | "list" | "table";
  metricViewStyle: CategoryMetricViewOption;
  onStatusChange: (category: LinePlanCategory, status: PLMStatusStage) => void;
  selectedMetricForHighlighting?:
    | "revenue"
    | "margin"
    | "sell-in"
    | "sell-through"
    | null;
  isPoorPerformer?: (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => boolean;
  getHighlightReason?: (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => string;
  getPerformanceStatus?: (
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => "excellent" | "good" | "near" | "poor" | null;
}

const ProductLineCategoryCard: React.FC<ProductLineCategoryCardProps> = ({
  category,
  onSelectCategory,
  onAddNewStyle,
  activeTargetFilter,
  targetOverallMargin,
  displayMode,
  metricViewStyle,
  onStatusChange,
  selectedMetricForHighlighting,

  getHighlightReason,
  getPerformanceStatus,
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

  // Calculate consistent sell-in (same logic as sidebar)
  const totalProjectedSellIn = useMemo(() => {
    if (category.plannedStyles.length === 0) return 0;

    const volumePerStyle =
      category.targetVolume / category.plannedStyles.length;
    return category.plannedStyles.reduce(
      (sum, style) => sum + (style.projectedSellIn || volumePerStyle),
      0
    );
  }, [category.plannedStyles, category.targetVolume]);

  // Calculate weighted sell-through (same logic as sidebar)
  const avgSellThrough = useMemo(() => {
    if (category.plannedStyles.length === 0) return 0;

    let totalProjectedSellThroughUnits = 0;
    let totalBaseUnits = 0;
    const volumePerStyle =
      category.targetVolume / category.plannedStyles.length;

    category.plannedStyles.forEach((style) => {
      const baseVolume = style.projectedSellIn || volumePerStyle;
      totalBaseUnits += baseVolume;
      totalProjectedSellThroughUnits +=
        (style.projectedSellThrough ?? 0.8) * baseVolume;
    });

    return totalBaseUnits > 0
      ? totalProjectedSellThroughUnits / totalBaseUnits
      : 0;
  }, [category.plannedStyles, category.targetVolume]);

  let cardBorderClass = "border-slate-200";
  let statusColorName = "slate";

  const getMetricStatus = () => {
    if (!activeTargetFilter) return null;

    let status: {
      message: string;
      color: string;
      icon: React.ReactElement | null;
    } | null = null;

    switch (activeTargetFilter) {
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
            icon: null,
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
            icon: null,
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
            icon: null,
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
            icon: null,
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

  const marginText = `${(avgCategoryMargin * 100).toFixed(1)}% / ${(
    targetOverallMargin * 100
  ).toFixed(1)}%`;

  // Get performance status for highlighting
  const performanceStatus =
    selectedMetricForHighlighting && getPerformanceStatus
      ? getPerformanceStatus(category, selectedMetricForHighlighting)
      : null;

  // Only highlight if we have a status and it's not null
  const shouldHighlight =
    performanceStatus !== null && performanceStatus !== undefined;

  // Get the reason for highlighting if applicable
  const highlightReason =
    shouldHighlight && selectedMetricForHighlighting && getHighlightReason
      ? getHighlightReason(category, selectedMetricForHighlighting)
      : "";

  // Multi-level highlight styling based on performance
  const getHighlightStyle = () => {
    if (!shouldHighlight || !performanceStatus) return "";

    switch (performanceStatus) {
      case "excellent":
        return "!border !border-emerald-300 ";
      case "good":
        return "!border !border-green-500 ";
      case "near":
        return "!border-2 !border-yellow-300 ";
      case "poor":
        return "!border-2 !border-red-300 !bg-red-50/30";
      default:
        return "";
    }
  };

  const highlightStyle = getHighlightStyle();

  const renderMetricValue = () => {
    // Use selectedMetricForHighlighting if available, otherwise fall back to activeTargetFilter
    const metricToShow = selectedMetricForHighlighting || activeTargetFilter;

    if (!metricToShow) {
      return marginText;
    }

    switch (metricToShow) {
      case "margin":
        return marginText;
      case "revenue":
        return `$${(totalRevenue / 1000).toFixed(1)}K`;
      case "sell-in":
      case "sellin":
        return `${(totalProjectedSellIn / 1000).toFixed(1)}K / ${(
          category.targetVolume / 1000
        ).toFixed(1)}K`;
      case "sell-through":
      case "sellthrough":
        return `${(avgSellThrough * 100).toFixed(1)}%`;
      default:
        return marginText;
    }
  };

  const renderMarginMetric = () => {
    // Use selectedMetricForHighlighting if available, otherwise fall back to activeTargetFilter
    const metricToShow = selectedMetricForHighlighting || activeTargetFilter;

    // Use performance status colors if we have highlighting, otherwise use the old logic
    let colorClass = statusColorName;
    if (performanceStatus) {
      switch (performanceStatus) {
        case "excellent":
          colorClass = "emerald";
          break;
        case "good":
          colorClass = "green";
          break;
        case "near":
          colorClass = "orange";
          break;
        case "poor":
          colorClass = "red";
          break;
        default:
          colorClass = statusColorName;
      }
    }

    const marginColorClassText = `text-${colorClass}-600`;
    const barFillClass = `bg-${colorClass}-500`;
    let barWidth = "w-full";
    let statusIcon = null;

    if (!metricToShow || metricToShow === "margin") {
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
      // Use performance status-based icons and bar width
      if (performanceStatus) {
        switch (performanceStatus) {
          case "excellent":
            statusIcon = (
              <CheckBadgeIcon className="w-3.5 h-3.5 ml-1 text-emerald-500" />
            );
            barWidth = "w-full";
            break;
          case "good":
            statusIcon = (
              <CheckBadgeIcon className="w-3.5 h-3.5 ml-1 text-green-500" />
            );
            barWidth = "w-5/6";
            break;
          case "near":
            statusIcon = (
              <ArrowUpRightIcon className="w-3.5 h-3.5 ml-1 text-orange-500" />
            );
            barWidth = "w-2/3";
            break;
          case "poor":
            statusIcon = (
              <ExclamationTriangleIcon className="w-3.5 h-3.5 ml-1 text-red-500" />
            );
            barWidth = "w-1/3";
            break;
        }
      } else {
        // Fallback to old logic
        statusIcon = status?.icon;
        switch (metricToShow) {
          case "revenue":
            barWidth =
              totalRevenue < 100000
                ? "w-1/3"
                : totalRevenue < 200000
                ? "w-2/3"
                : "w-full";
            break;
          case "sell-in":
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
          case "sell-through":
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
    }

    switch (metricViewStyle) {
      case "miniBullet":
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
      case "statusBar":
        return (
          <div className="mt-1.5">
            <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barFillClass} ${barWidth}`}
              ></div>
            </div>
            <div
              className={`text-xs font-semibold flex items-center mt-1 ${marginColorClassText}`}
            >
              {renderMetricValue()} {statusIcon}
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

  const categoryStatus =
    category.plmStatus || calculateCategoryStatus(category);

  const handleCardClick = () => {
    onSelectCategory(category);
  };

  const handleStatusChange = (newStatus: PLMStatusStage) => {
    onStatusChange(category, newStatus);
  };

  const renderGridDisplay = () => {
    const styles = category.plannedStyles;
    const heroStyle = styles[0];
    const secondaryStyle1 = styles[1];
    const secondaryStyle2 = styles[2];
    const hasMoreStyles = styles.length > 3;
    const remainingStylesCount = styles.length - 3;

    const cardContent = (
      <Card
        className={cn(
          "group hover:shadow-sm transition-all bg-white overflow-hidden rounded-md ",
          status && status.color !== "green" ? cardBorderClass : "",
          highlightStyle
        )}
      >
        <div
          className="flex flex-col h-full cursor-pointer "
          onClick={handleCardClick}
        >
          {/* Image Grid */}
          <CardContent className="flex-1 p-0">
            {styles.length > 0 ? (
              <div className="grid grid-cols-3 grid-rows-2 gap-0.5 aspect-[4/3] relative">
                {/* Hero Image */}
                <div className=" col-span-2 row-span-2 relative w-full h-full bg-gray-100 overflow-hidden">
                  <ProductImagePlaceholder
                    productName={heroStyle.name}
                    imageUrl={heroStyle.imageUrl}
                    className="object-top"
                  />
                </div>

                {/* Secondary Image 1 */}
                <div className="col-span-1 row-span-1 relative w-full h-full bg-gray-100 overflow-hidden">
                  {secondaryStyle1 ? (
                    <ProductImagePlaceholder
                      productName={secondaryStyle1.name}
                      imageUrl={secondaryStyle1.imageUrl}
                      className="object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 border rounded-lg"></div>
                  )}
                </div>

                {/* Secondary Image 2 */}
                <div className="col-span-1 row-span-1 relative w-full h-full bg-gray-100 overflow-hidden">
                  {secondaryStyle2 ? (
                    <>
                      <ProductImagePlaceholder
                        productName={secondaryStyle2.name}
                        imageUrl={secondaryStyle2.imageUrl}
                        className="object-top"
                      />
                      {hasMoreStyles && (
                        <div className="absolute inset-0 bg-slate-500/50 flex items-center justify-center">
                          <span className="text-white text-lg font-semibold">
                            +{remainingStylesCount}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-50 border rounded-lg"></div>
                  )}
                </div>

                {/* Fade overlay covering all images */}
                {/* <div className="pointer-events-none absolute inset-0">
                  <div className="absolute bottom-0 left-0 w-full h-1/5 bg-gradient-to-t from-slate-100 via-slate-100/30 via-50% to-transparent"></div>
                </div> */}
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-full h-full aspect-[4/3] bg-gray-50  rounded-lg text-gray-400 hover:bg-gray-100/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNewStyle(category);
                }}
              >
                <CollectionIcon className="w-10 h-10" />
                <p className="mt-2 text-sm font-medium">Add Styles</p>
              </div>
            )}
          </CardContent>
          {/* Header */}
          <CardHeader className="flex-row items-center justify-between p-4 pb-0 min-h-fit">
            <div className="flex-1 flex items-center gap-2 ">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{styles.length} styles</p>
            </div>
          </CardHeader>

          {/* Footer Metrics */}
          <CardContent className="p-4 pt-0 pb-3 flex items-center justify-between">
            {renderMarginMetric()}
            <StatusBadge
              status={categoryStatus}
              onStatusChange={handleStatusChange}
              interactive
              size="sm"
              className=" items-center"
            />
          </CardContent>
        </div>
      </Card>
    );

    // Wrap with tooltip if highlighting
    if (shouldHighlight && highlightReason) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">⚠️ {highlightReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return cardContent;
  };

  const renderListDisplay = () => {
    const cardContent = (
      <Card
        className={cn(
          "group hover:shadow-md transition-all",
          status && status.color !== "green" ? cardBorderClass : "",
          highlightStyle
        )}
      >
        {/* Main container for the list item - handles click and layout */}
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={handleCardClick}
        >
          {/* Left section - contains status badge and category info */}
          <div className="flex items-center gap-4">
            <StatusBadge
              status={categoryStatus}
              onStatusChange={handleStatusChange}
              interactive
            />
            {/* Category name and style count */}
            <div>
              <h3 className="font-semibold text-gray-800">{category.name}</h3>
              <p className="text-sm text-gray-500">
                {category.plannedStyles.length} styles
              </p>
            </div>
          </div>

          {/* Right section - contains metrics, tags, and actions */}
          <div className="flex items-center gap-6">
            {/* Metric display area */}
            <div className="w-48">{renderMarginMetric()}</div>
            {/* Tags display area */}
            <div className="w-40">
              <TagListDisplay
                tagIds={
                  category.plannedStyles
                    .flatMap((s) => s.tags || [])
                    .slice(0, 3) || []
                }
              />
            </div>
            {/* Action menu icon */}
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Card>
    );

    // Wrap with tooltip if highlighting
    if (shouldHighlight && highlightReason) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">⚠️ {highlightReason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return cardContent;
  };

  if (displayMode === "list") {
    return renderListDisplay();
  }
  return renderGridDisplay();
};

export default ProductLineCategoryCard;
