import { OrCallInItem } from "../../models/OrCallInItem";
import { OrMedTrakRosterItem } from "../../models/OrMedTrakRosterItem";

export interface IOrCallInService {
  createCallIn(item: OrCallInItem): Promise<OrCallInItem>;
  getRosterEntries(surgeryDateTimeIso: string): Promise<OrMedTrakRosterItem[]>;
}
