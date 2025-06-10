import React from "react";
import { ArrowUpTrayIcon, PlusCircleIcon, CollectionIcon } from "./icons";

interface AddOptionsPopoverProps {
  onAddCategory: () => void;
  onAddCarryover: () => void;
  onAddPlaceholder: () => void;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}

const AddOptionsPopover: React.FC<AddOptionsPopoverProps> = ({
  onAddCategory,
  onAddCarryover,
  onAddPlaceholder,
  isOpen,
  onClose,
  anchorRef,
}) => {
  if (!isOpen) return null;

  const anchorRect = anchorRef.current?.getBoundingClientRect();
  if (!anchorRect) return null;

  const options = [
    {
      label: "Add Category",
      icon: CollectionIcon,
      onClick: onAddCategory,
      description: "Create a new category for your line plan",
      color: "green",
    },
    {
      label: "Add Carryover",
      icon: ArrowUpTrayIcon,
      onClick: onAddCarryover,
      description: "Pull in styles from the catalogue",
      color: "sky",
    },
    {
      label: "Add Placeholder",
      icon: PlusCircleIcon,
      onClick: onAddPlaceholder,
      description: "Create a placeholder style",
      color: "indigo",
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2"
        style={{
          top: (anchorRect?.bottom || 0) + 8,
          right: window.innerWidth - (anchorRect?.right || 0),
        }}
      >
        {options.map((option) => (
          <button
            key={option.label}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className={`w-full text-left px-3 py-2.5 hover:bg-${option.color}-50 flex items-start space-x-3 group transition-colors`}
          >
            <option.icon
              className={`w-5 h-5 text-${option.color}-500 mt-0.5 flex-shrink-0`}
            />
            <div>
              <div
                className={`text-sm font-medium text-${option.color}-700 group-hover:text-${option.color}-800`}
              >
                {option.label}
              </div>
              <div className="text-xs text-slate-500 group-hover:text-slate-600 mt-0.5">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default AddOptionsPopover;
