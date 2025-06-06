export enum PLMStatusStage {
  DRAFT = "DRAFT",
  BRIEFING = "BRIEFING",
  PLANNING = "PLANNING",
  READY_FOR_REVIEW = "READY_FOR_REVIEW",
  DESIGNING = "DESIGNING",
  FINALIZING = "FINALIZING",
  HANDOFF = "HANDOFF",
  LAUNCHED = "LAUNCHED",
}

export enum UserRole {
  MERCHANT = "MERCHANT",
  DESIGNER = "DESIGNER",
  PD = "PD",
  SYSTEM = "SYSTEM",
}

export interface LinePlan {
  id: string;
  name: string;
  plmStatus: PLMStatusStage;
}
