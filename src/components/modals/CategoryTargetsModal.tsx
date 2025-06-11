import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { LinePlanCategory } from "@/types";

interface CategoryTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<LinePlanCategory>) => void;
  initialValues?: Partial<LinePlanCategory>;
}

const CategoryTargetsModal: React.FC<CategoryTargetsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValues = {},
}) => {
  const [name, setName] = useState(initialValues.name || "");
  const [targetVolume, setTargetVolume] = useState<number | "">(
    initialValues.targetVolume || ""
  );
  const [targetMargin, setTargetMargin] = useState<number | "">(
    initialValues.targetMetrics?.margin
      ? initialValues.targetMetrics.margin * 100
      : 60
  );
  const [targetRevenue, setTargetRevenue] = useState<number | "">(
    initialValues.targetMetrics?.revenue || ""
  );
  const [targetSellThrough, setTargetSellThrough] = useState<number | "">(
    initialValues.targetMetrics?.sellThrough
      ? initialValues.targetMetrics.sellThrough * 100
      : 85
  );

  // Reset form state when modal opens or initialValues change
  useEffect(() => {
    if (isOpen) {
      setName(initialValues.name || "");
      setTargetVolume(initialValues.targetVolume || "");
      setTargetMargin(
        initialValues.targetMetrics?.margin
          ? initialValues.targetMetrics.margin * 100
          : 60
      );
      setTargetRevenue(initialValues.targetMetrics?.revenue || "");
      setTargetSellThrough(
        initialValues.targetMetrics?.sellThrough
          ? initialValues.targetMetrics.sellThrough * 100
          : 85
      );
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      targetVolume === "" ||
      targetMargin === "" ||
      targetRevenue === "" ||
      targetSellThrough === ""
    )
      return;

    onSave({
      name,
      targetVolume: Number(targetVolume),
      targetMetrics: {
        margin: Number(targetMargin) / 100,
        revenue: Number(targetRevenue),
        sellThrough: Number(targetSellThrough) / 100,
      },
      plannedStyles: [],
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialValues.id ? "Edit Category Targets" : "Create New Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="categoryName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dresses"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
          />
        </div>

        <div>
          <label
            htmlFor="targetVolume"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Target Volume (Units) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="targetVolume"
            value={targetVolume}
            onChange={(e) =>
              setTargetVolume(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="e.g., 1000"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
            min="0"
          />
        </div>

        <div>
          <label
            htmlFor="targetRevenue"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Target Revenue ($) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="targetRevenue"
            value={targetRevenue}
            onChange={(e) =>
              setTargetRevenue(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="e.g., 150000"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
            min="0"
          />
        </div>

        <div>
          <label
            htmlFor="targetMargin"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Target Margin (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="targetMargin"
            value={targetMargin}
            onChange={(e) =>
              setTargetMargin(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="e.g., 60"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div>
          <label
            htmlFor="targetSellThrough"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Target Sell-Through (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="targetSellThrough"
            value={targetSellThrough}
            onChange={(e) =>
              setTargetSellThrough(e.target.value ? Number(e.target.value) : "")
            }
            placeholder="e.g., 85"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            {initialValues.id ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryTargetsModal;
