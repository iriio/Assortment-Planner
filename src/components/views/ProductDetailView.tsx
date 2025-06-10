import React, { useState } from "react";
import {
  PlusIcon,
  XMarkIcon,
  ChevronLeftIcon,
  TagIcon,
  PencilIcon,
} from "../common/icons";
import { PlannedStyle, ProductTag } from "../../types";
import { productTagLibrary } from "../../data/index";
import TagChip from "../common/TagChip";
import ProductImagePlaceholder from "../common/ProductImagePlaceholder";

const ProductDetailView: React.FC<{
  product: PlannedStyle;
  onBack: () => void;
  onUpdateProduct: (updatedProduct: PlannedStyle) => void;
  categoryName: string;
  programName: string;
}> = ({ product, onBack, onUpdateProduct, categoryName }) => {
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

  const currentTags = getTagsForProduct();
  const availableTags = getAvailableTags();
  const availableTagsByCategory = getTagsByCategory(availableTags);

  return (
    <div className="h-full p-6 min-h-0">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
        <div className="grid grid-cols-12 gap-0 h-full divide-x-2 divide-slate-200">
          {/* Left Column - Image */}
          <div className="col-span-3 p-6">
            <button
              onClick={onBack}
              className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Back to {categoryName}
            </button>
            <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ProductImagePlaceholder productName={product.name} size="lg" />
              )}
            </div>
          </div>

          {/* Middle Column - Info & Components */}
          <div className="col-span-6 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Product Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase font-semibold">
                      Status
                    </h4>
                    <p className="text-slate-700 mt-0.5">{product.status}</p>
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase font-semibold">
                      Margin
                    </h4>
                    <p className="text-slate-700 mt-0.5">
                      {(product.margin * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase font-semibold">
                      Cost Price
                    </h4>
                    <p className="text-slate-700 mt-0.5">
                      ${product.costPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-500 uppercase font-semibold">
                      Selling Price
                    </h4>
                    <p className="text-slate-700 mt-0.5">
                      ${product.sellingPrice.toFixed(2)}
                    </p>
                  </div>
                  {(product.projectedSellIn ||
                    product.projectedSellThrough) && (
                    <>
                      {product.projectedSellIn && (
                        <div>
                          <h4 className="text-xs text-slate-500 uppercase font-semibold">
                            Projected Sell-In
                          </h4>
                          <p className="text-slate-700 mt-0.5">
                            {product.projectedSellIn.toLocaleString()} units
                          </p>
                        </div>
                      )}
                      {product.projectedSellThrough && (
                        <div>
                          <h4 className="text-xs text-slate-500 uppercase font-semibold">
                            Projected Sell-Through
                          </h4>
                          <p className="text-slate-700 mt-0.5">
                            {(product.projectedSellThrough * 100).toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Components Section */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Components
                  </h3>
                  <button className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition-colors">
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit Components</span>
                  </button>
                </div>
                <div className="text-sm text-slate-500">
                  Component management will be implemented in a future update.
                </div>
              </div>

              {/* Notes Section - Placeholder */}
              <div className="pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Notes
                  </h3>
                  <button className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-lg transition-colors">
                    <PencilIcon className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>
                <div className="text-sm text-slate-500 italic">
                  No notes added yet.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tags */}
          <div className="col-span-3 p-6">
            <div className="sticky top-6">
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
                  <span>Add</span>
                </button>
              </div>

              {/* Current Tags */}
              <div className="space-y-3">
                {currentTags.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {currentTags.map((tag) => (
                      <div key={tag.id} className="relative group">
                        <TagChip tag={tag} size="sm" />
                        <button
                          onClick={() => removeTag(tag.id)}
                          className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove tag"
                        >
                          <XMarkIcon className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No tags assigned
                  </p>
                )}
              </div>
            </div>
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
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors hover:shadow-sm bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                            >
                              <PlusIcon className="w-3 h-3" />
                              <span>{tag.name}</span>
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
