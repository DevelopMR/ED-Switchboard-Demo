export interface RmDemoEntryItem {
  id: string;
  title: string;
  submittedAt: string;
  operator: string;
  alertType: string;
  condition: string;
  location: string;
  facility?: string;
  department?: string;
  room?: string;
  dateOfCall: string;
  allClearDateTime?: string;
  alerted911?: boolean;
  cancelled911?: boolean;
  eventDescription: string;
  receiptCode: string;
  status: string;
  sourcePopupId?: string;
  sourceAlertId?: string;
  payloadJson?: string;
  notes?: string;
}
