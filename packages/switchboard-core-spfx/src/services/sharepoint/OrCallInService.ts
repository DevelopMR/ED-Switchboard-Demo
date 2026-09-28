import { ListNames } from "../../constants/ListNames";
import { OrCallInItem } from "../../models/OrCallInItem";
import { OrMedTrakRosterItem } from "../../models/OrMedTrakRosterItem";
import { IOrCallInService } from "../contracts/IOrCallInService";
import { ISharePointListClient } from "./ISharePointListClient";
import {
  mapOrCallInContactItemToCreatePayload,
  mapOrCallInItemToCreatePayload,
  mapOrMedTrakRosterItemFromListRecord
} from "./OrCallInMapper";

export class OrCallInService implements IOrCallInService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async createCallIn(item: OrCallInItem): Promise<OrCallInItem> {
    const created = await this.listClient.createItem(ListNames.OrCallIns, mapOrCallInItemToCreatePayload(item));

    for (const contact of item.contacts) {
      await this.listClient.createItem(ListNames.OrCallInContacts, mapOrCallInContactItemToCreatePayload(item.callInId, contact));
    }

    return {
      ...item,
      id: String(created.Id ?? item.id)
    };
  }

  public async getRosterEntries(surgeryDateTimeIso: string): Promise<OrMedTrakRosterItem[]> {
    const surgeryDateTime = new Date(surgeryDateTimeIso).getTime();
    const rosterFilter = buildRosterFilter(surgeryDateTime);
    const records = await this.listClient.getItems(ListNames.OrMedTrakRoster, {
      select: [
        "Id",
        "OrRole",
        "OrStaffName",
        "OrPhoneOne",
        "OrPhoneTwo",
        "OrOnCallStart",
        "OrOnCallEnd",
        "OrIsActive",
        "OrDefaultNotes",
        "OrSortOrder",
        "OrRequiredByDefault"
      ],
      filter: rosterFilter,
      orderBy: "OrSortOrder asc",
      top: 200
    });

    return records
      .map(mapOrMedTrakRosterItemFromListRecord)
      .filter((item) => item.isActive && isRosterMatch(item, surgeryDateTime))
      .sort((left, right) => left.sortOrder - right.sortOrder || left.staffName.localeCompare(right.staffName));
  }
}

function buildRosterFilter(surgeryDateTime: number): string {
  if (Number.isNaN(surgeryDateTime)) {
    return "OrIsActive eq 1";
  }

  const surgeryDateTimeLiteral = new Date(surgeryDateTime).toISOString();
  return [
    "OrIsActive eq 1",
    `OrOnCallStart le datetime'${surgeryDateTimeLiteral}'`,
    `OrOnCallEnd ge datetime'${surgeryDateTimeLiteral}'`
  ].join(" and ");
}

function isRosterMatch(item: OrMedTrakRosterItem, surgeryDateTime: number): boolean {
  if (Number.isNaN(surgeryDateTime)) {
    return true;
  }

  const onCallStart = new Date(item.onCallStart).getTime();
  const onCallEnd = new Date(item.onCallEnd).getTime();

  if (Number.isNaN(onCallStart) || Number.isNaN(onCallEnd)) {
    return true;
  }

  return onCallStart <= surgeryDateTime && surgeryDateTime <= onCallEnd;
}
