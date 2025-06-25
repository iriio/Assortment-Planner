import React, { useEffect } from "react";
import { ChevronLeftIcon, PencilIcon } from "@/components/common/icons";
import { PlannedStyle, ProductTag } from "@/types";
import { productTagsData } from "@/data";

import ProductImagePlaceholder from "@/components/common/ProductImagePlaceholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProductDetailView: React.FC<{
  product: PlannedStyle;
  onBack: () => void;
  onUpdateProduct: (updatedProduct: PlannedStyle) => void;
  categoryName: string;
  programName: string;
}> = ({ product, onBack, onUpdateProduct, categoryName }) => {
  // Add debug logging for component mount
  useEffect(() => {
    console.log("ProductDetailView mounted with product:", product.id);
    return () => {
      console.log("ProductDetailView unmounted");
    };
  }, [product.id]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Back button clicked");
    onBack();
  };

  const getTagsForProduct = (): ProductTag[] => {
    if (!product.tags) return [];
    return productTagsData.filter((tag: ProductTag) =>
      product.tags!.includes(tag.id)
    );
  };

  const getAvailableTags = (): ProductTag[] => {
    const currentTagIds = product.tags || [];
    return productTagsData.filter(
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
    <div className="h-full min-h-0 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Back to {categoryName}
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              {product.status}
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <PencilIcon className="w-4 h-4" />
              Edit Details
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Image */}
          <div className="col-span-4">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-square bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ProductImagePlaceholder
                      productName={product.name}
                      size="lg"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {product.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{product.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Info & Components */}
          <div className="col-span-5">
            <div className="space-y-6">
              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">
                        Margin
                      </h4>
                      <p className="text-lg font-medium text-slate-900">
                        {(product.margin * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">
                        Cost Price
                      </h4>
                      <p className="text-lg font-medium text-slate-900">
                        ${product.costPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">
                        Selling Price
                      </h4>
                      <p className="text-lg font-medium text-slate-900">
                        ${product.sellingPrice.toFixed(2)}
                      </p>
                    </div>
                    {(product.projectedSellIn ||
                      product.projectedSellThrough) && (
                      <div>
                        <h4 className="text-xs text-slate-500 uppercase font-semibold mb-1">
                          Projections
                        </h4>
                        <div className="space-y-1">
                          {product.projectedSellIn && (
                            <p className="text-sm text-slate-700">
                              Sell-In:{" "}
                              {product.projectedSellIn.toLocaleString()} units
                            </p>
                          )}
                          {product.projectedSellThrough && (
                            <p className="text-sm text-slate-700">
                              Sell-Through:{" "}
                              {(product.projectedSellThrough * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Components */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Components</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <PencilIcon className="w-4 h-4" />
                      Edit Components
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-500">
                    Component management will be implemented in a future update.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Tags & Notes */}
          <div className="col-span-3">
            <div className="space-y-6">
              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(availableTagsByCategory).map(
                      ([category, tags]) => (
                        <div key={category}>
                          <h4 className="text-xs text-slate-500 uppercase font-semibold mb-2">
                            {category}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  if (
                                    currentTags.some((t) => t.id === tag.id)
                                  ) {
                                    removeTag(tag.id);
                                  } else {
                                    addTag(tag.id);
                                  }
                                }}
                                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                                  currentTags.some((t) => t.id === tag.id)
                                    ? "bg-sky-100 text-sky-700 hover:bg-sky-200"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-500">
                    Notes functionality will be implemented in a future update.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
