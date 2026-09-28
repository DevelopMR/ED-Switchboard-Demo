import { SwDrawerCountState } from "../../models/SwDrawerCountState";
import { ListNames } from "../../constants/ListNames";
import { SwFields } from "../../constants/SwFields";
import { ISwDrawerCountService } from "../contracts/ISwDrawerCountService";
import { ISharePointListClient } from "./ISharePointListClient";
import {
  getExistingShellStateItemId,
  mapDrawerCountStateFromFieldValue,
  mapDrawerCountStateToFieldValue
} from "./SwDrawerCountMapper";

export class SwDrawerCountService implements ISwDrawerCountService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async getDrawerCountState(logDate: string): Promise<SwDrawerCountState> {
    const records = await this.listClient.getItems(ListNames.SwShellState, {
      select: ["Id", SwFields.DrawerCountData, "Title"],
      filter: `Title eq '${logDate}'`,
      top: 1
    });

    return mapDrawerCountStateFromFieldValue(records[0]?.[SwFields.DrawerCountData]);
  }

  public async saveDrawerCountState(logDate: string, state: SwDrawerCountState): Promise<SwDrawerCountState> {
    const records = await this.listClient.getItems(ListNames.SwShellState, {
      select: ["Id", SwFields.DrawerCountData, "Title"],
      filter: `Title eq '${logDate}'`,
      top: 1
    });

    const payload = {
      Title: logDate,
      [SwFields.DrawerCountData]: mapDrawerCountStateToFieldValue(state)
    };

    const existingId = getExistingShellStateItemId(records);

    if (existingId) {
      await this.listClient.updateItem(ListNames.SwShellState, existingId, payload);
    } else {
      await this.listClient.createItem(ListNames.SwShellState, payload);
    }

    return state;
  }
}
