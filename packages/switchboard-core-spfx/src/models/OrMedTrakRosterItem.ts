import { OrCallInRole } from "./OrCallInContactItem";

export interface OrMedTrakRosterItem {
  id: string;
  role: OrCallInRole;
  staffName: string;
  phoneOne?: string;
  phoneTwo?: string;
  onCallStart: string;
  onCallEnd: string;
  isActive: boolean;
  defaultNotes?: string;
  sortOrder: number;
  requiredByDefault: boolean;
}
