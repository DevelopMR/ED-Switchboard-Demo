import { DuiIntakeItem } from "../../models/DuiIntakeItem";

export interface IDuiIntakeService {
  createIntake(item: DuiIntakeItem): Promise<DuiIntakeItem>;
}
