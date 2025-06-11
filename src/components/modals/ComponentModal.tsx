import React, { useState } from "react";
import { PlannedStyle, StyleComponentUsage, MasterComponent } from "@/types";
import Modal from "./Modal";
import { masterComponentsData } from "../../data";

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  style: PlannedStyle;
  onUpdate: (style: PlannedStyle) => void;
}

const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  onClose,
  style,
  onUpdate,
}) => {
  const [selectedComponents, setSelectedComponents] = useState<
    StyleComponentUsage[]
  >(style.components || []);

  const handleComponentToggle = (component: MasterComponent) => {
    setSelectedComponents((prev) => {
      const exists = prev.find((c) => c.componentId === component.id);
      if (exists) {
        return prev.filter((c) => c.componentId !== component.id);
      } else {
        return [...prev, { componentId: component.id, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (componentId: string, quantity: number) => {
    setSelectedComponents((prev) =>
      prev.map((c) => (c.componentId === componentId ? { ...c, quantity } : c))
    );
  };

  const handleSave = () => {
    onUpdate({
      ...style,
      components: selectedComponents,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Style Components"
      size="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {masterComponentsData.map((component) => {
            const selectedComponent = selectedComponents.find(
              (c) => c.componentId === component.id
            );
            const isSelected = !!selectedComponent;
            return (
              <div key={component.id} className="space-y-2">
                <button
                  onClick={() => handleComponentToggle(component)}
                  className={`p-4 rounded-lg border w-full ${
                    isSelected
                      ? "border-sky-500 bg-sky-50 ring-2 ring-sky-500 ring-offset-2"
                      : "border-slate-200 hover:border-sky-400 hover:bg-sky-50/50"
                  } transition-all duration-150 ease-in-out text-left space-y-2`}
                >
                  <div className="aspect-square rounded-md bg-slate-100 flex items-center justify-center">
                    {component.imageUrl ? (
                      <img
                        src={component.imageUrl}
                        alt={component.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="text-2xl text-slate-400">
                        {component.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">
                      {component.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      ${component.cost.toFixed(2)}
                    </p>
                  </div>
                </button>
                {isSelected && (
                  <div className="px-2">
                    <label className="block text-xs text-slate-600 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={selectedComponent.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          component.id,
                          parseFloat(e.target.value) || 0.1
                        )
                      }
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
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
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ComponentModal;
