import { OrCallInFields } from "../../constants/OrCallInFields";
import { OrCallInContactItem } from "../../models/OrCallInContactItem";
import { OrCallInItem } from "../../models/OrCallInItem";
import { OrMedTrakRosterItem } from "../../models/OrMedTrakRosterItem";
import { SharePointListItemRecord } from "./ISharePointListClient";

export function mapOrCallInItemToCreatePayload(item: OrCallInItem): Record<string, unknown> {
  return {
    Title: item.title,
    [OrCallInFields.Parent.CallInId]: item.callInId,
    [OrCallInFields.Parent.Date]: item.date,
    [OrCallInFields.Parent.TimeContacted]: item.timeContacted,
    [OrCallInFields.Parent.AodName]: item.aodName,
    [OrCallInFields.Parent.Procedure]: item.procedure,
    [OrCallInFields.Parent.Surgeon]: item.surgeon,
    [OrCallInFields.Parent.SurgeryDateTime]: item.surgeryDateTime,
    [OrCallInFields.Parent.SurgeryStatus]: item.surgeryStatus,
    [OrCallInFields.Parent.CovidStatus]: item.covidStatus,
    [OrCallInFields.Parent.CArmRequired]: item.cArmRequired,
    [OrCallInFields.Parent.RadiologyContactedTime]: item.radiologyContactedTime,
    [OrCallInFields.Parent.AodCallbackTime]: item.aodCallbackTime,
    [OrCallInFields.Parent.OperatorInitials]: item.operatorInitials,
    [OrCallInFields.Parent.CallInScript]: item.callInScript,
    [OrCallInFields.Parent.Status]: item.status,
    [OrCallInFields.Parent.DailyNoteId]: item.dailyNoteId,
    [OrCallInFields.Parent.Notes]: item.notes,
    [OrCallInFields.Parent.TeamCallInNotes]: item.teamCallInNotes
  };
}

export function mapOrCallInContactItemToCreatePayload(callInId: string, item: OrCallInContactItem): Record<string, unknown> {
  return {
    Title: item.staffName ? `${item.role} - ${item.staffName}` : item.role,
    [OrCallInFields.Contact.CallInId]: callInId,
    [OrCallInFields.Contact.Role]: item.role,
    [OrCallInFields.Contact.StaffName]: item.staffName,
    [OrCallInFields.Contact.PhoneOne]: item.phoneOne,
    [OrCallInFields.Contact.PhoneTwo]: item.phoneTwo,
    [OrCallInFields.Contact.TimeContacted]: item.timeContacted,
    [OrCallInFields.Contact.ContactNotes]: item.contactNotes,
    [OrCallInFields.Contact.SortOrder]: item.sortOrder
  };
}

export function mapOrMedTrakRosterItemFromListRecord(record: SharePointListItemRecord): OrMedTrakRosterItem {
  return {
    id: String(record.Id ?? ""),
    role: String(record[OrCallInFields.Roster.Role] ?? "OrNurse") as OrMedTrakRosterItem["role"],
    staffName: String(record[OrCallInFields.Roster.StaffName] ?? ""),
    phoneOne: getOptionalString(record, OrCallInFields.Roster.PhoneOne),
    phoneTwo: getOptionalString(record, OrCallInFields.Roster.PhoneTwo),
    onCallStart: String(record[OrCallInFields.Roster.OnCallStart] ?? ""),
    onCallEnd: String(record[OrCallInFields.Roster.OnCallEnd] ?? ""),
    isActive: getBooleanValue(record[OrCallInFields.Roster.IsActive]),
    defaultNotes: getOptionalString(record, OrCallInFields.Roster.DefaultNotes),
    sortOrder: Number(record[OrCallInFields.Roster.SortOrder] ?? 0),
    requiredByDefault: getBooleanValue(record[OrCallInFields.Roster.RequiredByDefault], true)
  };
}

function getOptionalString(record: SharePointListItemRecord, fieldName: string): string | undefined {
  const value = String(record[fieldName] ?? "").trim();
  return value.length > 0 ? value : undefined;
}

function getBooleanValue(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return defaultValue;
  }

  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return defaultValue;
}
