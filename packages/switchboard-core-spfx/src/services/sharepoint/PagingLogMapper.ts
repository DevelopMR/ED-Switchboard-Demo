import { PagingLogFields } from "../../constants/PagingLogFields";
import { PagingLogItem } from "../../models/PagingLogItem";

export function mapPagingLogItemToCreatePayload(item: PagingLogItem): Record<string, unknown> {
  return {
    Title: item.title,
    [PagingLogFields.LogId]: item.logId,
    [PagingLogFields.DateTime]: item.dateTime,
    [PagingLogFields.WhoCalled]: item.whoCalled,
    [PagingLogFields.FromWhere]: item.fromWhere,
    [PagingLogFields.CallbackNumber]: item.callbackNumber,
    [PagingLogFields.WhoNeededPaged]: item.whoNeededPaged,
    [PagingLogFields.Department]: item.department,
    [PagingLogFields.PersonOnCallPhoneNumber]: item.personOnCallPhoneNumber,
    [PagingLogFields.Success]: item.success,
    [PagingLogFields.Notes]: item.notes,
    [PagingLogFields.DailyNoteId]: item.dailyNoteId
  };
}
