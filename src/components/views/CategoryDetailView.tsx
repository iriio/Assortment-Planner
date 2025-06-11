import { useState } from "react";
import { CollectionIcon, PencilIcon } from "@/components/common/icons";
import {
  LinePlanCategory,
  PlannedStyle,
  PLMStatusStage,
  PlannedStyleStatus,
} from "@/types";
import { LayoutViewOption } from "@/types/layout";
import StyleModal from "@/components/modals/StyleModal";
import ComponentModal from "@/components/modals/ComponentModal";
import ProductDetailView from "./ProductDetailView";
import TagListDisplay from "@/components/common/TagListDisplay";
import StatusBadge from "@/components/common/StatusBadge";
import { calculateCategoryStatus } from "@/utils/statusSystem";
import ProductImagePlaceholder from "@/components/common/ProductImagePlaceholder";

interface CategoryDetailViewProps {
  category: LinePlanCategory;
  onUpdateStyle: (categoryId: string, style: PlannedStyle) => void;
  onAddStyle: (categoryId: string, style: PlannedStyle) => void;
  currentLayout: LayoutViewOption;
  programName: string;
  selectedProductId?: string | null;
  onProductSelect?: (productId: string) => void;
  onProductBack?: () => void;
}

export function CategoryDetailView({
  category,
  onUpdateStyle,
  onAddStyle,
  currentLayout,
  programName,
  selectedProductId,
  onProductSelect,
  onProductBack,
}: CategoryDetailViewProps) {
  const [selectedStyle, setSelectedStyle] = useState<PlannedStyle | null>(null);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  const openStyleModal = (styleToEdit?: PlannedStyle) => {
    setSelectedStyle(styleToEdit || null);
    setIsStyleModalOpen(true);
  };

  const closeStyleModal = () => {
    setSelectedStyle(null);
    setIsStyleModalOpen(false);
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
    if (onProductSelect) {
      onProductSelect(style.id);
    }
  };

  const handleProductDetailBack = () => {
    if (onProductBack) {
      onProductBack();
    }
  };

  const handleFullProductUpdate = (updatedProduct: PlannedStyle) => {
    onUpdateStyle(category.id, updatedProduct);
  };

  const categoryPlmStatus =
    category.plmStatus || calculateCategoryStatus(category);

  const handleStylePlmStatusChange = (
    styleId: string,
    newStatus: PLMStatusStage
  ) => {
    const styleToUpdate = category.plannedStyles.find((s) => s.id === styleId);
    if (styleToUpdate) {
      onUpdateStyle(category.id, { ...styleToUpdate, plmStatus: newStatus });
    }
  };

  if (selectedProductId) {
    const productForDetailView = category.plannedStyles.find(
      (style) => style.id === selectedProductId
    );
    if (productForDetailView) {
      return (
        <ProductDetailView
          product={productForDetailView}
          onBack={handleProductDetailBack}
          onUpdateProduct={handleFullProductUpdate}
          categoryName={category.name}
          programName={programName}
        />
      );
    }
  }

  const renderStandardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {category.plannedStyles.map((style: PlannedStyle) => {
        const currentStylePlmStatus =
          style.plmStatus || PLMStatusStage.BRIEFING;

        return (
          <div
            key={style.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all duration-200 cursor-pointer group flex flex-col"
            onClick={() => handleProductClick(style)}
          >
            <div className="relative aspect-square">
              {style.imageUrl ? (
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover rounded-t-xl"
                />
              ) : (
                <ProductImagePlaceholder
                  productName={style.name}
                  size="lg"
                  className="rounded-t-xl"
                />
              )}
              {/* Floating status badge */}
              <div
                className="absolute top-3 left-3"
                onClick={(e) => e.stopPropagation()}
              >
                <StatusBadge
                  status={currentStylePlmStatus}
                  onStatusChange={(newStatus) =>
                    handleStylePlmStatusChange(style.id, newStatus)
                  }
                  interactive={true}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
              <div>
                <h3
                  className="text-sm font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors"
                  title={style.name}
                >
                  {style.name}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {style.color || "N/A"}
                </p>
              </div>

              <div>
                <TagListDisplay
                  tagIds={style.tags}
                  size="xs"
                  itemType="product"
                  maxVisibleTags={2}
                />
              </div>

              <div className="flex items-center justify-between pt-2 mt-auto border-t border-slate-100">
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
                    onClick={() => openStyleModal(style)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit Style Details"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openComponentModal(style)}
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
        );
      })}
    </div>
  );

  const renderCompactListView = () => (
    <div className="divide-y divide-slate-100">
      {category.plannedStyles.map((style: PlannedStyle) => {
        const currentStylePlmStatus =
          style.plmStatus || PLMStatusStage.BRIEFING;

        return (
          <div
            key={style.id}
            className="p-3 flex items-center space-x-3 hover:bg-slate-50 group transition-colors"
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-md bg-slate-100 overflow-hidden cursor-pointer"
              onClick={() => handleProductClick(style)}
            >
              {style.imageUrl ? (
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              ) : style.status === PlannedStyleStatus.PLACEHOLDER ? (
                <ProductImagePlaceholder
                  productName={style.name}
                  size="sm"
                  className="rounded-md"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CollectionIcon className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => handleProductClick(style)}
            >
              <p
                className="text-sm font-medium text-slate-800 truncate group-hover:text-sky-600"
                title={style.name}
              >
                {style.name}
              </p>
              <p
                className="text-xs text-slate-500 truncate"
                title={style.color}
              >
                {style.color || "N/A"}
              </p>
            </div>
            <div
              className="flex-shrink-0 mx-2"
              onClick={(e) => e.stopPropagation()}
            >
              <StatusBadge
                status={currentStylePlmStatus}
                onStatusChange={(newStatus) =>
                  handleStylePlmStatusChange(style.id, newStatus)
                }
                interactive={true}
              />
            </div>
            <div
              className="flex-shrink-0 w-24 text-right cursor-pointer"
              onClick={() => handleProductClick(style)}
            >
              <p className="text-sm font-medium text-slate-700">
                {(style.margin * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">
                ${style.sellingPrice.toFixed(0)}
              </p>
            </div>
            <div
              className="flex-shrink-0 flex items-center space-x-1 ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => openStyleModal(style)}
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
                title="Edit Style Details"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
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
            <div
              key={status}
              className="flex-shrink-0 w-80 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-800">
                    {status.charAt(0) +
                      status.slice(1).toLowerCase().replace(/_/g, " ")}
                  </h3>
                  <span className="text-sm text-slate-500">
                    {stylesByStatus[status]?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {(stylesByStatus[status] || []).map((style) => (
                  <div
                    key={style.id}
                    className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProductClick(style)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                        {style.imageUrl ? (
                          <img
                            src={style.imageUrl}
                            alt={style.name}
                            className="w-full h-full object-cover"
                          />
                        ) : style.status === PlannedStyleStatus.PLACEHOLDER ? (
                          <ProductImagePlaceholder
                            productName={style.name}
                            size="sm"
                            className="rounded"
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

  let viewToRender;
  switch (currentLayout) {
    case "standard":
      viewToRender = renderStandardView();
      break;
    case "compactList":
      viewToRender = renderCompactListView();
      break;
    case "wideView":
      viewToRender = renderWideView();
      break;
    default:
      viewToRender = renderStandardView();
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="p-4 md:p-5 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2
            className="text-xl md:text-2xl font-bold text-slate-800 truncate mb-2 sm:mb-0"
            title={category.name}
          >
            {category.name}
          </h2>
          <div onClick={(e) => e.stopPropagation()}>
            <StatusBadge
              status={categoryPlmStatus}
              interactive={false}
              size="md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <h4 className="text-xs text-slate-500 uppercase font-semibold">
              Target Volume
            </h4>
            <p className="text-slate-700 mt-0.5">
              {category.targetVolume
                ? `${category.targetVolume.toLocaleString()} units`
                : "N/A"}
            </p>
          </div>
          {category.targetMetrics && (
            <>
              <div>
                <h4 className="text-xs text-slate-500 uppercase font-semibold">
                  Target Margin
                </h4>
                <p className="text-slate-700 mt-0.5">
                  {category.targetMetrics.margin !== undefined
                    ? `${(category.targetMetrics.margin * 100).toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-slate-500 uppercase font-semibold">
                  Target Revenue
                </h4>
                <p className="text-slate-700 mt-0.5">
                  {category.targetMetrics.revenue !== undefined
                    ? `$${category.targetMetrics.revenue.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-slate-500 uppercase font-semibold">
                  Target Sell-Through
                </h4>
                <p className="text-slate-700 mt-0.5">
                  {category.targetMetrics.sellThrough !== undefined
                    ? `${(category.targetMetrics.sellThrough * 100).toFixed(
                        1
                      )}%`
                    : "N/A"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">{viewToRender}</div>

      {isStyleModalOpen && (
        <StyleModal
          isOpen={isStyleModalOpen}
          onClose={closeStyleModal}
          onSave={selectedStyle?.id ? handleStyleUpdate : handleStyleAdd}
          style={selectedStyle}
          mode={selectedStyle?.id ? "edit" : "add"}
        />
      )}
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
