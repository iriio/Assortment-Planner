import React from "react";
import {
  LinePlanCategory,
  CategoryMetricViewOption,
  PlannedStyleStatus,
  UserRole,
  PLMStatusStage,
  PlannedStyle,
  ActiveTargetFilterType,
} from "../types";
import {
  PlusIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ArrowUpRightIcon,
  CollectionIcon,
  EllipsisVerticalIcon,
} from "./icons";
import { calculateCategoryStatus } from "../utils/statusSystem";
import StatusBadge from "./StatusBadge";
import TagListDisplay from "./TagListDisplay";
import ProductImagePlaceholder from "./ProductImagePlaceholder";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon as HeroPlusIcon } from "@heroicons/react/24/outline";

interface ProductLineCategoryCardProps {
  category: LinePlanCategory;
  onSelectCategory: (category: LinePlanCategory) => void;
  onAddNewStyle: (category: LinePlanCategory) => void;
  activeTargetFilter: ActiveTargetFilterType | null;
  targetOverallMargin: number;
  season: string;
  displayMode: "grid" | "list" | "table";
  metricViewStyle: CategoryMetricViewOption;
  userRole: UserRole;
  onStatusChange: (category: LinePlanCategory, status: PLMStatusStage) => void;
}

const ProductLineCategoryCard: React.FC<ProductLineCategoryCardProps> = ({
  category,
  onSelectCategory,
  onAddNewStyle,
  activeTargetFilter,
  targetOverallMargin,
  season,
  displayMode,
  metricViewStyle,
  userRole,
  onStatusChange,
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
  const baseCardClasses = `bg-white rounded-xl shadow-sm border transition-all group hover:shadow-md hover:border-slate-300/70 ${
    status && status.color !== "green" ? cardBorderClass : "border-slate-200"
  }`;

  const marginText = `${(avgCategoryMargin * 100).toFixed(1)}% / ${(
    targetOverallMargin * 100
  ).toFixed(1)}%`;

  const renderMetricValue = () => {
    if (!activeTargetFilter) {
      return marginText;
    }

    switch (activeTargetFilter) {
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

    if (!activeTargetFilter || activeTargetFilter === "margin") {
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
      switch (activeTargetFilter) {
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

  const handleAddNewStyleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddNewStyle(category);
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

    return (
      <div className={`${baseCardClasses}`}>
        <div
          className="flex flex-col h-full cursor-pointer"
          onClick={handleCardClick}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{styles.length} styles</p>
            </div>
            <StatusBadge
              status={categoryStatus}
              userRole={userRole}
              onStatusChange={handleStatusChange}
              interactive
            />
          </div>

          {/* Image Grid */}
          <div className="flex-1 px-4">
            {styles.length > 0 ? (
              <div className="grid grid-cols-3 grid-rows-2 gap-2 aspect-[4/3]">
                {/* Hero Image */}
                <div className="col-span-2 row-span-2 relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                  <ProductImagePlaceholder
                    productName={heroStyle.name}
                    imageUrl={heroStyle.imageUrl}
                  />
                </div>

                {/* Secondary Image 1 */}
                <div className="col-span-1 row-span-1 relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                  {secondaryStyle1 ? (
                    <ProductImagePlaceholder
                      productName={secondaryStyle1.name}
                      imageUrl={secondaryStyle1.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 border rounded-lg"></div>
                  )}
                </div>

                {/* Secondary Image 2 */}
                <div className="col-span-1 row-span-1 relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                  {secondaryStyle2 ? (
                    <>
                      <ProductImagePlaceholder
                        productName={secondaryStyle2.name}
                        imageUrl={secondaryStyle2.imageUrl}
                      />
                      {hasMoreStyles && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            +{remainingStylesCount}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-50 border rounded-lg"></div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center w-full h-full aspect-[4/3] bg-gray-50 border-2 border-dashed rounded-lg text-gray-400 hover:bg-gray-100/50"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddNewStyle(category);
                }}
              >
                <CollectionIcon className="w-10 h-10" />
                <p className="mt-2 text-sm font-medium">Add Styles</p>
              </div>
            )}
          </div>

          {/* Footer Metrics */}
          <div className="p-4">
            {renderMarginMetric()}
            <div className="mt-2">
              <TagListDisplay
                tagIds={styles.flatMap((s) => s.tags || []).slice(0, 3) || []}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListDisplay = () => (
    <div
      className={`p-4 rounded-lg flex items-center justify-between cursor-pointer ${baseCardClasses}`}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        <StatusBadge
          status={categoryStatus}
          userRole={userRole}
          onStatusChange={handleStatusChange}
          interactive
          iconOnly
        />
        <div>
          <h3 className="font-semibold text-gray-800">{category.name}</h3>
          <p className="text-sm text-gray-500">
            {category.plannedStyles.length} styles
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-48">{renderMarginMetric()}</div>
        <div className="w-40">
          <TagListDisplay
            tagIds={
              category.plannedStyles.flatMap((s) => s.tags || []).slice(0, 3) ||
              []
            }
          />
        </div>
        <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );

  if (displayMode === "list") {
    return renderListDisplay();
  }
  return renderGridDisplay();
};

export default ProductLineCategoryCard;
