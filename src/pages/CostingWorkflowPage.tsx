import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LinePlan,
  PlannedStyle,
  RFQ,
  Quote,
  CostingAnalysis,
  CostAdjustment,
  Vendor,
  RFQStatus,
} from "@/types";
import {
  createRFQFromStyles,
  sendRFQToVendors,
  createQuoteResponse,
  analyzeQuotes,
  getStylesReadyForCosting,
  calculateCostImpactOnLinePlan,
  mockVendors,
} from "@/services/costingService";

interface CostingWorkflowPageProps {
  linePlans: LinePlan[];
  currentLinePlan: LinePlan | null;
  setLinePlans: React.Dispatch<React.SetStateAction<LinePlan[]>>;
  onUpdateStyle: (categoryId: string, updatedStyle: PlannedStyle) => void;
}

const CostingWorkflowPage: React.FC<CostingWorkflowPageProps> = ({
  currentLinePlan,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "rfq" | "quotes" | "analysis" | "adjustments"
  >("overview");

  // State for RFQs and quotes
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [costingAnalyses, setCostingAnalyses] = useState<CostingAnalysis[]>([]);
  const [costAdjustments] = useState<CostAdjustment[]>([]);
  const [vendors] = useState<Vendor[]>(mockVendors);

  // RFQ Creation State
  const [selectedStyles, setSelectedStyles] = useState<PlannedStyle[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [rfqTitle, setRfqTitle] = useState("");
  const [rfqDescription, setRfqDescription] = useState("");
  const [rfqDueDate, setRfqDueDate] = useState("");
  const [showRfqModal, setShowRfqModal] = useState(false);

  // Quote simulation state
  const [showQuoteSimulation, setShowQuoteSimulation] = useState(false);
  const [selectedRfqForQuote, setSelectedRfqForQuote] = useState<RFQ | null>(
    null
  );

  // Get styles ready for costing
  const stylesReadyForCosting = useMemo(() => {
    return currentLinePlan ? getStylesReadyForCosting(currentLinePlan) : [];
  }, [currentLinePlan]);

  // Calculate overall impact
  const overallImpact = useMemo(() => {
    if (!currentLinePlan) return null;
    return calculateCostImpactOnLinePlan(currentLinePlan, costAdjustments);
  }, [currentLinePlan, costAdjustments]);

  // Handle RFQ creation
  const handleCreateRFQ = () => {
    if (
      !currentLinePlan ||
      selectedStyles.length === 0 ||
      selectedVendors.length === 0
    ) {
      alert("Please select styles and vendors");
      return;
    }

    const newRFQ = createRFQFromStyles(
      currentLinePlan,
      selectedStyles,
      selectedVendors,
      rfqDueDate,
      rfqTitle,
      rfqDescription
    );

    setRfqs([...rfqs, newRFQ]);
    setShowRfqModal(false);
    setSelectedStyles([]);
    setSelectedVendors([]);
    setRfqTitle("");
    setRfqDescription("");
    setRfqDueDate("");
  };

  // Handle sending RFQ
  const handleSendRFQ = async (rfq: RFQ) => {
    const sentRFQ = await sendRFQToVendors(rfq);
    setRfqs(rfqs.map((r) => (r.id === rfq.id ? sentRFQ : r)));
  };

  // Simulate quote response
  const handleSimulateQuote = (rfq: RFQ, vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    const quoteItems = rfq.items.map((item) => ({
      rfqItemId: item.id,
      unitCost: item.targetCost * (0.85 + Math.random() * 0.3), // Random cost between 85% and 115% of target
      minimumOrderQuantity: vendor.minimumOrderQuantity,
      leadTime: vendor.leadTime + Math.floor(Math.random() * 10), // Add some variation
      notes: `Quote for ${item.styleName}`,
    }));

    const newQuote = createQuoteResponse(
      rfq,
      vendorId,
      vendor.name,
      quoteItems
    );
    setQuotes([...quotes, newQuote]);

    // Update RFQ status if all vendors have responded
    const vendorQuotes = quotes.filter((q) => q.rfqId === rfq.id);
    if (vendorQuotes.length + 1 >= rfq.vendorIds.length) {
      setRfqs(
        rfqs.map((r) =>
          r.id === rfq.id ? { ...r, status: RFQStatus.RESPONDED } : r
        )
      );
    }
  };

  // Handle cost analysis
  const handleAnalyzeQuotes = (rfq: RFQ) => {
    if (!currentLinePlan) return;

    const rfqQuotes = quotes.filter((q) => q.rfqId === rfq.id);
    const analyses = analyzeQuotes(rfq, rfqQuotes, currentLinePlan);
    setCostingAnalyses([...costingAnalyses, ...analyses]);
  };

  // Handle cost adjustment (placeholder for future implementation)
  // const handleCostAdjustment = (analysis: CostingAnalysis, newCost: number, reason: string) => {
  //   // Implementation would go here
  // };

  if (!currentLinePlan) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Line Plan Selected
          </h2>
          <p className="text-gray-600">
            Please select a line plan to access the costing workflow.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Costing Workflow
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {currentLinePlan.name} - {currentLinePlan.season}
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Overview
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                id: "overview",
                name: "Overview",
                count: stylesReadyForCosting.length,
              },
              { id: "rfq", name: "RFQs", count: rfqs.length },
              { id: "quotes", name: "Quotes", count: quotes.length },
              {
                id: "analysis",
                name: "Analysis",
                count: costingAnalyses.length,
              },
              {
                id: "adjustments",
                name: "Adjustments",
                count: costAdjustments.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Styles Ready for Costing
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stylesReadyForCosting.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">$</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Potential Cost Savings
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          $
                          {overallImpact?.totalCostSavings.toLocaleString() ||
                            0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">%</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Margin Improvement
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {overallImpact?.marginImprovement.toFixed(1) || 0}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowRfqModal(true)}
                    disabled={stylesReadyForCosting.length === 0}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Create New RFQ
                  </button>
                  <button
                    onClick={() => setActiveTab("analysis")}
                    disabled={costingAnalyses.length === 0}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Review Cost Analysis
                  </button>
                </div>
              </div>
            </div>

            {/* Styles Ready for Costing */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Styles Ready for Costing
                </h3>
                {stylesReadyForCosting.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No styles are ready for costing. Styles need to be in
                    "Designing" or "Finalizing" status.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stylesReadyForCosting.map((style) => (
                      <div
                        key={style.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3">
                          {style.imageUrl && (
                            <img
                              src={style.imageUrl}
                              alt={style.name}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {style.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {style.color}
                            </p>
                            <p className="text-sm text-gray-700">
                              Cost: ${style.costPrice.toFixed(2)} | Margin:{" "}
                              {(style.margin * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RFQ Tab */}
        {activeTab === "rfq" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Request for Quotes
              </h2>
              <button
                onClick={() => setShowRfqModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create New RFQ
              </button>
            </div>

            {rfqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No RFQs created yet</p>
                <button
                  onClick={() => setShowRfqModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Your First RFQ
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {rfqs.map((rfq) => (
                  <div key={rfq.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {rfq.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          RFQ #{rfq.rfqNumber}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {rfq.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rfq.status === RFQStatus.DRAFT
                              ? "bg-gray-100 text-gray-800"
                              : rfq.status === RFQStatus.SENT
                              ? "bg-blue-100 text-blue-800"
                              : rfq.status === RFQStatus.RESPONDED
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {rfq.status.charAt(0).toUpperCase() +
                            rfq.status.slice(1).replace("_", " ")}
                        </span>
                        {rfq.status === RFQStatus.DRAFT && (
                          <button
                            onClick={() => handleSendRFQ(rfq)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Send RFQ
                          </button>
                        )}
                        {rfq.status === RFQStatus.SENT && (
                          <button
                            onClick={() => {
                              setSelectedRfqForQuote(rfq);
                              setShowQuoteSimulation(true);
                            }}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Simulate Quote
                          </button>
                        )}
                        {rfq.status === RFQStatus.RESPONDED && (
                          <button
                            onClick={() => handleAnalyzeQuotes(rfq)}
                            className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Analyze Quotes
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Items:</span>{" "}
                        {rfq.items.length}
                      </div>
                      <div>
                        <span className="font-medium">Vendors:</span>{" "}
                        {rfq.vendorIds.length}
                      </div>
                      <div>
                        <span className="font-medium">Target Value:</span> $
                        {rfq.totalTargetValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other tabs would continue here... */}
      </div>

      {/* RFQ Creation Modal */}
      {showRfqModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New RFQ
              </h3>

              {/* RFQ Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={rfqTitle}
                    onChange={(e) => setRfqTitle(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter RFQ title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={rfqDescription}
                    onChange={(e) => setRfqDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter RFQ description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={rfqDueDate}
                    onChange={(e) => setRfqDueDate(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Style Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Styles
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {stylesReadyForCosting.map((style) => (
                      <label
                        key={style.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStyles.some(
                            (s) => s.id === style.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStyles([...selectedStyles, style]);
                            } else {
                              setSelectedStyles(
                                selectedStyles.filter((s) => s.id !== style.id)
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {style.name} - {style.color}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Vendor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vendors
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {vendors
                      .filter((v) => v.isActive)
                      .map((vendor) => (
                        <label
                          key={vendor.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(vendor.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVendors([
                                  ...selectedVendors,
                                  vendor.id,
                                ]);
                              } else {
                                setSelectedVendors(
                                  selectedVendors.filter(
                                    (id) => id !== vendor.id
                                  )
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            {vendor.name} - {vendor.location}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRfqModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRFQ}
                  disabled={
                    selectedStyles.length === 0 || selectedVendors.length === 0
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create RFQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Simulation Modal */}
      {showQuoteSimulation && selectedRfqForQuote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Simulate Quote Response
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select a vendor to simulate their quote response for RFQ #
                {selectedRfqForQuote.rfqNumber}
              </p>

              <div className="space-y-3">
                {vendors
                  .filter((v) => selectedRfqForQuote.vendorIds.includes(v.id))
                  .filter(
                    (v) =>
                      !quotes.some(
                        (q) =>
                          q.rfqId === selectedRfqForQuote.id &&
                          q.vendorId === v.id
                      )
                  )
                  .map((vendor) => (
                    <div
                      key={vendor.id}
                      className="flex justify-between items-center p-3 border border-gray-200 rounded-md"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {vendor.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {vendor.location}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleSimulateQuote(selectedRfqForQuote, vendor.id);
                          setShowQuoteSimulation(false);
                          setSelectedRfqForQuote(null);
                        }}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Simulate Quote
                      </button>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowQuoteSimulation(false);
                    setSelectedRfqForQuote(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostingWorkflowPage;
