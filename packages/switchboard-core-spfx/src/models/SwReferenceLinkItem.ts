export const SwReferenceLinkGroups = ["Reference", "Operations", "Policies", "Manager", "Admin"] as const;

export type SwReferenceLinkGroup = (typeof SwReferenceLinkGroups)[number];

export interface SwReferenceLinkItem {
  id: string;
  title: string;
  group: SwReferenceLinkGroup;
  url: string;
  description?: string;
  iconKey?: string;
  sortOrder: number;
  isActive: boolean;
  openInNewWindow: boolean;
}

