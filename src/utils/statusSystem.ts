import {
  PLMStatusStage,
  UserRole,
  StatusStageDefinition,
  LinePlan,
  LinePlanCategory,
} from "../types";

interface StatusDefinition {
  label: string;
  description: string;
  colorClass: string;
  bgColorClass: string;
}

const statusDefinitions: Record<PLMStatusStage, StatusDefinition> = {
  [PLMStatusStage.DRAFT]: {
    label: "Draft",
    description: "Initial draft stage",
    colorClass: "text-gray-700",
    bgColorClass: "bg-gray-100",
  },
  [PLMStatusStage.BRIEFING]: {
    label: "Briefing",
    description: "In briefing stage",
    colorClass: "text-blue-700",
    bgColorClass: "bg-blue-100",
  },
  [PLMStatusStage.PLANNING]: {
    label: "Planning",
    description: "In planning stage",
    colorClass: "text-purple-700",
    bgColorClass: "bg-purple-100",
  },
  [PLMStatusStage.READY_FOR_REVIEW]: {
    label: "Ready for Review",
    description: "Ready for review",
    colorClass: "text-yellow-700",
    bgColorClass: "bg-yellow-100",
  },
  [PLMStatusStage.DESIGNING]: {
    label: "Designing",
    description: "In design stage",
    colorClass: "text-indigo-700",
    bgColorClass: "bg-indigo-100",
  },
  [PLMStatusStage.FINALIZING]: {
    label: "Finalizing",
    description: "Finalizing details",
    colorClass: "text-orange-700",
    bgColorClass: "bg-orange-100",
  },
  [PLMStatusStage.HANDOFF]: {
    label: "Handoff",
    description: "Ready for handoff",
    colorClass: "text-green-700",
    bgColorClass: "bg-green-100",
  },
  [PLMStatusStage.LAUNCHED]: {
    label: "Launched",
    description: "Successfully launched",
    colorClass: "text-emerald-700",
    bgColorClass: "bg-emerald-100",
  },
};

// Status ordering for roll-up logic
const STATUS_ORDER: PLMStatusStage[] = [
  PLMStatusStage.DRAFT,
  PLMStatusStage.BRIEFING,
  PLMStatusStage.PLANNING,
  PLMStatusStage.READY_FOR_REVIEW,
  PLMStatusStage.DESIGNING,
  PLMStatusStage.FINALIZING,
  PLMStatusStage.HANDOFF,
  PLMStatusStage.LAUNCHED,
];

// Get numeric value for status ordering
export const getStatusOrder = (status: PLMStatusStage): number => {
  return STATUS_ORDER.indexOf(status);
};

// Roll-up Logic: Calculate parent status from children
export const calculateCategoryStatus = (
  category: LinePlanCategory
): PLMStatusStage => {
  if (category.plannedStyles.length === 0) {
    return PLMStatusStage.BRIEFING;
  }

  const childStatuses = category.plannedStyles.map((style) => style.plmStatus);
  return calculateRollUpStatus(childStatuses);
};

export const calculateProgramStatus = (linePlan: LinePlan): PLMStatusStage => {
  if (linePlan.categories.length === 0) {
    return PLMStatusStage.BRIEFING;
  }

  const categoryStatuses = linePlan.categories.map(
    (category) => category.plmStatus || calculateCategoryStatus(category)
  );
  return calculateRollUpStatus(categoryStatuses);
};

// Core roll-up logic
const calculateRollUpStatus = (statuses: PLMStatusStage[]): PLMStatusStage => {
  if (statuses.length === 0) return PLMStatusStage.BRIEFING;

  // If any child is briefing → parent = briefing
  if (statuses.some((status) => status === PLMStatusStage.BRIEFING)) {
    return PLMStatusStage.BRIEFING;
  }

  // Find the minimum status (earliest in the workflow)
  const minStatusIndex = Math.min(...statuses.map(getStatusOrder));
  const minStatus = STATUS_ORDER[minStatusIndex];

  // Special logic: if all children are at the same advanced stage, parent inherits it
  const uniqueStatuses = [...new Set(statuses)];
  if (uniqueStatuses.length === 1) {
    return uniqueStatuses[0];
  }

  // Return the minimum status as the bottleneck
  return minStatus;
};

// Permission System
export const canUserTransitionStatus = (
  currentStatus: PLMStatusStage,
  targetStatus: PLMStatusStage,
  userRole: UserRole
): boolean => {
  const availableTransitions = getAvailableStatusTransitions(
    currentStatus,
    userRole
  );
  return availableTransitions.includes(targetStatus);
};

// Get available next statuses for a user
export const getAvailableStatusTransitions = (
  currentStatus: PLMStatusStage,
  userRole: UserRole
): PLMStatusStage[] => {
  // Define allowed transitions based on current status and user role
  const transitions: Record<PLMStatusStage, PLMStatusStage[]> = {
    [PLMStatusStage.DRAFT]: [PLMStatusStage.BRIEFING],
    [PLMStatusStage.BRIEFING]: [PLMStatusStage.PLANNING],
    [PLMStatusStage.PLANNING]: [PLMStatusStage.READY_FOR_REVIEW],
    [PLMStatusStage.READY_FOR_REVIEW]: [PLMStatusStage.DESIGNING],
    [PLMStatusStage.DESIGNING]: [PLMStatusStage.FINALIZING],
    [PLMStatusStage.FINALIZING]: [PLMStatusStage.HANDOFF],
    [PLMStatusStage.HANDOFF]: [PLMStatusStage.LAUNCHED],
    [PLMStatusStage.LAUNCHED]: [],
  };

  return transitions[currentStatus] || [];
};

// Check if item is locked for editing
export const isStatusLocked = (status: PLMStatusStage): boolean => {
  return (
    status === PLMStatusStage.HANDOFF || status === PLMStatusStage.LAUNCHED
  );
};

// Get status definition
export const getStatusDefinition = (
  status: PLMStatusStage
): StatusDefinition => {
  return statusDefinitions[status];
};
