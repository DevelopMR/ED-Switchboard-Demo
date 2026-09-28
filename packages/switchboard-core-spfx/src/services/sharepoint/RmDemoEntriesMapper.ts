import { RmFields } from "../../constants/RmFields";
import { RmDemoEntryItem } from "../../models/RmDemoEntryItem";

export function mapRmDemoEntryToCreatePayload(item: RmDemoEntryItem): Record<string, unknown> {
  return {
    Title: item.title,
    [RmFields.SubmittedAt]: item.submittedAt,
    [RmFields.Operator]: item.operator,
    [RmFields.AlertType]: item.alertType,
    [RmFields.Condition]: item.condition,
    [RmFields.Location]: item.location,
    [RmFields.Facility]: item.facility,
    [RmFields.Department]: item.department,
    [RmFields.Room]: item.room,
    [RmFields.DateOfCall]: item.dateOfCall,
    [RmFields.AllClearDateTime]: item.allClearDateTime,
    [RmFields.Alerted911]: item.alerted911,
    [RmFields.Cancelled911]: item.cancelled911,
    [RmFields.EventDescription]: item.eventDescription,
    [RmFields.ReceiptCode]: item.receiptCode,
    [RmFields.Status]: item.status,
    [RmFields.SourcePopupId]: item.sourcePopupId,
    [RmFields.SourceAlertId]: item.sourceAlertId,
    [RmFields.PayloadJson]: item.payloadJson,
    [RmFields.Notes]: item.notes
  };
}
