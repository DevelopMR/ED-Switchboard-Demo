import { ISharePointListClient, ListItemQueryOptions, SharePointListItemRecord } from "./ISharePointListClient";

export interface SharePointRestClientOptions {
  baseSiteUrl: string;
  fetchImpl?: typeof fetch;
  requestDigest?: string;
}

export class SharePointRestListClient implements ISharePointListClient {
  private readonly fetchImpl: typeof fetch;
  private requestDigest?: string;

  public constructor(private readonly options: SharePointRestClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.requestDigest = options.requestDigest;
  }

  public async getItems(listTitle: string, options?: ListItemQueryOptions): Promise<SharePointListItemRecord[]> {
    const queryParts: string[] = [];

    if (options?.select && options.select.length > 0) {
      queryParts.push(`$select=${encodeURIComponent(options.select.join(","))}`);
    }

    if (options?.filter) {
      queryParts.push(`$filter=${encodeURIComponent(options.filter)}`);
    }

    if (options?.orderBy) {
      queryParts.push(`$orderby=${encodeURIComponent(options.orderBy)}`);
    }

    if (options?.top) {
      queryParts.push(`$top=${options.top}`);
    }

    const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const response = await this.fetchImpl(this.buildUrl(`/_api/web/lists/GetByTitle('${listTitle}')/items${query}`), {
      headers: {
        Accept: "application/json;odata=nometadata"
      }
    });

    if (!response.ok) {
      throw new Error(`SharePoint getItems failed for ${listTitle} with status ${response.status}.`);
    }

    const data = (await response.json()) as { value?: SharePointListItemRecord[] };
    return data.value ?? [];
  }

  public async createItem(listTitle: string, payload: Record<string, unknown>): Promise<SharePointListItemRecord> {
    const headers = await this.buildWriteHeaders();
    const response = await this.fetchImpl(this.buildUrl(`/_api/web/lists/GetByTitle('${listTitle}')/items`), {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SharePointRestListClient] createItem failed for ${listTitle}`, { status: response.status, payload, errorText });
      throw new Error(`SharePoint createItem failed for ${listTitle} with status ${response.status}. ${errorText}`);
    }

    return (await response.json()) as SharePointListItemRecord;
  }

  public async updateItem(
    listTitle: string,
    itemId: number,
    payload: Record<string, unknown>
  ): Promise<SharePointListItemRecord> {
    const headers = await this.buildWriteHeaders();
    const response = await this.fetchImpl(this.buildUrl(`/_api/web/lists/GetByTitle('${listTitle}')/items(${itemId})`), {
      method: "POST",
      headers: {
        ...headers,
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`SharePoint updateItem failed for ${listTitle}/${itemId} with status ${response.status}.`);
    }

    return { Id: itemId, ...payload };
  }

  private async buildWriteHeaders(): Promise<Record<string, string>> {
    const requestDigest = await this.getRequestDigest();

    return {
      Accept: "application/json;odata=nometadata",
      "Content-Type": "application/json;odata=nometadata",
      ...(requestDigest ? { "X-RequestDigest": requestDigest } : {})
    };
  }

  private async getRequestDigest(): Promise<string | undefined> {
    if (this.requestDigest) {
      return this.requestDigest;
    }

    const response = await this.fetchImpl(this.buildUrl("/_api/contextinfo"), {
      method: "POST",
      headers: {
        Accept: "application/json;odata=nometadata"
      }
    });

    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as { FormDigestValue?: string };
    this.requestDigest = data.FormDigestValue;
    return this.requestDigest;
  }

  private buildUrl(path: string): string {
    return `${this.options.baseSiteUrl.replace(/\/$/, "")}${path}`;
  }
}


