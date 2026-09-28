export interface SharePointListItemRecord {
  Id?: number;
  Title?: string;
  [key: string]: unknown;
}

export interface ListItemQueryOptions {
  select?: string[];
  filter?: string;
  orderBy?: string;
  top?: number;
}

export interface ISharePointListClient {
  getItems(listTitle: string, options?: ListItemQueryOptions): Promise<SharePointListItemRecord[]>;
  createItem(listTitle: string, payload: Record<string, unknown>): Promise<SharePointListItemRecord>;
  updateItem(listTitle: string, itemId: number, payload: Record<string, unknown>): Promise<SharePointListItemRecord>;
}
