import { IAlarmPanelService } from "./contracts/IAlarmPanelService";
import { IDuiIntakeService } from "./contracts/IDuiIntakeService";
import { IOrCallInService } from "./contracts/IOrCallInService";
import { IPagingLogService } from "./contracts/IPagingLogService";
import { IPopupHostService } from "./contracts/IPopupHostService";
import { IPgOverheadPageLogService } from "./contracts/IPgOverheadPageLogService";
import { IRmDemoEntriesService } from "./contracts/IRmDemoEntriesService";
import { ISwDailyNotesService } from "./contracts/ISwDailyNotesService";
import { ISwDrawerCountService } from "./contracts/ISwDrawerCountService";
import { ISwReferenceLinksService } from "./contracts/ISwReferenceLinksService";

export interface ShellServiceBundle {
  notesService: ISwDailyNotesService;
  orCallInService: IOrCallInService;
  duiIntakeService: IDuiIntakeService;
  pagingLogService: IPagingLogService;
  alarmPanelService: IAlarmPanelService;
  pageLogService: IPgOverheadPageLogService;
  riskmasterService: IRmDemoEntriesService;
  drawerCountService: ISwDrawerCountService;
  referenceLinksService: ISwReferenceLinksService;
  popupHostService: IPopupHostService;
  currentUserName: string;
  siteUrl?: string;
  useMockData: boolean;
}

