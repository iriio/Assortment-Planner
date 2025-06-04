import React, { useState } from "react";
import Modal from "./Modal";
import { LinePlan } from "../types";

interface EditProgramTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLinePlan: LinePlan;
  onUpdateTargets: (
    targetMargin: number,
    targetSellThrough: number,
    targetRevenue: number
  ) => void;
}

const EditProgramTargetsModal: React.FC<EditProgramTargetsModalProps> = ({
  isOpen,
  onClose,
  currentLinePlan,
  onUpdateTargets,
}) => {
  const [targetMargin, setTargetMargin] = useState(
    currentLinePlan.targetOverallMargin * 100
  );
  const [targetSellThrough, setTargetSellThrough] = useState(
    currentLinePlan.targetOverallSellThrough * 100
  );
  const [targetRevenue, setTargetRevenue] = useState(
    currentLinePlan.targetOverallRevenue / 1000000
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTargets(
      targetMargin / 100,
      targetSellThrough / 100,
      targetRevenue * 1000000
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Program Targets"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="targetMargin"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Target Margin (%)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              name="targetMargin"
              id="targetMargin"
              min="0"
              max="100"
              step="0.1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(parseFloat(e.target.value))}
              className="block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="targetSellThrough"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Target Sell-Through (%)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              name="targetSellThrough"
              id="targetSellThrough"
              min="0"
              max="100"
              step="0.1"
              value={targetSellThrough}
              onChange={(e) => setTargetSellThrough(parseFloat(e.target.value))}
              className="block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="targetRevenue"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Target Revenue (Millions)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="targetRevenue"
              id="targetRevenue"
              min="0"
              step="0.1"
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(parseFloat(e.target.value))}
              className="block w-full pl-7 p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-500 sm:text-sm">M</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition-all duration-150 ease-in-out active:bg-slate-200/70 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all duration-150 ease-in-out active:bg-sky-700 active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProgramTargetsModal;
