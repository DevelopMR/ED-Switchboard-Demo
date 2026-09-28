import { OrCallInService } from "./OrCallInService";
import {
  ISharePointListClient,
  ListItemQueryOptions,
  SharePointListItemRecord
} from "./ISharePointListClient";

class CapturingListClient implements ISharePointListClient {
  public requestedListTitle: string | undefined;
  public requestedOptions: ListItemQueryOptions | undefined;

  public constructor(private readonly records: SharePointListItemRecord[]) {}

  public async getItems(
    listTitle: string,
    options?: ListItemQueryOptions
  ): Promise<SharePointListItemRecord[]> {
    this.requestedListTitle = listTitle;
    this.requestedOptions = options;
    return this.records;
  }

  public async createItem(): Promise<SharePointListItemRecord> {
    throw new Error("Not used by this test.");
  }

  public async updateItem(): Promise<SharePointListItemRecord> {
    throw new Error("Not used by this test.");
  }
}

describe("OrCallInService", () => {
  it("filters the SharePoint query by the selected surgery time before applying the row limit", async () => {
    const surgeryDateTimeIso = "2026-08-14T19:37:00.000Z";
    const client = new CapturingListClient([
      rosterRecord(4, "OrNurse", "Theo Lane"),
      rosterRecord(5, "ScrubOrTech", "Evan Holt"),
      rosterRecord(6, "SurgicalTechFirstAssist", "Arlo Pierce"),
      rosterRecord(7, "RecoveryNurse", "Remy Stone")
    ]);
    const service = new OrCallInService(client);

    const entries = await service.getRosterEntries(surgeryDateTimeIso);

    expect(client.requestedListTitle).toBe("OrMedTrakRoster");
    expect(client.requestedOptions).toEqual(
      expect.objectContaining({
        filter:
          "OrIsActive eq 1 and " +
          "OrOnCallStart le datetime'2026-08-14T19:37:00.000Z' and " +
          "OrOnCallEnd ge datetime'2026-08-14T19:37:00.000Z'",
        orderBy: "OrSortOrder asc",
        top: 200
      })
    );
    expect(entries.map((entry) => entry.role)).toEqual([
      "OrNurse",
      "ScrubOrTech",
      "SurgicalTechFirstAssist",
      "RecoveryNurse"
    ]);
  });
});

function rosterRecord(sortOrder: number, role: string, staffName: string): SharePointListItemRecord {
  return {
    Id: sortOrder,
    OrRole: role,
    OrStaffName: staffName,
    OrPhoneOne: "841-766-1000",
    OrPhoneTwo: "841-766-2000",
    OrOnCallStart: "2026-08-14T11:00:00.000Z",
    OrOnCallEnd: "2026-08-15T11:00:00.000Z",
    OrIsActive: true,
    OrSortOrder: sortOrder,
    OrRequiredByDefault: true
  };
}
