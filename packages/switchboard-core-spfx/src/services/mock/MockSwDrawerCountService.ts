import { SwDrawerCountState } from "../../models/SwDrawerCountState";
import { ISwDrawerCountService } from "../contracts/ISwDrawerCountService";

export class MockSwDrawerCountService implements ISwDrawerCountService {
  private readonly stateByDate = new Map<string, SwDrawerCountState>();

  public async getDrawerCountState(_logDate: string): Promise<SwDrawerCountState> {
    if (!this.stateByDate.has(_logDate)) {
      this.stateByDate.set(_logDate, {
        boxes: [{ slot: 1 }, { slot: 2 }, { slot: 3 }, { slot: 4 }]
      });
    }

    return this.stateByDate.get(_logDate) ?? {
      boxes: [{ slot: 1 }, { slot: 2 }, { slot: 3 }, { slot: 4 }]
    };
  }

  public async saveDrawerCountState(_logDate: string, state: SwDrawerCountState): Promise<SwDrawerCountState> {
    this.stateByDate.set(_logDate, state);
    return state;
  }
}
