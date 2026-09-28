import { OrCallInRole } from "../../models/OrCallInContactItem";
import { OrCallInItem } from "../../models/OrCallInItem";
import { OrMedTrakRosterItem } from "../../models/OrMedTrakRosterItem";
import { IOrCallInService } from "../contracts/IOrCallInService";

const roleSortOrder: Record<OrCallInRole, number> = {
  Obstetrician: 1,
  PediatricHospitalist: 2,
  Anesthesiologist: 3,
  AnesthesiaNurse: 4,
  OrNurse: 5,
  ScrubOrTech: 6,
  SurgicalTechFirstAssist: 7,
  RecoveryNurse: 8,
  Radiology: 9
};

const seedRoster: OrMedTrakRosterItem[] = [
  createRosterItem("Obstetrician", "Dr. Olive Demo", "841-555-0144", "841-555-0145"),
  createRosterItem("PediatricHospitalist", "Dr. Peter Peds", "841-555-0146", "841-555-0147"),
  createRosterItem("Anesthesiologist", "Dr. Anita Demo", "841-555-0130", "841-555-0131", true, "AOD usually contacts this role."),
  createRosterItem("AnesthesiaNurse", "Nina Gasper", "841-555-0132", "841-555-0133"),
  createRosterItem("OrNurse", "Olivia Circulate", "841-555-0134", "841-555-0135"),
  createRosterItem("ScrubOrTech", "Sam Scrub", "841-555-0136", "841-555-0137"),
  createRosterItem("SurgicalTechFirstAssist", "Terry First Assist", "841-555-0138", "841-555-0139", false),
  createRosterItem("RecoveryNurse", "Riley Recovery", "841-555-0140", "841-555-0141"),
  createRosterItem("Radiology", "Ray C Arm", "841-555-0142", "841-555-0143")
];

export class MockOrCallInService implements IOrCallInService {
  private items: OrCallInItem[] = [];

  public async createCallIn(item: OrCallInItem): Promise<OrCallInItem> {
    const nextItem = {
      ...item,
      id: item.id || `MOCK-OR-${this.items.length + 1}`,
      contacts: item.contacts.map((contact, index) => ({
        ...contact,
        id: contact.id || `MOCK-OR-CONTACT-${index + 1}`
      }))
    };

    this.items = [nextItem, ...this.items];
    return nextItem;
  }

  public async getRosterEntries(_surgeryDateTimeIso: string): Promise<OrMedTrakRosterItem[]> {
    return seedRoster.map((item) => ({ ...item }));
  }
}

function createRosterItem(
  role: OrCallInRole,
  staffName: string,
  phoneOne: string,
  phoneTwo: string,
  requiredByDefault = true,
  defaultNotes?: string
): OrMedTrakRosterItem {
  return {
    id: `MOCK-ROSTER-${role}`,
    role,
    staffName,
    phoneOne,
    phoneTwo,
    onCallStart: "2026-01-01T00:00:00.000Z",
    onCallEnd: "2027-12-31T23:59:59.000Z",
    isActive: true,
    defaultNotes,
    sortOrder: roleSortOrder[role],
    requiredByDefault
  };
}
