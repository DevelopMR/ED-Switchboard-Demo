import { PgOverheadPageLogItem } from "../../models/PgOverheadPageLogItem";

export interface IPgOverheadPageLogService {
  createPageLog(item: PgOverheadPageLogItem): Promise<PgOverheadPageLogItem>;
}
