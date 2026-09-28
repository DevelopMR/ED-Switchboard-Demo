export type OrCallInRole =
  | "Obstetrician"
  | "PediatricHospitalist"
  | "Anesthesiologist"
  | "AnesthesiaNurse"
  | "OrNurse"
  | "ScrubOrTech"
  | "SurgicalTechFirstAssist"
  | "RecoveryNurse"
  | "Radiology";

export interface OrCallInContactItem {
  id: string;
  callInId: string;
  role: OrCallInRole;
  staffName: string;
  phoneOne?: string;
  phoneTwo?: string;
  timeContacted?: string;
  contactNotes?: string;
  sortOrder: number;
  required: boolean;
  completed: boolean;
  aodCalledAnesth: boolean;
  aodCalledAnesthAt?: string;
}