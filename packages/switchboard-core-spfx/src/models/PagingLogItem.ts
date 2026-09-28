export interface PagingLogItem {
  id: string;
  title: string;
  logId: string;
  dateTime: string;
  whoCalled: string;
  fromWhere: string;
  callbackNumber: string;
  whoNeededPaged: string;
  department: string;
  personOnCallPhoneNumber: string;
  success: boolean;
  successAt?: string;
  notes?: string;
  dailyNoteId?: string;
}
