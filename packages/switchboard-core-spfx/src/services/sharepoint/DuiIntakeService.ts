import { ListNames } from "../../constants/ListNames";
import { DuiIntakeItem } from "../../models/DuiIntakeItem";
import { IDuiIntakeService } from "../contracts/IDuiIntakeService";
import { ISharePointListClient } from "./ISharePointListClient";
import { mapDuiIntakeItemToCreatePayload } from "./DuiIntakeMapper";

export class DuiIntakeService implements IDuiIntakeService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async createIntake(item: DuiIntakeItem): Promise<DuiIntakeItem> {
    const created = await this.listClient.createItem(ListNames.DuiIntakes, mapDuiIntakeItemToCreatePayload(item));

    return {
      ...item,
      id: String(created.Id ?? item.id)
    };
  }
}
