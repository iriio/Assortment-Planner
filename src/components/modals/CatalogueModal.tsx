import React, { useState, useMemo } from "react";
import { ProductCatalogueItem } from "@/types";
import Modal from "./Modal";
import { MagnifyingGlassIcon, PlusCircleIcon } from "../common/icons";

interface CatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogueItems: ProductCatalogueItem[];
  onSelectItemForAdding: (item: ProductCatalogueItem) => void;
}

const CatalogueModal: React.FC<CatalogueModalProps> = ({
  isOpen,
  onClose,
  catalogueItems,
  onSelectItemForAdding,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMinMargin, setFilterMinMargin] = useState("");

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    catalogueItems.forEach((item) => cats.add(item.categoryName));
    return Array.from(cats).sort();
  }, [catalogueItems]);

  const filteredItems = useMemo(() => {
    const minMargin = parseFloat(filterMinMargin) / 100;
    return catalogueItems.filter((item) => {
      const nameMatch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const categoryMatch = filterCategory
        ? item.categoryName === filterCategory
        : true;
      const marginMatch = !isNaN(minMargin) ? item.margin >= minMargin : true;
      return nameMatch && categoryMatch && marginMatch;
    });
  }, [catalogueItems, searchTerm, filterCategory, filterMinMargin]);

  const modalFooter = (
    <button
      type="button"
      onClick={onClose}
      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition-all duration-150 ease-in-out active:bg-slate-200/70 active:scale-[0.98]"
      title="Close catalogue browser"
    >
      Close Catalogue
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Catalogue"
      size="4xl"
      footer={modalFooter}
    >
      <div
        className="space-y-5 flex flex-col"
        style={{ height: "calc(80vh - 140px)" }}
      >
        <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-end flex-shrink-0">
          <div className="flex-grow">
            <label
              htmlFor="catalogueSearchTerm"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Search by Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="catalogueSearchTerm"
                placeholder="e.g., Slim Fit Jeans"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white placeholder-slate-400/80"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="catalogueFilterCategory"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Category
            </label>
            <select
              id="catalogueFilterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full py-2.5 px-3 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="catalogueFilterMinMargin"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Min. Margin (%)
            </label>
            <input
              type="number"
              id="catalogueFilterMinMargin"
              placeholder="e.g., 60"
              value={filterMinMargin}
              onChange={(e) => setFilterMinMargin(e.target.value)}
              className="block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white placeholder-slate-400/80"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-0.5 styled-scrollbar">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-0.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between border border-slate-200/80 hover:shadow-xl hover:border-slate-300/70 transition-all duration-200 ease-out group transform hover:-translate-y-0.5"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-4">
                    <h3
                      className="text-sm font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors"
                      title={item.name}
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {item.categoryName} - {item.season}
                    </p>
                    <div className="mt-2.5 flex justify-between items-center text-xs">
                      <span className="text-slate-600">
                        Cost: ${item.costPrice.toFixed(2)}
                      </span>
                      <span
                        className={`font-semibold ${
                          item.margin >= 0.6
                            ? "text-green-600"
                            : item.margin >= 0.4
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        Margin: {(item.margin * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 border-t border-slate-200/60">
                    <button
                      onClick={() => onSelectItemForAdding(item)}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-3 rounded-lg shadow-sm flex items-center justify-center space-x-1.5 transition-all duration-150 ease-in-out text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 active:bg-sky-700 active:scale-[0.98]"
                      title={`Add ${item.name} to plan`}
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                      <span>Add to Plan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center h-full">
              <MagnifyingGlassIcon className="mx-auto h-14 w-14 text-slate-300" />
              <h3 className="mt-4 text-md font-semibold text-slate-700">
                No Products Match Your Criteria
              </h3>
              <p className="mt-1.5 text-sm text-slate-500">
                Try adjusting your filters or search term to find what you're
                looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CatalogueModal;
