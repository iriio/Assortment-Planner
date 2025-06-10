import React from "react";

interface BulletGraphProps {
  current: number;
  target: number;
  barColor?: string;
  height?: string;
  showTargetMarker?: boolean;
  className?: string;
}

export const BulletGraph: React.FC<BulletGraphProps> = ({
  current,
  target,
  barColor = "bg-blue-500",
  height = "h-4",
  showTargetMarker = true,
  className = "",
}) => {
  // Calculate positions
  const targetPos =
    target === 0
      ? 0
      : Math.min(100, (target / Math.max(target, current)) * 100);
  const currentPos =
    target === 0
      ? 0
      : Math.min(100, (current / Math.max(target, current)) * 100);

  // Calculate performance zones
  const underZone = Math.min(95, targetPos);
  const nearZone = Math.min(105, targetPos);

  return (
    <div
      className={`relative w-full ${height} rounded-sm overflow-hidden ${className}`}
    >
      {/* Performance zones */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 w-full h-full bg-gray-100" />{" "}
        {/* Under zone */}
        <div
          className="absolute inset-0 h-full bg-gray-200"
          style={{ width: `${underZone}%` }}
        />{" "}
        {/* Near zone */}
        <div
          className="absolute inset-0 h-full bg-gray-300"
          style={{ width: `${nearZone}%` }}
        />{" "}
        {/* Over zone */}
      </div>

      {/* Main bar (current value) */}
      <div
        className={`absolute left-0 top-1/4 ${barColor} rounded-sm`}
        style={{
          width: `${currentPos}%`,
          height: "50%",
          transition: "all 0.4s cubic-bezier(.4,1,.4,1)",
        }}
      />

      {/* Target marker */}
      {showTargetMarker && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-black"
          style={{
            left: `calc(${targetPos}% - 1px)`,
            transition: "left 0.4s cubic-bezier(.4,1,.4,1)",
          }}
        />
      )}
    </div>
  );
};
