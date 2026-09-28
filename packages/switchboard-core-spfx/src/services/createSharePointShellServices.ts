import { AppOwnedPopupHostService } from "./popup/AppOwnedPopupHostService";
import { AlarmPanelService } from "./sharepoint/AlarmPanelService";
import { ShellRuntimeContext } from "./ShellRuntimeContext";
import { ShellServiceBundle } from "./ShellServiceBundle";
import { DuiIntakeService } from "./sharepoint/DuiIntakeService";
import { OrCallInService } from "./sharepoint/OrCallInService";
import { PagingLogService } from "./sharepoint/PagingLogService";
import { PgOverheadPageLogService } from "./sharepoint/PgOverheadPageLogService";
import { PopupHostService } from "./sharepoint/PopupHostService";
import { RmDemoEntriesService } from "./sharepoint/RmDemoEntriesService";
import { SharePointRestListClient } from "./sharepoint/SharePointRestListClient";
import { SwDailyNotesService } from "./sharepoint/SwDailyNotesService";
import { SwDrawerCountService } from "./sharepoint/SwDrawerCountService";
import { SwReferenceLinksService } from "./sharepoint/SwReferenceLinksService";

export function createSharePointShellServices(context: ShellRuntimeContext): ShellServiceBundle {
  const listClient = new SharePointRestListClient({
    baseSiteUrl: context.siteUrl,
    fetchImpl: context.fetchImpl,
    requestDigest: context.requestDigest
  });

  return {
    notesService: new SwDailyNotesService(listClient),
    orCallInService: new OrCallInService(listClient),
    duiIntakeService: new DuiIntakeService(listClient),
    pagingLogService: new PagingLogService(listClient),
    alarmPanelService: new AlarmPanelService(listClient),
    pageLogService: new PgOverheadPageLogService(listClient),
    riskmasterService: new RmDemoEntriesService(listClient),
    drawerCountService: new SwDrawerCountService(listClient),
    referenceLinksService: new SwReferenceLinksService(listClient),
    popupHostService: context.switchboardId
      ? new PopupHostService({
          listClient,
          currentUserName: context.currentUserName,
          switchboardId: context.switchboardId,
          codeAlertsListTitle: context.codeAlertsListTitle,
          intakeListTitle: context.intakeListTitle,
          pollingIntervalMs: context.popupPollingIntervalMs,
          debugLogging: context.popupDebugLogging === true
        })
      : new AppOwnedPopupHostService({
          preloadDemoAlerts: context.preloadDemoAlerts === true
        }),
    currentUserName: context.currentUserName,
    siteUrl: context.siteUrl,
    useMockData: false
  };
}

