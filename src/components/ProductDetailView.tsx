import React, { useState } from "react";
import { PlannedStyle, ProductTag } from "../types";
import { productTagLibrary } from "../data/index";
import {
  ChevronLeftIcon,
  PencilIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  CollectionIcon,
} from "./icons";

interface ProductDetailViewProps {
  product: PlannedStyle;
  onBack: () => void;
  onUpdateProduct: (updatedProduct: PlannedStyle) => void;
}

const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onUpdateProduct,
}) => {
  const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);
  const [selectedTagCategory, setSelectedTagCategory] = useState<string | null>(
    null
  );

  const getTagsForProduct = (): ProductTag[] => {
    if (!product.tags) return [];
    return productTagLibrary.filter((tag: ProductTag) =>
      product.tags!.includes(tag.id)
    );
  };

  const getAvailableTags = (): ProductTag[] => {
    const currentTagIds = product.tags || [];
    return productTagLibrary.filter(
      (tag: ProductTag) => !currentTagIds.includes(tag.id)
    );
  };

  const getTagsByCategory = (tags: ProductTag[]) => {
    const categories = ["style", "occasion", "trend", "season", "performance"];
    return categories.reduce((acc, category) => {
      acc[category] = tags.filter(
        (tag: ProductTag) => tag.category === category
      );
      return acc;
    }, {} as Record<string, ProductTag[]>);
  };

  const addTag = (tagId: string) => {
    const currentTags = product.tags || [];
    const updatedProduct = {
      ...product,
      tags: [...currentTags, tagId],
    };
    onUpdateProduct(updatedProduct);
  };

  const removeTag = (tagId: string) => {
    const currentTags = product.tags || [];
    const updatedProduct = {
      ...product,
      tags: currentTags.filter((id) => id !== tagId),
    };
    onUpdateProduct(updatedProduct);
  };

  const getTagColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
      slate: "bg-slate-100 text-slate-800 border-slate-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
      amber: "bg-amber-100 text-amber-800 border-amber-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200",
      emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
      violet: "bg-violet-100 text-violet-800 border-violet-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
      lime: "bg-lime-100 text-lime-800 border-lime-200",
      sky: "bg-sky-100 text-sky-800 border-sky-200",
      neutral: "bg-neutral-100 text-neutral-800 border-neutral-200",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const currentTags = getTagsForProduct();
  const availableTags = getAvailableTags();
  const availableTagsByCategory = getTagsByCategory(availableTags);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 mr-3 text-slate-500 hover:bg-slate-200 rounded-full transition-colors active:bg-slate-300"
            title="Back to Project"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">
              {product.name}
            </h2>
            <p className="text-sm text-slate-600">{product.color}</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors">
          <PencilIcon className="w-4 h-4" />
          <span>Edit Product</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Image */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="aspect-w-1 aspect-h-1 bg-slate-100 rounded-lg overflow-hidden mb-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <CollectionIcon className="w-16 h-16 text-slate-300" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-slate-500">{product.color}</p>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Product Details
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-medium text-slate-900">{product.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Margin</p>
                <p className="font-medium text-slate-900">
                  {(product.margin * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Cost Price</p>
                <p className="font-medium text-slate-900">
                  ${product.costPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Selling Price</p>
                <p className="font-medium text-slate-900">
                  ${product.sellingPrice.toFixed(2)}
                </p>
              </div>
            </div>
            {(product.projectedSellIn || product.projectedSellThrough) && (
              <div className="grid grid-cols-2 gap-4">
                {product.projectedSellIn && (
                  <div>
                    <p className="text-sm text-slate-500">Projected Sell-In</p>
                    <p className="font-medium text-slate-900">
                      {product.projectedSellIn.toLocaleString()}
                    </p>
                  </div>
                )}
                {product.projectedSellThrough && (
                  <div>
                    <p className="text-sm text-slate-500">
                      Projected Sell-Through
                    </p>
                    <p className="font-medium text-slate-900">
                      {(product.projectedSellThrough * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <TagIcon className="w-5 h-5 mr-2" />
              Product Tags
            </h3>
            <button
              onClick={() => setIsTagSelectorOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Tag</span>
            </button>
          </div>

          {/* Current Tags */}
          <div className="space-y-3">
            {currentTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTagColorClasses(
                      tag.color
                    )}`}
                  >
                    {tag.name}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1.5 hover:text-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No tags assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Tag Selector Modal */}
      {isTagSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Add Product Tags
              </h3>
              <button
                onClick={() => setIsTagSelectorOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Category Filter */}
              <div className="flex space-x-2 mb-6">
                <button
                  onClick={() => setSelectedTagCategory(null)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedTagCategory === null
                      ? "bg-sky-100 text-sky-700 border border-sky-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Categories
                </button>
                {Object.keys(availableTagsByCategory).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedTagCategory(category)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${
                      selectedTagCategory === category
                        ? "bg-sky-100 text-sky-700 border border-sky-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Available Tags */}
              <div className="space-y-4">
                {Object.entries(availableTagsByCategory).map(
                  ([category, tags]) => {
                    if (selectedTagCategory && selectedTagCategory !== category)
                      return null;
                    if (tags.length === 0) return null;

                    return (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-slate-700 mb-2 capitalize">
                          {category} Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                addTag(tag.id);
                                setIsTagSelectorOpen(false);
                              }}
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors hover:shadow-sm ${getTagColorClasses(
                                tag.color
                              )}`}
                            >
                              <PlusIcon className="w-3 h-3 mr-1" />
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailView;
