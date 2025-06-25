import { useState, useEffect } from "react";
import { CollectionIcon, PencilIcon } from "@/components/common/icons";
import {
  LinePlanCategory,
  PlannedStyle,
  PLMStatusStage,
  Product,
} from "@/types";
import { LayoutViewOption } from "@/types/layout";
import StyleModal from "@/components/modals/StyleModal";
import ComponentModal from "@/components/modals/ComponentModal";
import ProductDetailView from "./ProductDetailView";
import TagListDisplay from "@/components/common/TagListDisplay";

import { Badge } from "@/components/ui/badge";

import { CompactListView } from "@/components/views/CompactListView";

interface CategoryDetailViewProps {
  category: LinePlanCategory;
  onUpdateStyle: (categoryId: string, style: PlannedStyle) => void;
  onAddStyle: (categoryId: string, style: PlannedStyle) => void;
  currentLayout: LayoutViewOption;
  programName: string;
  selectedProductId?: string | null;
  onProductSelect?: (productId: string) => void;
  onProductBack?: () => void;
  onStyleModalClose?: () => void;
  isStyleModalOpen?: boolean;
  // Product-level highlighting functions
  selectedMetricForHighlighting?:
    | "revenue"
    | "margin"
    | "sell-in"
    | "sell-through"
    | null;
  isProductPoorPerformer?: (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => boolean;
  getProductHighlightReason?: (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => string;
  getProductPerformanceStatus?: (
    product: PlannedStyle | Product,
    category: LinePlanCategory,
    metricType: "revenue" | "margin" | "sell-in" | "sell-through"
  ) => "excellent" | "good" | "near" | "poor" | null;
}

export function CategoryDetailView({
  category,
  onUpdateStyle,
  onAddStyle,
  currentLayout,
  programName,
  selectedProductId,

  onProductBack,
  onStyleModalClose,
  isStyleModalOpen: externalIsStyleModalOpen,
  selectedMetricForHighlighting,
  isProductPoorPerformer,
  getProductHighlightReason,
  getProductPerformanceStatus,
}: CategoryDetailViewProps) {
  // All hooks must be at the top level, before any conditional logic
  const [selectedStyle, setSelectedStyle] = useState<PlannedStyle | null>(null);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [internalIsStyleModalOpen, setInternalIsStyleModalOpen] =
    useState(false);

  // Use external state if provided, otherwise use internal state
  const isStyleModalOpen = externalIsStyleModalOpen ?? internalIsStyleModalOpen;
  const setIsStyleModalOpen =
    externalIsStyleModalOpen !== undefined
      ? (value: boolean) => {
          if (onStyleModalClose && !value) onStyleModalClose();
        }
      : setInternalIsStyleModalOpen;

  // Add debug logging for selectedProductId changes
  useEffect(() => {
    console.log(
      "CategoryDetailView selectedProductId changed:",
      selectedProductId
    );
  }, [selectedProductId]);

  const openStyleModal = (style: PlannedStyle | null) => {
    setSelectedStyle(style);
    setIsStyleModalOpen(true);
  };

  const closeStyleModal = () => {
    setIsStyleModalOpen(false);
    setSelectedStyle(null);
    if (onStyleModalClose) {
      onStyleModalClose();
    }
  };

  const openComponentModal = (styleToEdit: PlannedStyle) => {
    setSelectedStyle(styleToEdit);
    setIsComponentModalOpen(true);
  };

  const closeComponentModal = () => {
    setSelectedStyle(null);
    setIsComponentModalOpen(false);
  };

  const handleStyleUpdate = (updatedStyle: PlannedStyle) => {
    onUpdateStyle(category.id, updatedStyle);
  };

  const handleStyleAdd = (newStyle: PlannedStyle) => {
    onAddStyle(category.id, newStyle);
  };

  const handleProductClick = (style: PlannedStyle) => {
    // Disabled for mockup - no product detail navigation
    console.log("Product clicked (disabled for mockup):", style.id);
    // if (onProductSelect) {
    //   console.log("Calling onProductSelect with:", style.id);
    //   onProductSelect(style.id);
    // } else {
    //   console.log("onProductSelect is not defined");
    // }
  };

  const handleProductDetailBack = () => {
    console.log("Product back clicked");
    if (onProductBack) {
      onProductBack();
    }
  };

  const handleFullProductUpdate = (updatedProduct: PlannedStyle) => {
    console.log("Product update:", updatedProduct.id);
    onUpdateStyle(category.id, updatedProduct);
  };

  const handleStylePlmStatusChange = (
    styleId: string,
    newStatus: PLMStatusStage
  ) => {
    const styleToUpdate = category.plannedStyles.find((s) => s.id === styleId);
    if (styleToUpdate) {
      onUpdateStyle(category.id, { ...styleToUpdate, plmStatus: newStatus });
    }
  };

  // Render functions
  const renderProductDetailView = () => {
    if (!selectedProductId) return null;

    const productForDetailView = category.plannedStyles.find(
      (style) => style.id === selectedProductId
    );

    if (!productForDetailView) return null;

    return (
      <div className="h-full">
        <ProductDetailView
          product={productForDetailView}
          onBack={handleProductDetailBack}
          onUpdateProduct={handleFullProductUpdate}
          categoryName={category.name}
          programName={programName}
        />
      </div>
    );
  };

  const renderStandardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {category.plannedStyles.map((style) => (
        <div
          key={style.id}
          onClick={() => handleProductClick(style)}
          className="bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="aspect-square bg-slate-50 rounded-t-lg overflow-hidden border-b border-slate-200">
            {style.imageUrl ? (
              <img
                src={style.imageUrl}
                alt={style.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CollectionIcon className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                {style.name}
              </h3>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{style.id}</span>
                {style.color && (
                  <Badge variant="outline" className="font-normal">
                    {style.color}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <TagListDisplay
                tagIds={style.tags}
                size="xs"
                itemType="product"
                maxVisibleTags={2}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-xs">
                <div className="text-sm font-medium text-slate-700">
                  {(style.margin * 100).toFixed(1)}% MRG
                </div>
                <div className="text-slate-500">
                  ${style.sellingPrice.toFixed(0)} RSP
                </div>
              </div>
              <div
                className="flex space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openStyleModal(style);
                  }}
                  className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
                  title="Edit Style Details"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openComponentModal(style);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                  title="Change Components"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompactListView = () => (
    <CompactListView
      categories={[category]}
      selectedCategoryId={category.id}
      onSelectCategory={() => {}}
      onSelectStyle={() => {}}
      activeTargetFilter={null}
      targetOverallMargin={0}
      onStatusChange={(cat, status) =>
        handleStylePlmStatusChange(cat.id, status)
      }
      onBackToCategories={() => {}}
      selectedMetricForHighlighting={selectedMetricForHighlighting}
      isProductPoorPerformer={isProductPoorPerformer}
      getProductHighlightReason={getProductHighlightReason}
      getProductPerformanceStatus={getProductPerformanceStatus}
    />
  );

  const renderWideView = () => {
    // Group styles by PLM status
    const stylesByStatus = category.plannedStyles.reduce((acc, style) => {
      const status = style.plmStatus || PLMStatusStage.BRIEFING;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(style);
      return acc;
    }, {} as Record<PLMStatusStage, PlannedStyle[]>);

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

    return (
      <div className="h-full overflow-x-auto">
        <div className="flex gap-4 p-4 min-w-max">
          {statusOrder.map((status) => (
            <div key={status} className="w-72 flex-shrink-0">
              <div className="bg-slate-50 rounded-lg p-3 mb-2">
                <h3 className="text-sm font-medium text-slate-700">
                  {status.replace(/_/g, " ")}
                </h3>
                <p className="text-xs text-slate-500">
                  {(stylesByStatus[status] || []).length} styles
                </p>
              </div>
              <div className="space-y-2">
                {(stylesByStatus[status] || []).map((style) => (
                  <div
                    key={style.id}
                    onClick={() => handleProductClick(style)}
                    className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow cursor-pointer group"
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
                            <CollectionIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-800 text-sm truncate group-hover:text-sky-600">
                          {style.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">
                          {style.color || "N/A"}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs">
                            <span className="font-medium text-slate-700">
                              {(style.margin * 100).toFixed(1)}%
                            </span>
                            <span className="text-slate-500 ml-1">
                              ${style.sellingPrice.toFixed(0)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openStyleModal(style);
                            }}
                            className="p-1 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <PencilIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main render logic
  const renderContent = () => {
    switch (currentLayout) {
      case "compactList":
        return renderCompactListView();
      case "wideView":
        return renderWideView();
      default:
        return renderStandardView();
    }
  };

  // If a product is selected, render the product detail view
  if (selectedProductId) {
    return renderProductDetailView();
  }

  // Otherwise render the main content
  return (
    <div className="space-y-5">
      {/* Main content */}
      {renderContent()}

      {/* Style Modal */}
      {isStyleModalOpen && (
        <StyleModal
          isOpen={isStyleModalOpen}
          onClose={closeStyleModal}
          style={selectedStyle}
          onSave={selectedStyle ? handleStyleUpdate : handleStyleAdd}
          mode={selectedStyle ? "edit" : "add"}
        />
      )}

      {/* Component Modal */}
      {selectedStyle && isComponentModalOpen && (
        <ComponentModal
          isOpen={isComponentModalOpen}
          onClose={closeComponentModal}
          style={selectedStyle}
          onUpdate={handleStyleUpdate}
        />
      )}
    </div>
  );
}

export default CategoryDetailView;
