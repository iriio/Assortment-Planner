import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  LinePlanCategory,
  PlannedStyle,
  MasterComponent,
  PlannedStyleStatus,
  StyleComponentUsage,
  StyleMetricViewOption,
} from "../types";
import { masterComponentsData as allMasterComponents } from "../data";
import { updateStyleFinancials, generateId } from "../services/planningService";
import Modal from "../components/Modal";
import {
  PencilIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  CollectionIcon,
  InformationCircleIcon,
} from "../components/icons";

interface CategoryDetailPageProps {
  categories: LinePlanCategory[];
  targetOverallMargin: number;
  onUpdateStyle: (categoryId: string, updatedStyle: PlannedStyle) => void;
  onAddStyle: (categoryId: string, newStyle: PlannedStyle) => void;
  styleMetricView: StyleMetricViewOption;
  setStyleMetricView: (view: StyleMetricViewOption) => void;
}

const STYLE_METRIC_VIEW_OPTIONS: {
  value: StyleMetricViewOption;
  label: string;
}[] = [
  { value: "current", label: "Standard Text" },
  { value: "dataBar", label: "In-Cell Data Bar" },
  { value: "chip", label: "Colored Chip" },
];

const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  categories,
  targetOverallMargin,
  onUpdateStyle,
  onAddStyle,
  styleMetricView,
  setStyleMetricView,
}) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [category, setCategory] = useState<LinePlanCategory | undefined>(
    undefined
  );
  const [editingStyle, setEditingStyle] = useState<PlannedStyle | null>(null);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [styleForm, setStyleForm] = useState<Partial<PlannedStyle>>({});

  useEffect(() => {
    const currentCategory = categories.find((c) => c.id === categoryId);
    setCategory(currentCategory);
  }, [categoryId, categories]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("action") === "add" && category && !isStyleModalOpen) {
      openStyleModal();
    }
  }, [location.search, category, isStyleModalOpen]);

  const openStyleModal = (style?: PlannedStyle) => {
    if (style) {
      setEditingStyle(style);
      setStyleForm({ ...style });
    } else {
      setEditingStyle(null);
      setStyleForm({
        id: generateId(),
        name: "",
        status: PlannedStyleStatus.PLACEHOLDER,
        color: "",
        imageUrl: `https://picsum.photos/seed/${generateId().substring(
          0,
          6
        )}/300/400`,
        sellingPrice: 0,
        components: [],
        notes: "",
      });
    }
    setIsStyleModalOpen(true);
  };

  const closeStyleModal = () => {
    setIsStyleModalOpen(false);
    setEditingStyle(null);
    setStyleForm({});
    if (new URLSearchParams(location.search).get("action") === "add") {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleStyleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setStyleForm((prev) => ({
      ...prev,
      [name]: name === "sellingPrice" ? parseFloat(value) : value,
    }));
  };

  const handleSaveStyle = () => {
    if (!category || !styleForm.name || styleForm.sellingPrice === undefined) {
      alert("Style Name and Selling Price are required.");
      return;
    }
    let styleToSave: PlannedStyle = editingStyle
      ? ({ ...editingStyle, ...styleForm } as PlannedStyle)
      : {
          id: styleForm.id || generateId(),
          name: styleForm.name,
          status: styleForm.status || PlannedStyleStatus.PLACEHOLDER,
          color: styleForm.color || "N/A",
          imageUrl:
            styleForm.imageUrl ||
            `https://picsum.photos/seed/${generateId().substring(
              0,
              6
            )}/300/400`,
          sellingPrice: styleForm.sellingPrice || 0,
          components: styleForm.components || [],
          costPrice: 0,
          margin: 0,
          notes: styleForm.notes,
        };
    const updatedFinancialsStyle = updateStyleFinancials(
      styleToSave,
      allMasterComponents
    );
    if (editingStyle) onUpdateStyle(category.id, updatedFinancialsStyle);
    else onAddStyle(category.id, updatedFinancialsStyle);
    closeStyleModal();
  };

  const openComponentModal = (style: PlannedStyle) => {
    setEditingStyle(style);
    setStyleForm({ ...style });
    setIsComponentModalOpen(true);
  };
  const closeComponentModal = () => {
    setIsComponentModalOpen(false);
    setEditingStyle(null);
    setStyleForm({});
  };

  const handleComponentChange = (
    componentType: MasterComponent["type"],
    newComponentId: string
  ) => {
    if (!editingStyle || !styleForm.components) return;
    const masterCompDetails = allMasterComponents.find(
      (mc) => mc.id === newComponentId
    );
    const quantity = masterCompDetails?.type === "FABRIC" ? 1.5 : 1;
    const existingComponentIndex = styleForm.components.findIndex(
      (c) =>
        allMasterComponents.find((mc) => mc.id === c.componentId)?.type ===
        componentType
    );
    let updatedComponents: StyleComponentUsage[];
    if (existingComponentIndex > -1) {
      if (newComponentId === "")
        updatedComponents = styleForm.components.filter(
          (_, index) => index !== existingComponentIndex
        );
      else
        updatedComponents = styleForm.components.map((c, index) =>
          index === existingComponentIndex
            ? { componentId: newComponentId, quantity }
            : c
        );
    } else {
      if (newComponentId !== "")
        updatedComponents = [
          ...styleForm.components,
          { componentId: newComponentId, quantity },
        ];
      else updatedComponents = [...styleForm.components];
    }
    setStyleForm((prev) => ({ ...prev, components: updatedComponents }));
  };

  const handleSaveComponents = () => {
    if (!category || !editingStyle || !styleForm.components) return;
    const styleWithNewComponents: PlannedStyle = {
      ...editingStyle,
      components: styleForm.components,
    };
    const fullyUpdatedStyle = updateStyleFinancials(
      styleWithNewComponents,
      allMasterComponents
    );
    onUpdateStyle(category.id, fullyUpdatedStyle);
    closeComponentModal();
  };

  if (!category) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center h-full">
        <InformationCircleIcon className="w-12 h-12 text-sky-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">
          Loading category details...
        </h2>
        <p className="text-slate-500 mt-2">
          If this persists, the category may not exist in the current plan.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
        >
          Back to Overview
        </button>
      </div>
    );
  }

  const getMarginIndicator = (margin: number) => {
    const targetMargin = category.targetMargin || targetOverallMargin;
    if (margin < targetMargin * 0.85)
      return (
        <span title={`Low margin (${(targetMargin * 100).toFixed(1)}% target)`}>
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
        </span>
      );
    if (margin < targetMargin)
      return (
        <span
          title={`Margin below target (${(targetMargin * 100).toFixed(
            1
          )}% target)`}
        >
          <InformationCircleIcon className="w-5 h-5 text-amber-500" />
        </span>
      );
    return (
      <span title="Margin meets target">
        <CheckCircleIcon className="w-5 h-5 text-green-500" />
      </span>
    );
  };

  const renderStyleMarginCell = (style: PlannedStyle) => {
    const targetMargin = category.targetMargin || targetOverallMargin;

    if (style.margin < targetMargin * 0.85)
      return <span className="text-red-600 font-semibold">{"⚠️ Low"}</span>;
    else if (style.margin < targetMargin)
      return <span className="text-amber-600 font-semibold">{"⚠️ Below"}</span>;

    switch (styleMetricView) {
      case "dataBar":
        const barWidth = Math.min(
          Math.min(100, (style.margin / (targetMargin * 1.2)) * 100)
        );
        return (
          <div className="w-16 bg-slate-200 rounded-full h-3 relative">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: `${barWidth}%` }}
            />
            <span className="absolute inset-0 text-xs font-semibold text-slate-700 flex items-center justify-center">
              {(style.margin * 100).toFixed(1)}%
            </span>
          </div>
        );
      case "chip":
        let chipColor;
        if (style.margin < targetMargin * 0.85)
          chipColor = "bg-red-100 text-red-800 border-red-200";
        else if (style.margin < targetMargin)
          chipColor = "bg-amber-100 text-amber-800 border-amber-200";
        else chipColor = "bg-green-100 text-green-800 border-green-200";
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${chipColor}`}
          >
            {(style.margin * 100).toFixed(1)}%
          </span>
        );
      default:
        return (
          <span className="font-semibold text-slate-700">
            {(style.margin * 100).toFixed(1)}%
          </span>
        );
    }
  };

  const styleModalFooter = (
    <>
      <button
        type="button"
        onClick={closeStyleModal}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition-all duration-150 ease-in-out active:bg-slate-200"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSaveStyle}
        className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all duration-150 ease-in-out active:bg-sky-700"
      >
        Save Style
      </button>
    </>
  );

  const componentModalFooter = (
    <>
      <button
        type="button"
        onClick={closeComponentModal}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 shadow-sm transition-all duration-150 ease-in-out active:bg-slate-200"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSaveComponents}
        className="px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg shadow-sm transition-all duration-150 ease-in-out active:bg-sky-700"
      >
        Save Components
      </button>
    </>
  );

  return (
    <div className="p-5 md:p-6 space-y-6 bg-slate-50 flex-1 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/")}
            className="p-2 mr-3 text-slate-500 hover:bg-slate-200 rounded-full transition-colors active:bg-slate-300"
            title="Back to Overview"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h2 className="text-xl lg:text-2xl font-semibold text-slate-800">
            {category.name} - Styles{" "}
            <span className="text-slate-500 font-normal text-lg">
              ({category.plannedStyles.length})
            </span>
          </h2>
        </div>
        <div className="flex items-center space-x-2.5">
          <div className="w-48">
            <label htmlFor="styleMetricView" className="sr-only">
              Style Metric Display
            </label>
            <select
              id="styleMetricView"
              value={styleMetricView}
              onChange={(e) =>
                setStyleMetricView(e.target.value as StyleMetricViewOption)
              }
              className="block w-full p-2 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-xs bg-white"
            >
              {STYLE_METRIC_VIEW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => openStyleModal()}
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-3.5 rounded-lg shadow-md hover:shadow-lg flex items-center space-x-1.5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1 active:bg-sky-700"
            title="Add a new placeholder style to this category"
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>Add Placeholder</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow-xl overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="min-w-full divide-y divide-slate-200/80">
          <thead className="bg-slate-100/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Color
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Margin
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Indicator
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200/70">
            {category.plannedStyles.map((style) => (
              <tr
                key={style.id}
                className="hover:bg-slate-50/80 transition-colors duration-100 group"
              >
                <td className="px-4 py-2.5">
                  <img
                    src={style.imageUrl || "/images/placeholder.jpg"}
                    alt={style.name}
                    className="w-16 h-20 object-cover rounded-md shadow-sm border border-slate-200"
                  />
                </td>
                <td className="px-4 py-2.5 text-sm font-medium text-slate-800 whitespace-nowrap">
                  {style.name}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-600">
                  {style.status}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-600">
                  {style.color}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-600 text-right">
                  ${style.costPrice.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-600 text-right">
                  ${style.sellingPrice.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-sm text-right">
                  {renderStyleMarginCell(style)}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {getMarginIndicator(style.margin)}
                </td>
                <td className="px-4 py-2.5 text-sm space-x-1 whitespace-nowrap">
                  <button
                    onClick={() => openStyleModal(style)}
                    className="text-sky-600 hover:text-sky-700 p-1.5 rounded-md hover:bg-sky-100/70 transition-colors active:bg-sky-200/70"
                    title="Edit Style Details"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openComponentModal(style)}
                    className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-md hover:bg-indigo-100/70 transition-colors active:bg-indigo-200/70"
                    title="Change Components"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {category.plannedStyles.length === 0 && (
          <div className="text-center py-16 px-6">
            <CollectionIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-md font-semibold text-slate-700">
              No Styles Yet
            </h3>
            <p className="mt-1.5 text-sm text-slate-500">
              This category is empty. Get started by adding a placeholder style.
            </p>
            <button
              onClick={() => openStyleModal()}
              className="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm flex items-center mx-auto space-x-1.5 active:bg-sky-700"
              title="Add Placeholder Style"
            >
              <PlusCircleIcon className="w-4 h-4" />
              <span>Add Placeholder</span>
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isStyleModalOpen}
        onClose={closeStyleModal}
        title={editingStyle ? "Edit Style" : "Add Placeholder Style"}
        size="lg"
        footer={styleModalFooter}
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Style Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={styleForm.name || ""}
              onChange={handleStyleFormChange}
              className="mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2.5 bg-white"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              value={styleForm.status || PlannedStyleStatus.PLACEHOLDER}
              onChange={handleStyleFormChange}
              className="mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2.5 bg-white"
            >
              {Object.values(PlannedStyleStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {(editingStyle?.status !== PlannedStyleStatus.PLACEHOLDER &&
            styleForm.status !== PlannedStyleStatus.PLACEHOLDER) ||
          (editingStyle &&
            editingStyle.status !== PlannedStyleStatus.PLACEHOLDER) ? (
            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-slate-700"
              >
                Color
              </label>
              <input
                type="text"
                name="color"
                id="color"
                value={styleForm.color || ""}
                onChange={handleStyleFormChange}
                className="mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2.5 bg-white"
              />
            </div>
          ) : null}
          <div>
            <label
              htmlFor="sellingPrice"
              className="block text-sm font-medium text-slate-700"
            >
              Selling Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="sellingPrice"
              id="sellingPrice"
              value={styleForm.sellingPrice || ""}
              onChange={handleStyleFormChange}
              className="mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2.5 bg-white"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700"
            >
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              value={styleForm.notes || ""}
              onChange={handleStyleFormChange}
              rows={3}
              className="mt-1 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2.5 bg-white"
            />
          </div>
          {editingStyle && (
            <div className="text-sm p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-medium text-slate-700">Current Financials:</p>
              <p className="text-slate-600">
                Cost:{" "}
                <span className="font-semibold">
                  ${editingStyle.costPrice.toFixed(2)}
                </span>
              </p>
              <p className="text-slate-600">
                Margin:{" "}
                <span className="font-semibold">
                  {(editingStyle.margin * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isComponentModalOpen}
        onClose={closeComponentModal}
        title={`Change Components for: ${editingStyle?.name || ""}`}
        size="lg"
        footer={componentModalFooter}
      >
        {editingStyle && styleForm.components !== undefined && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Select new components to update the style's cost and margin.
            </p>
            <div className="p-3.5 bg-slate-100 rounded-lg border border-slate-200 mb-4">
              <p className="text-sm font-medium text-slate-700">
                Current Financials:
              </p>
              <p className="text-xs text-slate-600">
                Cost:{" "}
                <span className="font-semibold">
                  ${editingStyle.costPrice.toFixed(2)}
                </span>
              </p>
              <p className="text-xs text-slate-600">
                Margin:{" "}
                <span className="font-semibold">
                  {(editingStyle.margin * 100).toFixed(1)}%
                </span>
              </p>
            </div>

            {(["FABRIC", "ZIPPER", "BUTTON"] as MasterComponent["type"][]).map(
              (componentType) => {
                const currentCompUsage = styleForm.components?.find(
                  (c) =>
                    allMasterComponents.find((mc) => mc.id === c.componentId)
                      ?.type === componentType
                );
                const availableCompsOfType = allMasterComponents.filter(
                  (mc) => mc.type === componentType
                );

                return (
                  <div key={componentType}>
                    <label
                      htmlFor={`component-${componentType}`}
                      className="block text-sm font-medium text-slate-700 capitalize"
                    >
                      {componentType.toLowerCase()}
                    </label>
                    <select
                      name={`component-${componentType}`}
                      id={`component-${componentType}`}
                      value={currentCompUsage?.componentId || ""}
                      onChange={(e) =>
                        handleComponentChange(componentType, e.target.value)
                      }
                      className="mt-1 block w-full p-2.5 border-slate-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white"
                    >
                      <option value="">None / Keep Current or Remove</option>
                      {availableCompsOfType.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name} (${comp.cost.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
            )}

            {(() => {
              const tempStyle = updateStyleFinancials(
                { ...editingStyle, components: styleForm.components! },
                allMasterComponents
              );
              return (
                <div className="mt-4 p-3.5 bg-sky-50 rounded-lg border border-sky-200">
                  <p className="text-sm font-medium text-sky-700">
                    Preview with new components:
                  </p>
                  <p className="text-xs text-sky-600">
                    New Cost:{" "}
                    <span className="font-semibold">
                      ${tempStyle.costPrice.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-xs text-sky-600">
                    New Margin:{" "}
                    <span className="font-semibold">
                      {(tempStyle.margin * 100).toFixed(1)}%
                    </span>
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryDetailPage;
