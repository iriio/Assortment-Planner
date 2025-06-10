"use client";

import * as React from "react";
import { LinePlanCategory, PLMStatusStage, PlannedStyle } from "../../types";
import { Input } from "@/components/ui/input";
import StatusBadge from "../common/StatusBadge";
import TagListDisplay from "../common/TagListDisplay";
import { CollectionIcon } from "../common/icons";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { Badge } from "@/components/ui/badge";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface ProgramWideViewProps {
  categories: LinePlanCategory[];
  selectedCategoryId?: string | null;
  onSelectCategory: (category: LinePlanCategory) => void;
  onSelectStyle?: (style: PlannedStyle) => void;
  activeTargetFilter: "revenue" | "margin" | "sellin" | "sellthrough" | null;
  targetOverallMargin: number;
  onStatusChange: (category: LinePlanCategory, status: PLMStatusStage) => void;
  onBackToCategories: () => void;
}

export function ProgramWideView({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onSelectStyle,
  onStatusChange,
}: ProgramWideViewProps) {
  // State for filtering
  const [searchQuery, setSearchQuery] = React.useState("");

  // Find the selected category if an ID is provided
  const selectedCategory = selectedCategoryId
    ? categories.find((cat) => cat.id === selectedCategoryId)
    : null;

  // Group styles by PLM status when viewing a category
  const groupedStyles = React.useMemo(() => {
    if (!selectedCategory) return null;

    return selectedCategory.plannedStyles.reduce((acc, style) => {
      const status = style.plmStatus || PLMStatusStage.BRIEFING;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(style);
      return acc;
    }, {} as Record<PLMStatusStage, PlannedStyle[]>);
  }, [selectedCategory]);

  // Define the order of status columns
  const statusOrder = [
    PLMStatusStage.DRAFT,
    PLMStatusStage.BRIEFING,
    PLMStatusStage.PLANNING,
    PLMStatusStage.READY_FOR_REVIEW,
    PLMStatusStage.DESIGNING,
    PLMStatusStage.FINALIZING,
    PLMStatusStage.HANDOFF,
    PLMStatusStage.LAUNCHED,
  ];

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Drop outside the list
    if (!destination) return;

    // Drop in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If we're in category view
    if (!selectedCategory) {
      const category = categories.find((cat) => cat.id === draggableId);
      if (!category) return;

      // Update category status
      onStatusChange(category, destination.droppableId as PLMStatusStage);
      return;
    }

    // If we're in style view
    const style = selectedCategory.plannedStyles.find(
      (s) => s.id === draggableId
    );
    if (!style) return;

    // Create updated style with new status
    const updatedStyle: PlannedStyle = {
      ...style,
      plmStatus: destination.droppableId as PLMStatusStage,
    };

    // Call onSelectStyle with the updated style
    onSelectStyle?.(updatedStyle);
  };

  // Render a style card
  const renderStyleCard = (style: PlannedStyle, index: number) => (
    <Draggable key={style.id} draggableId={style.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3"
          onClick={() => onSelectStyle?.(style)}
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
              {style.imageUrl ? (
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CollectionIcon className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-800 text-sm truncate">
                {style.name}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {style.color || "N/A"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  ${style.sellingPrice.toFixed(0)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {(style.margin * 100).toFixed(1)}%
                </Badge>
              </div>
              {style.tags && style.tags.length > 0 && (
                <div className="mt-2">
                  <TagListDisplay tagIds={style.tags} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  // Render a category card
  const renderCategoryCard = (category: LinePlanCategory, index: number) => {
    const totalRevenue = category.plannedStyles.reduce(
      (sum, style) => sum + style.sellingPrice * (style.projectedSellIn || 0),
      0
    );
    const avgMargin =
      category.plannedStyles.reduce((sum, style) => sum + style.margin, 0) /
      (category.plannedStyles.length || 1);

    return (
      <Draggable key={category.id} draggableId={category.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3"
            onClick={() => onSelectCategory(category)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-slate-800">{category.name}</h3>
                <p className="text-sm text-slate-500">
                  {category.plannedStyles.length} styles
                </p>
              </div>
              <StatusBadge
                status={category.plmStatus || PLMStatusStage.BRIEFING}
                onStatusChange={(newStatus) =>
                  onStatusChange(category, newStatus)
                }
                interactive
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Revenue</span>
                <span className="font-medium">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Avg. Margin</span>
                <span className="font-medium">
                  {formatPercentage(avgMargin)}
                </span>
              </div>
            </div>
            {category.plannedStyles.some(
              (style) => style.tags && style.tags.length > 0
            ) && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <TagListDisplay
                  tagIds={[
                    ...new Set(
                      category.plannedStyles.flatMap(
                        (style) => style.tags || []
                      )
                    ),
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-6 p-5">
        <div className="flex items-center gap-6">
          <Input
            placeholder={`Filter ${
              selectedCategory ? "styles" : "categories"
            }...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="h-full min-w-max p-4">
            <div className="flex gap-4 h-full">
              {statusOrder.map((status) => (
                <Droppable key={status} droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-shrink-0 w-80 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-slate-800">
                            {status.charAt(0) +
                              status.slice(1).toLowerCase().replace(/_/g, " ")}
                          </h3>
                          <span className="text-sm text-slate-500">
                            {selectedCategory
                              ? (groupedStyles?.[status] || []).length
                              : categories.filter((c) => c.plmStatus === status)
                                  .length}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                        {selectedCategory
                          ? (groupedStyles?.[status] || [])
                              .filter(
                                (style) =>
                                  !searchQuery ||
                                  style.name
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                              )
                              .map((style, index) =>
                                renderStyleCard(style, index)
                              )
                          : categories
                              .filter(
                                (category) => category.plmStatus === status
                              )
                              .filter(
                                (category) =>
                                  !searchQuery ||
                                  category.name
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                              )
                              .map((category, index) =>
                                renderCategoryCard(category, index)
                              )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
