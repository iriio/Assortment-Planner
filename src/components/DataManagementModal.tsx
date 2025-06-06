import React, { useState } from "react";
import Modal from "./Modal";
import { exportData, importData, clearAllData } from "../utils/localStorage";
import { DownloadSimpleIcon, UploadSimpleIcon, TrashIcon } from "./icons";

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported?: () => void; // Callback to refresh the app after import
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  const [importText, setImportText] = useState("");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleExport = () => {
    try {
      const exportedData = exportData();

      // Create and download file
      const blob = new Blob([exportedData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assortment-planner-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "Data exported successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to export data" });
      console.error("Export error:", error);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setMessage({ type: "error", text: "Please paste your data first" });
      return;
    }

    try {
      const success = importData(importText);
      if (success) {
        setMessage({ type: "success", text: "Data imported successfully!" });
        setImportText("");
        // Trigger page refresh or callback to reload data
        if (onDataImported) {
          setTimeout(() => {
            onDataImported();
            onClose();
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        setMessage({
          type: "error",
          text: "Failed to import data. Please check the format.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Invalid data format" });
      console.error("Import error:", error);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (showConfirmClear) {
      const success = clearAllData();
      if (success) {
        setMessage({ type: "success", text: "All data cleared successfully!" });
        setShowConfirmClear(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ type: "error", text: "Failed to clear data" });
      }
    } else {
      setShowConfirmClear(true);
    }
  };

  const resetModal = () => {
    setImportText("");
    setShowConfirmClear(false);
    setMessage(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Data Management"
      size="lg"
    >
      <div className="space-y-6">
        {message && (
          <div
            className={`p-3 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Export Data</h3>
          <p className="text-sm text-slate-600">
            Download all your programs, projects, and preferences as a backup
            file.
          </p>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium"
          >
            <DownloadSimpleIcon className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>

        <hr className="border-slate-200" />

        {/* Import Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Import Data</h3>
          <p className="text-sm text-slate-600">
            Import data from a previously exported backup file. This will
            replace your current data.
          </p>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="file-import"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Choose file:
              </label>
              <input
                id="file-import"
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
            </div>

            <div className="text-sm text-slate-500 text-center">or</div>

            <div>
              <label
                htmlFor="import-text"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Paste data:
              </label>
              <textarea
                id="import-text"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your exported data here..."
                className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <UploadSimpleIcon className="w-4 h-4" />
              <span>Import Data</span>
            </button>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Clear Data Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">
            Clear All Data
          </h3>
          <p className="text-sm text-slate-600">
            Permanently delete all programs, projects, and preferences. This
            action cannot be undone.
          </p>

          {showConfirmClear ? (
            <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">
                Are you sure? This will permanently delete all your data.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearData}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-sm font-medium hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClearData}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-200 mt-6">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default DataManagementModal;
