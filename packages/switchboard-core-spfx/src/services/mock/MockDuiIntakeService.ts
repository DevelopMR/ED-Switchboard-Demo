import { DuiIntakeItem } from "../../models/DuiIntakeItem";
import { IDuiIntakeService } from "../contracts/IDuiIntakeService";

export class MockDuiIntakeService implements IDuiIntakeService {
  private items: DuiIntakeItem[] = [];

  public async createIntake(item: DuiIntakeItem): Promise<DuiIntakeItem> {
    const saved = {
      ...item,
      id: item.id || `DUI-${Date.now()}`
    };

    this.items = [saved, ...this.items];
    return saved;
  }
}
