import React, { useState, useRef, useEffect } from "react";
import { PLMStatusStage } from "@/types";
import { getStatusDefinition } from "../../utils/statusSystem";
import { ChevronDownIcon, FunnelIcon } from "./icons";

interface StatusFilterProps {
  selectedStatuses: PLMStatusStage[];
  onStatusesChange: (statuses: PLMStatusStage[]) => void;
  className?: string;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  selectedStatuses,
  onStatusesChange,
  className = "",
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleStatusToggle = (status: PLMStatusStage) => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  };

  const handleClearAll = () => {
    onStatusesChange([]);
  };

  const hasSelection = selectedStatuses.length > 0;
  const allStatuses = Object.values(PLMStatusStage);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`
          inline-flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm font-medium transition-all
          ${
            hasSelection
              ? "bg-sky-50 border-sky-200 text-sky-700"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }
        `}
      >
        <FunnelIcon className="w-4 h-4" />
        <span>Status {hasSelection && `(${selectedStatuses.length})`}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 right-0">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Filter by Status
              </h3>
              {hasSelection && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2">
              {allStatuses.map((status) => {
                const statusDef = getStatusDefinition(status);
                const isSelected = selectedStatuses.includes(status);

                return (
                  <label
                    key={status}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded-md"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleStatusToggle(status)}
                      className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <div
                        className={`
                        w-3 h-3 rounded-full 
                        ${statusDef.bgColorClass}
                        ${statusDef.colorClass.replace(
                          "text-",
                          "border-"
                        )} border-2
                      `}
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {statusDef.label}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusFilter;
