export interface PgOverheadPageLogItem {
  id: string;
  title: string;
  pageDateTime: string;
  pageType: string;
  messageText: string;
  location?: string;
  alertCategory?: string;
  descriptionOfAlert?: string;
  callerName?: string;
  unitDepartment?: string;
  patientName?: string;
  patientMrn?: string;
  patientDob?: string;
  patientSsn?: string;
  allClearDateTime?: string;
  additionalInfo?: string;
  switchboard?: string;
  riskmasterCode?: string;
  sourceModule?: string;
  sourceItemId?: string;
  operatorName?: string;
  status: string;
  notes?: string;
}
