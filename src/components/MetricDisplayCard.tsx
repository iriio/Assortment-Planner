import React from "react";
import { ArrowUpRightIcon, ArrowDownLeftIcon, MinusIcon } from "./icons";

interface MetricDisplayCardProps {
  title: string;
  projectedValue: number;
  targetValue: number;
  unit: string;
  displayValueFormatter?: (value: number) => string;
  icon: React.ReactElement;
  isActive?: boolean;
  onClick?: () => void;
  higherIsBetter?: boolean;
  isCompact?: boolean;
  viewStyle?: "current" | "bullet" | "gauge";
}

const MetricDisplayCard: React.FC<MetricDisplayCardProps> = ({
  title,
  projectedValue,
  targetValue,
  unit,
  displayValueFormatter,
  icon,
  isActive = false,
  onClick,
  higherIsBetter = true,
  isCompact = false,
  viewStyle = "current",
}) => {
  const delta = projectedValue - targetValue;
  const isExactlyOnTarget = delta === 0;
  const effectivelyOnTargetThreshold = (() => {
    if (unit === "%") {
      return 0.01 * Math.abs(targetValue);
    } else if (unit === "$M") {
      return 0.01 * Math.abs(targetValue);
    } else if (unit === "K") {
      return 0.02 * Math.abs(targetValue);
    } else {
      return 0.01 * Math.abs(targetValue);
    }
  })();
  const isEffectivelyOnTarget =
    Math.abs(delta) <= effectivelyOnTargetThreshold || isExactlyOnTarget;

  let statusColorClass = "border-slate-300";
  let baseColorName = "slate";
  let deltaTextColorClass = "text-slate-600";
  let DeltaIconComponent: React.FC<{ className?: string }> | null = MinusIcon;

  if (!isEffectivelyOnTarget) {
    if ((delta > 0 && higherIsBetter) || (delta < 0 && !higherIsBetter)) {
      statusColorClass = "border-green-500";
      baseColorName = "green";
      deltaTextColorClass = "text-green-600";
      DeltaIconComponent = ArrowUpRightIcon;
    } else {
      statusColorClass = "border-red-500";
      baseColorName = "red";
      deltaTextColorClass = "text-red-600";
      DeltaIconComponent = ArrowDownLeftIcon;
    }
  } else {
    statusColorClass = "border-sky-500";
    baseColorName = "sky";
    deltaTextColorClass = "text-slate-600";
    DeltaIconComponent = MinusIcon;
  }

  const activeClasses = isActive
    ? "ring-2 ring-sky-400 ring-offset-1 shadow-xl bg-sky-50/50"
    : "hover:shadow-lg hover:border-slate-300";

  const progressPercentage =
    targetValue === 0
      ? projectedValue > 0
        ? 100
        : 0
      : Math.min(Math.max((projectedValue / targetValue) * 100, 0), 100);

  // Get static color classes based on baseColorName
  const getStaticColorClasses = (colorName: string) => {
    switch (colorName) {
      case "green":
        return {
          fillClass: "bg-green-600",
          lightFillClass: "bg-green-200",
          bgClass: "bg-green-100",
        };
      case "red":
        return {
          fillClass: "bg-red-600",
          lightFillClass: "bg-red-200",
          bgClass: "bg-red-100",
        };
      case "sky":
        return {
          fillClass: "bg-sky-600",
          lightFillClass: "bg-sky-200",
          bgClass: "bg-sky-100",
        };
      default:
        return {
          fillClass: "bg-slate-600",
          lightFillClass: "bg-slate-200",
          bgClass: "bg-slate-100",
        };
    }
  };

  const colorClasses = getStaticColorClasses(baseColorName);

  if (viewStyle === "gauge") {
    const angle = Math.min(
      180,
      Math.max(
        0,
        (projectedValue / (Math.max(targetValue, projectedValue) * 1.2)) * 180
      )
    );
    const targetAngle = Math.min(
      180,
      Math.max(
        0,
        (targetValue / (Math.max(targetValue, projectedValue) * 1.2)) * 180
      )
    );

    return (
      <div
        className={`bg-white p-3 rounded-xl shadow-lg border border-slate-200 ${activeClasses} cursor-pointer transition-all duration-200 group min-w-[180px] ${
          isCompact ? "min-w-[140px] text-xs" : "min-w-[200px]"
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <p
          className={`font-semibold text-slate-600 mb-1 text-center ${
            isCompact ? "text-xs" : "text-sm"
          }`}
        >
          {title}
        </p>
        <div
          className={`relative w-full aspect-[2/1] overflow-hidden mb-1 ${
            isCompact ? "max-h-[40px]" : "max-h-[60px]"
          }`}
        >
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <path
              d="M 10 40 A 40 40 0 0 1 90 40"
              strokeWidth="6"
              stroke="currentColor"
              className="text-slate-200"
              fill="none"
            />
            <path
              d={`M 10 40 A 40 40 0 ${angle > 90 ? 1 : 0} 1 ${
                10 + 80 * Math.sin((Math.PI * angle) / 180)
              } ${40 - 40 * (1 - Math.cos((Math.PI * angle) / 180))}`}
              strokeWidth="6"
              stroke="currentColor"
              className={colorClasses.fillClass.replace("bg-", "text-")}
              fill="none"
              style={{ strokeDasharray: `${(angle / 180) * 125.6} 125.6` }}
            />
            <line
              x1="50"
              y1="40"
              x2={50 - 35 * Math.cos((Math.PI * targetAngle) / 180)}
              y2={40 - 35 * Math.sin((Math.PI * targetAngle) / 180)}
              strokeWidth="1.5"
              stroke="currentColor"
              className="text-slate-500"
            />
            <line
              x1="50"
              y1="40"
              x2={50 - 30 * Math.cos((Math.PI * angle) / 180)}
              y2={40 - 30 * Math.sin((Math.PI * angle) / 180)}
              strokeWidth="2"
              stroke="currentColor"
              className={colorClasses.fillClass
                .replace("bg-", "text-")
                .replace("-600", "-700")}
            />
          </svg>
        </div>
        <p
          className={`font-bold ${deltaTextColorClass} text-center ${
            isCompact ? "text-base" : "text-lg"
          }`}
        >
          {displayValueFormatter?.(projectedValue) ||
            `${projectedValue} ${unit}`}
        </p>
        <p
          className={`text-slate-500 text-center ${
            isCompact ? "text-2xs" : "text-xs"
          }`}
        >
          Target:{" "}
          {displayValueFormatter?.(targetValue) || `${targetValue} ${unit}`}
        </p>
      </div>
    );
  }

  if (viewStyle === "bullet") {
    // Calculate range for bullet chart - make it more generous to show ranges properly
    let maxRangeValue;
    if (targetValue === 0 && projectedValue === 0) {
      maxRangeValue = 100;
    } else if (targetValue === 0) {
      maxRangeValue = Math.abs(projectedValue) * 1.5;
    } else {
      // Make range more generous to show performance zones
      maxRangeValue = Math.max(
        Math.abs(targetValue) * 1.5,
        Math.abs(projectedValue) * 1.2,
        Math.abs(targetValue) + Math.abs(delta) * 1.2
      );
    }
    if (maxRangeValue <= 0) maxRangeValue = 1;

    // Define performance ranges with more subtle colors
    const ranges =
      targetValue !== 0
        ? [
            {
              threshold: Math.abs(targetValue) * (higherIsBetter ? 0.7 : 1.3),
              color: "bg-slate-100",
              label: "Poor",
            },
            {
              threshold: Math.abs(targetValue) * (higherIsBetter ? 0.95 : 1.05),
              color: "bg-slate-50",
              label: "Fair",
            },
            {
              threshold: maxRangeValue,
              color: "bg-white",
              label: "Good",
            },
          ]
        : [{ threshold: maxRangeValue, color: "bg-slate-100", label: "Range" }];

    const projectedValuePercent = Math.min(
      100,
      Math.max(0, (projectedValue / maxRangeValue) * 100)
    );
    const targetPositionPercent = Math.min(
      98,
      Math.max(0, (targetValue / maxRangeValue) * 100)
    );

    // Get subtle color for the projected value bar based on performance
    const getProjectedBarColor = () => {
      if (isEffectivelyOnTarget) {
        return "bg-blue-500"; // On target - subtle blue
      } else if (
        (delta > 0 && higherIsBetter) ||
        (delta < 0 && !higherIsBetter)
      ) {
        return "bg-green-500"; // Above target (good) - subtle green
      } else {
        return "bg-amber-500"; // Below target - subtle amber
      }
    };

    return (
      <div
        className={`bg-white rounded-lg border border-slate-200 ${activeClasses} cursor-pointer transition-all duration-200 ${
          isCompact ? "p-3 min-w-[200px]" : "p-4 min-w-[280px]"
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {/* Title with delta icon */}
        <div
          className={`flex items-center justify-between ${
            isCompact ? "mb-2" : "mb-3"
          }`}
        >
          <p
            className={`font-semibold text-slate-700 ${
              isCompact ? "text-sm" : "text-base"
            }`}
          >
            {title}
          </p>
          {DeltaIconComponent && (
            <DeltaIconComponent className={`w-4 h-4 ${deltaTextColorClass}`} />
          )}
        </div>

        {/* Bullet chart */}
        <div
          className={`relative w-full ${isCompact ? "h-4 mb-3" : "h-6 mb-4"}`}
        >
          {/* Background ranges */}
          <div className="flex h-full w-full rounded-sm overflow-hidden border border-slate-200">
            {ranges.map((range, idx) => {
              const prevThreshold = idx === 0 ? 0 : ranges[idx - 1].threshold;
              let widthPercent =
                ((range.threshold - prevThreshold) / maxRangeValue) * 100;
              if (idx === ranges.length - 1) {
                widthPercent =
                  ((maxRangeValue - prevThreshold) / maxRangeValue) * 100;
              }
              widthPercent = Math.max(0, Math.min(100, widthPercent));

              return (
                <div
                  key={idx}
                  style={{ width: `${widthPercent}%` }}
                  className={`${range.color} h-full ${
                    idx < ranges.length - 1 ? "border-r border-slate-200" : ""
                  }`}
                  title={`Range: ${range.label}`}
                />
              );
            })}
          </div>

          {/* Projected value bar - color-coded but subtle */}
          <div
            style={{ width: `${projectedValuePercent}%` }}
            className={`absolute top-1/2 left-0 -translate-y-1/2 ${
              isCompact ? "h-2" : "h-3"
            } ${getProjectedBarColor()} rounded-sm`}
            title={`Projected: ${
              displayValueFormatter?.(projectedValue) ||
              `${projectedValue} ${unit}`
            }`}
          />

          {/* Target marker line */}
          <div
            style={{ left: `${targetPositionPercent}%` }}
            className={`absolute top-0 w-0.5 h-full bg-slate-900`}
            title={`Target: ${
              displayValueFormatter?.(targetValue) || `${targetValue} ${unit}`
            }`}
          />
        </div>

        {/* Values with clear labels */}
        <div className={`space-y-1 ${isCompact ? "text-sm" : "text-base"}`}>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Projected:</span>
            <span className={`font-semibold ${deltaTextColorClass}`}>
              {displayValueFormatter?.(projectedValue) ||
                `${projectedValue} ${unit}`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Target:</span>
            <span className="font-medium text-slate-700">
              {displayValueFormatter?.(targetValue) || `${targetValue} ${unit}`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Current style
  if (isCompact) {
    return (
      <div
        className={`bg-white p-3 rounded-lg shadow-md border-l-4 ${statusColorClass} ${activeClasses} flex flex-col items-center min-w-[140px] cursor-pointer transition-all duration-150 ease-in-out`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        aria-label={`Filter by ${title} performance`}
      >
        <p className="text-xs font-medium text-slate-500 mb-0.5 truncate">
          {title}
        </p>
        <p className={`text-xl font-bold ${deltaTextColorClass}`}>
          {displayValueFormatter?.(projectedValue) ||
            `${projectedValue} ${unit}`}
        </p>
        <p className="text-2xs text-slate-400">
          Target:{" "}
          {displayValueFormatter?.(targetValue) || `${targetValue} ${unit}`}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-lg border-l-4 ${statusColorClass} ${activeClasses} cursor-pointer transition-all duration-200 ease-in-out group`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`Filter by ${title} performance`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-slate-700 flex items-center">
          {React.cloneElement(icon, {
            className:
              "w-4 h-4 mr-2 text-slate-500 group-hover:text-sky-500 transition-colors",
          })}
          {title}
        </p>
        {DeltaIconComponent && (
          <DeltaIconComponent
            className={`w-5 h-5 ${deltaTextColorClass} flex-shrink-0`}
          />
        )}
      </div>

      <div className="mb-3">
        <p className={`text-3xl font-bold ${deltaTextColorClass}`}>
          {displayValueFormatter?.(projectedValue) ||
            `${projectedValue} ${unit}`}
        </p>
        <p className="text-xs text-slate-500">
          Target:{" "}
          {displayValueFormatter?.(targetValue) || `${targetValue} ${unit}`}
        </p>
      </div>

      <div className="w-full bg-slate-200/70 rounded-full h-1.5 mb-2.5">
        <div
          className={`h-1.5 rounded-full progress-bar-fill ${colorClasses.fillClass}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {!isEffectivelyOnTarget && delta !== 0 && (
        <div
          className={`text-xs font-semibold ${deltaTextColorClass} flex items-center`}
        >
          <span>
            {delta > 0 ? "+" : ""}
            {displayValueFormatter?.(delta) || `${delta} ${unit}`}{" "}
            {delta > 0
              ? higherIsBetter
                ? "above"
                : "below"
              : higherIsBetter
              ? "below"
              : "above"}{" "}
            target
          </span>
        </div>
      )}
      {isEffectivelyOnTarget && (
        <div className="text-xs font-medium text-slate-500 flex items-center">
          <MinusIcon className="w-3 h-3 mr-1 text-slate-500" />
          <span>On Target</span>
        </div>
      )}
    </div>
  );
};

export default MetricDisplayCard;
