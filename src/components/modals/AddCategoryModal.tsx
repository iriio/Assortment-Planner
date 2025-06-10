import React, { useState } from "react";
import Modal from "./Modal";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, targetVolume: number) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState("");
  const [targetVolume, setTargetVolume] = useState<number | "">(1000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || targetVolume === "") return;

    onAddCategory(name, targetVolume);

    onClose();
    setName("");
    setTargetVolume(1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Category">
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
            Add Category
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCategoryModal;
