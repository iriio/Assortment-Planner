import React from "react";
import { ProductTag } from "@/types";
import TagChip from "./TagChip";
import { productTagsData } from "../../data";

interface TagListDisplayProps {
  tagIds?: string[];
  size?: "sm" | "xs";
  className?: string;
  maxVisibleTags?: number;
  itemType?: string; // For more descriptive titles, e.g. "project", "product"
}

const TagListDisplay: React.FC<TagListDisplayProps> = ({
  tagIds,
  size = "sm",
  className = "",
  maxVisibleTags,
  itemType = "item",
}) => {
  if (!tagIds || tagIds.length === 0) {
    return null;
  }

  const tagsToDisplay = tagIds
    .map((id) => productTagsData.find((t) => t.id === id))
    .filter(Boolean) as ProductTag[];

  if (tagsToDisplay.length === 0) {
    // This can happen if tagIds contains IDs not in productTagsData
    // console.warn('TagListDisplay: No valid tags found for given IDs', tagIds);
    return null;
  }

  const visibleTags = maxVisibleTags
    ? tagsToDisplay.slice(0, maxVisibleTags)
    : tagsToDisplay;
  const hiddenCount =
    maxVisibleTags && tagsToDisplay.length > maxVisibleTags
      ? tagsToDisplay.length - maxVisibleTags
      : 0;

  return (
    <div
      className={`flex flex-wrap gap-1.5 items-center ${className}`}
      title={
        tagsToDisplay.length > 0
          ? `Tags for this ${itemType}: ${tagsToDisplay
              .map((t) => t.name)
              .join(", ")}`
          : ""
      }
    >
      {visibleTags.map((tag) => (
        <TagChip key={tag.id} tag={tag} size={size} />
      ))}
      {hiddenCount > 0 && (
        <span
          className={`font-medium text-slate-500 ${
            size === "xs" ? "text-[11px] ml-1" : "text-xs ml-1.5"
          }`}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

export default TagListDisplay;
