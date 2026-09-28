import { DuiFields } from "../../constants/DuiFields";
import { DuiIntakeItem } from "../../models/DuiIntakeItem";

export function mapDuiIntakeItemToCreatePayload(item: DuiIntakeItem): Record<string, unknown> {
  return {
    Title: item.title,
    [DuiFields.IntakeId]: item.intakeId,
    [DuiFields.Date]: item.intakeDate,
    [DuiFields.Dob]: item.dob,
    [DuiFields.Ssn]: item.ssn,
    [DuiFields.NameLastFirst]: item.nameLastFirst,
    [DuiFields.PoliceDepartment]: item.policeDepartment,
    [DuiFields.PoliceOfficer]: item.policeOfficer,
    [DuiFields.PoliceIncidentNumber]: item.policeIncidentNumber,
    [DuiFields.RegistrationNumber]: item.registrationNumber,
    [DuiFields.SecurityNotified]: item.securityNotified,
    [DuiFields.SecurityNotifiedAt]: item.securityNotifiedAt,
    [DuiFields.LabNotified]: item.labNotified,
    [DuiFields.LabNotifiedAt]: item.labNotifiedAt,
    [DuiFields.Registered]: item.registered,
    [DuiFields.RegisteredAt]: item.registeredAt,
    [DuiFields.Notes]: item.notes,
    [DuiFields.DailyNoteId]: item.dailyNoteId
  };
}
