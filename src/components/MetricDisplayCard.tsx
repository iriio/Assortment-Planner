import React from "react";
import { Card } from "@/components/ui/card";

interface MetricDisplayCardProps {
  title: string;
  target: number;
  current: number;
  unit: string;
  icon: React.ReactNode;
}

export const MetricDisplayCard: React.FC<MetricDisplayCardProps> = ({
  title,
  target,
  current,
  unit,
  icon,
}) => {
  const percentage = target !== 0 ? (current / target) * 100 : 0;
  const isOverTarget = current > target;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Target: {unit}
          {target.toLocaleString()}
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-semibold">
          {unit}
          {current.toLocaleString()}
        </div>
        <div
          className={`text-sm ${
            isOverTarget ? "text-green-500" : "text-red-500"
          }`}
        >
          {percentage.toFixed(1)}%
        </div>
      </div>
    </Card>
  );
};
