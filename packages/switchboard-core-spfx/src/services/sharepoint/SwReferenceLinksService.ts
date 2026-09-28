import { ListNames } from "../../constants/ListNames";
import { SwReferenceLinkGroups, SwReferenceLinkGroup, SwReferenceLinkItem } from "../../models/SwReferenceLinkItem";
import { ISwReferenceLinksService } from "../contracts/ISwReferenceLinksService";
import { ISharePointListClient, SharePointListItemRecord } from "./ISharePointListClient";

interface SharePointUrlValue {
  Url?: string;
  Description?: string;
}

export class SwReferenceLinksService implements ISwReferenceLinksService {
  public constructor(private readonly listClient: ISharePointListClient) {}

  public async getLinks(): Promise<SwReferenceLinkItem[]> {
    const records = await this.listClient.getItems(ListNames.SwReferenceLinks, {
      top: 200
    });

    return records
      .map((record) => this.mapRecord(record))
      .filter((item) => item.isActive && item.url.trim().length > 0)
      .sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }

        return left.title.localeCompare(right.title);
      });
  }

  private mapRecord(record: SharePointListItemRecord): SwReferenceLinkItem {
    const id = this.getString(record, "Id") || this.getString(record, "ID") || this.getString(record, "id") || "";
    const title = this.getString(record, "Title") || "Untitled link";
    const rawGroup = this.getString(record, "SwGroup", "Group") || "Reference";
    const urlValue = this.getUrlValue(record, "SwUrl", "SwLinkUrl", "SwHref", "SwLink", "Url", "URL");
    const description = this.getString(record, "SwDescription", "Description") || urlValue.description;
    const iconKey = this.getString(record, "SwIconKey", "IconKey", "Icon", "SwIcon");
    const sortOrder = this.getNumber(record, "SwSortOrder", "SortOrder");
    const isActive = this.getBoolean(record, "SwIsActive", "IsActive", "Active", "SwActive", "Enabled", "SwEnabled", "IsEnabled", "SwVisible");
    const openInNewWindow = this.getBoolean(record, "SwOpenInNewWindow", "OpenInNewWindow", "SwOpenNewWindow", "OpenNewWindow");

    return {
      id: id || title,
      title,
      group: this.normalizeGroup(rawGroup),
      url: urlValue.url,
      description: description || undefined,
      iconKey: iconKey || undefined,
      sortOrder,
      isActive,
      openInNewWindow
    };
  }

  private normalizeGroup(value: string): SwReferenceLinkGroup {
    const matched = SwReferenceLinkGroups.find((group) => group.toLowerCase() === value.trim().toLowerCase());
    return matched ?? "Reference";
  }

  private getUrlValue(record: SharePointListItemRecord, ...keys: string[]): { url: string; description: string } {
    for (const key of keys) {
      const value = record[key];

      if (typeof value === "string" && value.trim().length > 0) {
        return {
          url: value.trim(),
          description: ""
        };
      }

      if (value && typeof value === "object") {
        const urlValue = value as SharePointUrlValue;
        const url = typeof urlValue.Url === "string" ? urlValue.Url.trim() : "";
        const description = typeof urlValue.Description === "string" ? urlValue.Description.trim() : "";

        if (url.length > 0) {
          return {
            url,
            description
          };
        }
      }
    }

    return {
      url: "",
      description: ""
    };
  }

  private getString(record: SharePointListItemRecord, ...keys: string[]): string {
    for (const key of keys) {
      const value = record[key];

      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }

    return "";
  }

  private getNumber(record: SharePointListItemRecord, ...keys: string[]): number {
    for (const key of keys) {
      const value = record[key];

      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === "string") {
        const parsed = Number.parseFloat(value.trim());

        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return 9999;
  }

  private getBoolean(record: SharePointListItemRecord, ...keys: string[]): boolean {
    for (const key of keys) {
      const value = record[key];

      if (typeof value === "boolean") {
        return value;
      }

      if (typeof value === "number") {
        return value !== 0;
      }

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (normalized === "true" || normalized === "yes" || normalized === "1") {
          return true;
        }

        if (normalized === "false" || normalized === "no" || normalized === "0") {
          return false;
        }
      }
    }

    return true;
  }
}

