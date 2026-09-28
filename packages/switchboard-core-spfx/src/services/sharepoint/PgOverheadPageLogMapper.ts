import { PgFields } from "../../constants/PgFields";
import { PgOverheadPageLogItem } from "../../models/PgOverheadPageLogItem";

export function mapPgOverheadPageLogToCreatePayload(item: PgOverheadPageLogItem): Record<string, unknown> {
  return {
    Title: item.title,
    [PgFields.PageDateTime]: item.pageDateTime,
    [PgFields.PageType]: item.pageType,
    [PgFields.MessageText]: item.messageText,
    [PgFields.Location]: item.location,
    [PgFields.AlertCategory]: item.alertCategory,
    [PgFields.DescriptionOfAlert]: item.descriptionOfAlert,
    [PgFields.CallerName]: item.callerName,
    [PgFields.UnitDepartment]: item.unitDepartment,
    [PgFields.PatientName]: item.patientName,
    [PgFields.PatientMrn]: item.patientMrn,
    [PgFields.PatientDob]: item.patientDob,
    [PgFields.PatientSsn]: item.patientSsn,
    [PgFields.AllClearDateTime]: item.allClearDateTime,
    [PgFields.AdditionalInfo]: item.additionalInfo,
    [PgFields.Switchboard]: item.switchboard,
    [PgFields.RiskmasterCode]: item.riskmasterCode,
    [PgFields.SourceModule]: item.sourceModule,
    [PgFields.SourceItemId]: item.sourceItemId,
    [PgFields.OperatorName]: item.operatorName,
    [PgFields.Status]: item.status,
    [PgFields.Notes]: item.notes
  };
}
