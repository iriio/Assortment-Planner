export enum PLMStatusStage {
  DRAFT = "draft",
  BRIEFING = "briefing",
  PLANNING = "planning",
  READY_FOR_REVIEW = "ready_for_review",
  DESIGNING = "designing",
  FINALIZING = "finalizing",
  HANDOFF = "handoff",
  LAUNCHED = "launched",
}

export enum UserRole {
  MERCHANT = "merchant",
  DESIGNER = "designer",
  PD = "pd",
  SYSTEM = "system",
}

export interface LinePlan {
  id: string;
  name: string;
  plmStatus: PLMStatusStage;
}
