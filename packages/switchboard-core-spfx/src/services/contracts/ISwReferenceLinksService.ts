import { SwReferenceLinkItem } from "../../models/SwReferenceLinkItem";

export interface ISwReferenceLinksService {
  getLinks(): Promise<SwReferenceLinkItem[]>;
}
