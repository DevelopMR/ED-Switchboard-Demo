import { SwDrawerCountState } from "../../models/SwDrawerCountState";

export interface ISwDrawerCountService {
  getDrawerCountState(logDate: string): Promise<SwDrawerCountState>;
  saveDrawerCountState(logDate: string, state: SwDrawerCountState): Promise<SwDrawerCountState>;
}
