import React, { useState } from "react";
import { LinePlanCategory, PlannedStyle, PlannedStyleStatus } from "../types";
import {
  ChevronLeftIcon,
  CollectionIcon,
  PencilIcon,
} from "../components/icons";
import StyleModal from "./StyleModal";
import ComponentModal from "./ComponentModal";
import ProductDetailView from "./ProductDetailView";

interface CategoryDetailViewProps {
  category: LinePlanCategory;
  onBack: () => void;
  onUpdateStyle: (categoryId: string, updatedStyle: PlannedStyle) => void;
  onAddStyle: (categoryId: string, newStyle: PlannedStyle) => void;
  currentLayout: string;
}

const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  onBack,
  onUpdateStyle,
  onAddStyle,
  currentLayout,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<PlannedStyle | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);

  const openStyleModal = (style?: PlannedStyle) => {
    setSelectedStyle(style || null);
    setIsStyleModalOpen(true);
  };

  const closeStyleModal = () => {
    setSelectedStyle(null);
    setIsStyleModalOpen(false);
  };

  const openComponentModal = (style: PlannedStyle) => {
    setSelectedStyle(style);
    setIsComponentModalOpen(true);
  };

  const closeComponentModal = () => {
    setSelectedStyle(null);
    setIsComponentModalOpen(false);
  };

  const handleStyleUpdate = (updatedStyle: PlannedStyle) => {
    onUpdateStyle(category.id, updatedStyle);
    closeStyleModal();
  };

  const handleStyleAdd = (newStyle: PlannedStyle) => {
    onAddStyle(category.id, newStyle);
    closeStyleModal();
  };

  const handleProductClick = (style: PlannedStyle) => {
    setSelectedProductId(style.id);
  };

  const handleProductDetailBack = () => {
    setSelectedProductId(null);
  };

  const handleProductUpdate = (updatedProduct: PlannedStyle) => {
    onUpdateStyle(category.id, updatedProduct);
  };

  // If a product is selected, show the product detail view
  if (selectedProductId) {
    const selectedProduct = category.plannedStyles.find(
      (style) => style.id === selectedProductId
    );
    if (selectedProduct) {
      return (
        <ProductDetailView
          product={selectedProduct}
          onBack={handleProductDetailBack}
          onUpdateProduct={handleProductUpdate}
        />
      );
    }
  }

  const renderStandardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
      {category.plannedStyles.map((style) => (
        <div
          key={style.id}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col h-[360px] cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleProductClick(style)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-slate-900">
                {style.name}
              </h3>
              <p className="text-sm text-slate-500">{style.color}</p>
            </div>
            <div
              className="flex space-x-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => openStyleModal(style)}
                className="text-sky-600 hover:text-sky-700 p-1.5 rounded-md hover:bg-sky-100/70 transition-colors active:bg-sky-200/70"
                title="Edit Style Details"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => openComponentModal(style)}
                className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-md hover:bg-indigo-100/70"
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="aspect-w-4 aspect-h-3 bg-slate-100 rounded-lg overflow-hidden flex-1 mb-3">
            {style.imageUrl ? (
              <img
                src={style.imageUrl}
                alt={style.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CollectionIcon className="w-12 h-12 text-slate-300" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Status</p>
              <p className="font-medium text-slate-900">{style.status}</p>
            </div>
            <div>
              <p className="text-slate-500">Margin</p>
              <p className="font-medium text-slate-900">
                {(style.margin * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-slate-500">Cost Price</p>
              <p className="font-medium text-slate-900">
                ${style.costPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Selling Price</p>
              <p className="font-medium text-slate-900">
                ${style.sellingPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompactListView = () => (
    <div className="space-y-3.5 p-5">
      {category.plannedStyles.map((style) => (
        <div
          key={style.id}
          className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => handleProductClick(style)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8">
              {style.imageUrl ? (
                <img
                  src={style.imageUrl}
                  alt=""
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                  <CollectionIcon className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{style.name}</p>
              <p className="text-xs text-slate-500">{style.color}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Margin</p>
              <p className="text-sm font-medium text-slate-900">
                {(style.margin * 100).toFixed(1)}%
              </p>
            </div>
            <div
              className="flex space-x-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => openStyleModal(style)}
                className="text-sky-600 hover:text-sky-700 p-1.5 rounded-md hover:bg-sky-100/70"
                title="Edit Style Details"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => openComponentModal(style)}
                className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-md hover:bg-indigo-100/70"
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderWideView = () => (
    <div className="p-5">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Style
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Cost
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Margin
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Sell-Through
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {category.plannedStyles.map((style) => (
            <tr
              key={style.id}
              className="hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleProductClick(style)}
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {style.imageUrl ? (
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={style.imageUrl}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CollectionIcon className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-900">
                      {style.name}
                    </div>
                    <div className="text-xs text-slate-500">{style.color}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    style.status === PlannedStyleStatus.PLACEHOLDER
                      ? "bg-slate-100 text-slate-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {style.status}
                </span>
              </td>
              <td className="px-4 py-2.5 text-sm text-slate-900 text-right">
                ${style.costPrice.toFixed(2)}
              </td>
              <td className="px-4 py-2.5 text-sm text-slate-900 text-right">
                ${style.sellingPrice.toFixed(2)}
              </td>
              <td className="px-4 py-2.5 text-sm text-slate-900 text-right">
                {(style.margin * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-sm text-slate-900 text-right">
                {((style.projectedSellThrough || 0) * 100).toFixed(1)}%
              </td>
              <td
                className="px-4 py-2.5 text-sm space-x-1 whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => openStyleModal(style)}
                  className="text-sky-600 hover:text-sky-700 p-1.5 rounded-md hover:bg-sky-100/70"
                  title="Edit Style Details"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openComponentModal(style)}
                  className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-md hover:bg-indigo-100/70"
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
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 mr-3 text-slate-500 hover:bg-slate-200 rounded-full transition-colors active:bg-slate-300"
            title="Back to Overview"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">
            {category.name} - Products{" "}
            <span className="text-slate-500 font-normal text-lg">
              ({category.plannedStyles.length})
            </span>
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {currentLayout === "standard" && renderStandardView()}
        {currentLayout === "compactList" && renderCompactListView()}
        {currentLayout === "wideView" && renderWideView()}
        {category.plannedStyles.length === 0 && (
          <div className="text-center py-16 px-6">
            <CollectionIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-md font-semibold text-slate-700">
              No Products Yet
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              This project is empty.
            </p>
          </div>
        )}
      </div>

      {isStyleModalOpen && (
        <StyleModal
          isOpen={isStyleModalOpen}
          onClose={closeStyleModal}
          onSave={selectedStyle ? handleStyleUpdate : handleStyleAdd}
          style={selectedStyle}
          mode={selectedStyle ? "edit" : "add"}
        />
      )}

      {isComponentModalOpen && selectedStyle && (
        <ComponentModal
          isOpen={isComponentModalOpen}
          onClose={closeComponentModal}
          style={selectedStyle}
          onUpdate={handleStyleUpdate}
        />
      )}
    </div>
  );
};

export default CategoryDetailView;
