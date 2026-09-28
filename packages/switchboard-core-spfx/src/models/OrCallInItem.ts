import { OrCallInContactItem } from "./OrCallInContactItem";

export interface OrCallInItem {
  id: string;
  title: string;
  callInId: string;
  date: string;
  timeContacted: string;
  aodName: string;
  procedure: string;
  surgeon: string;
  surgeryDateTime: string;
  surgeryStatus: string;
  covidStatus: string;
  cArmRequired: boolean;
  radiologyContactedTime?: string;
  aodCallbackTime?: string;
  operatorInitials?: string;
  callInScript?: string;
  status: string;
  dailyNoteId?: string;
  notes?: string;
  teamCallInNotes?: string;
  contacts: OrCallInContactItem[];
}
