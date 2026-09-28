import { SwReferenceLinkItem } from "../../models/SwReferenceLinkItem";
import { ISwReferenceLinksService } from "../contracts/ISwReferenceLinksService";

const mockLinks: SwReferenceLinkItem[] = [
  {
    id: "ref-1",
    title: "DUI Intakes",
    group: "Reference",
    url: "https://contoso.sharepoint.com/sites/EDSwitchboard/Lists/DuiIntakes/AllItems.aspx",
    description: "Demo intake records",
    iconKey: "Document",
    sortOrder: 10,
    isActive: true,
    openInNewWindow: true
  },
  {
    id: "ops-1",
    title: "Switchboard Notes",
    group: "Operations",
    url: "https://contoso.sharepoint.com/sites/EDSwitchboard/Lists/SwDailyNotes/AllItems.aspx",
    description: "Daily log review",
    iconKey: "Home",
    sortOrder: 20,
    isActive: true,
    openInNewWindow: true
  },
  {
    id: "pol-1",
    title: "Demo Policy Binder",
    group: "Policies",
    url: "https://contoso.sharepoint.com/sites/EDSwitchboard/SitePages/PolicyBinder.aspx",
    description: "Reference material",
    iconKey: "Info",
    sortOrder: 30,
    isActive: true,
    openInNewWindow: true
  },
  {
    id: "mgr-1",
    title: "Manager Dashboard",
    group: "Manager",
    url: "https://contoso.sharepoint.com/sites/EDSwitchboard/SitePages/ManagerDashboard.aspx",
    description: "Manager summary view",
    sortOrder: 40,
    isActive: true,
    openInNewWindow: true
  },
  {
    id: "adm-1",
    title: "Admin Console",
    group: "Admin",
    url: "https://contoso.sharepoint.com/sites/EDSwitchboard/SitePages/AdminConsole.aspx",
    description: "Site administration",
    sortOrder: 50,
    isActive: true,
    openInNewWindow: true
  }
];

export class MockSwReferenceLinksService implements ISwReferenceLinksService {
  public async getLinks(): Promise<SwReferenceLinkItem[]> {
    return [...mockLinks];
  }
}

