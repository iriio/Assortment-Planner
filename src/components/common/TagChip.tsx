import React from "react";
import { ProductTag } from "../../types";

interface TagChipProps {
  tag: ProductTag;
  size?: "sm" | "xs";
}

// Basic color mapping to Tailwind CSS classes
const colorClasses: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200/60",
  yellow:
    "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200/60",
  green: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200/60",
  purple:
    "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200/60",
  indigo:
    "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200/60",
  pink: "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200/60",
  red: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200/60",
  teal: "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200/60",
  sky: "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200/60",
  slate: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60",
  lime: "bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200/60",
  default: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/60",
};

const TagChip: React.FC<TagChipProps> = ({ tag, size = "sm" }) => {
  const chipColor = colorClasses[tag.color] || colorClasses.default;
  const padding = size === "sm" ? "px-2.5 py-0.5" : "px-1.5 py-px"; // Adjusted xs padding
  const textSize = size === "sm" ? "text-xs" : "text-[11px]";

  return (
    <span
      className={`inline-block ${padding} ${textSize} font-medium rounded-md border ${chipColor} whitespace-nowrap transition-colors duration-150 ease-in-out`}
      title={`${tag.name} (Category: ${tag.category})`}
    >
      {tag.name}
    </span>
  );
};

export default TagChip;
