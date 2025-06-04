import React, { useState } from "react";
import { PlannedStyle, PlannedStyleStatus } from "../types";
import Modal from "./Modal";

interface StyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (style: PlannedStyle) => void;
  style?: PlannedStyle | null;
  mode: "add" | "edit";
}

const StyleModal: React.FC<StyleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  style,
  mode,
}) => {
  const [formData, setFormData] = useState<Partial<PlannedStyle>>(
    style || {
      name: "",
      color: "",
      costPrice: 0,
      sellingPrice: 0,
      margin: 0,
      status: PlannedStyleStatus.PLACEHOLDER,
      projectedSellThrough: 0.8,
      projectedSellIn: 0,
      components: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const margin =
      (formData.sellingPrice! - formData.costPrice!) / formData.sellingPrice!;
    onSave({
      id: style?.id || crypto.randomUUID(),
      ...formData,
      margin,
      status: PlannedStyleStatus.PLACEHOLDER,
      components: style?.components || [],
    } as PlannedStyle);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add New Style" : "Edit Style"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Style Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-slate-700"
            >
              Color
            </label>
            <input
              type="text"
              id="color"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="costPrice"
                className="block text-sm font-medium text-slate-700"
              >
                Cost Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="costPrice"
                  value={formData.costPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      costPrice: parseFloat(e.target.value),
                    }))
                  }
                  className="block w-full rounded-md border-slate-300 pl-7 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sellingPrice"
                className="block text-sm font-medium text-slate-700"
              >
                Selling Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-slate-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sellingPrice: parseFloat(e.target.value),
                    }))
                  }
                  className="block w-full rounded-md border-slate-300 pl-7 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="projectedSellThrough"
                className="block text-sm font-medium text-slate-700"
              >
                Projected Sell-Through
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="projectedSellThrough"
                  value={formData.projectedSellThrough}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectedSellThrough: parseFloat(e.target.value),
                    }))
                  }
                  className="block w-full rounded-md border-slate-300 pr-12 focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  placeholder="0.80"
                  step="0.01"
                  min="0"
                  max="1"
                  required
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-slate-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="projectedSellIn"
                className="block text-sm font-medium text-slate-700"
              >
                Projected Sell-In
              </label>
              <input
                type="number"
                id="projectedSellIn"
                value={formData.projectedSellIn}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    projectedSellIn: parseInt(e.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-5 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white py-2 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            {mode === "add" ? "Add Style" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StyleModal;
