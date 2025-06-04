import React, { useState } from "react";
import Modal from "./Modal";

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProgram: (
    name: string,
    season: string,
    targetMargin: number,
    targetSellThrough: number,
    targetRevenue: number
  ) => void;
}

const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  isOpen,
  onClose,
  onCreateProgram,
}) => {
  const [name, setName] = useState("");
  const [season, setSeason] = useState("");
  const [targetMargin, setTargetMargin] = useState<number | "">(60);
  const [targetSellThrough, setTargetSellThrough] = useState<number | "">(85);
  const [targetRevenue, setTargetRevenue] = useState<number | "">(350000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !season ||
      targetMargin === "" ||
      targetSellThrough === "" ||
      targetRevenue === ""
    )
      return;

    onCreateProgram(
      name,
      season,
      targetMargin,
      targetSellThrough,
      targetRevenue
    );

    onClose();
    setName("");
    setSeason("");
    setTargetMargin(60);
    setTargetSellThrough(85);
    setTargetRevenue(350000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Program">
      <p className="text-sm text-slate-500 mb-4">
        Start a new assortment planning program.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="programName"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Program Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="programName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Fall Collection 2024"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
          />
        </div>

        <div>
          <label
            htmlFor="programSeason"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Season <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="programSeason"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            placeholder="e.g., SS26"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
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
            placeholder="e.g., 350000"
            className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
            required
            min="0"
            step="1000"
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
            Create Program
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProgramModal;
