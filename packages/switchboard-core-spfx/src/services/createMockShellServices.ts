import { MockAlarmPanelService } from "./mock/MockAlarmPanelService";
import { MockDuiIntakeService } from "./mock/MockDuiIntakeService";
import { MockOrCallInService } from "./mock/MockOrCallInService";
import { MockPagingLogService } from "./mock/MockPagingLogService";
import { MockPopupHostService } from "./mock/MockPopupHostService";
import { MockPgOverheadPageLogService } from "./mock/MockPgOverheadPageLogService";
import { MockRmDemoEntriesService } from "./mock/MockRmDemoEntriesService";
import { MockSwDailyNotesService } from "./mock/MockSwDailyNotesService";
import { MockSwDrawerCountService } from "./mock/MockSwDrawerCountService";
import { MockSwReferenceLinksService } from "./mock/MockSwReferenceLinksService";
import { ShellServiceBundle } from "./ShellServiceBundle";

export function createMockShellServices(currentUserName = "Current User"): ShellServiceBundle {
  return {
    notesService: new MockSwDailyNotesService(),
    orCallInService: new MockOrCallInService(),
    duiIntakeService: new MockDuiIntakeService(),
    pagingLogService: new MockPagingLogService(),
    alarmPanelService: new MockAlarmPanelService(),
    pageLogService: new MockPgOverheadPageLogService(),
    riskmasterService: new MockRmDemoEntriesService(),
    drawerCountService: new MockSwDrawerCountService(),
    referenceLinksService: new MockSwReferenceLinksService(),
    popupHostService: new MockPopupHostService(),
    currentUserName,
    useMockData: true
  };
}

