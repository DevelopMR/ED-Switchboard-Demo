import { PagingLogItem } from "../../models/PagingLogItem";

export interface IPagingLogService {
  createLog(item: PagingLogItem): Promise<PagingLogItem>;
}
