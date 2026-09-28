import * as React from "react";
import alarmPanelIcon from "../../assets/moduleIcons/sbAlarmPanel-i.png";
import codeAlertIcon from "../../assets/moduleIcons/sbCodeAlert-i.png";
import duiIntakeIcon from "../../assets/moduleIcons/sbDUIIntake-i.png";
import orTeamIcon from "../../assets/moduleIcons/sbORTeam-i.png";
import pagingLogIcon from "../../assets/moduleIcons/sbPagingLog-i.png";
import { ModuleLauncherCard } from "./ModuleLauncherCard";

export interface ModuleColumnProps {
  onStartCodeAlert: () => void;
  onStartOrCallIn: () => void;
  onStartDuiIntake: () => void;
  onStartPagingLog: () => void;
  onStartFireAlarmPanel: () => void;
}

export function ModuleColumn(props: ModuleColumnProps): JSX.Element {
  return (
    <div className="swModuleColumn">
      <div className="swModuleSection">
        <div className="swModuleSectionTitle">Workflows</div>
        <ModuleLauncherCard
          title="Code Alert"
          subtitle="Monitor and respond"
          iconSrc={codeAlertIcon}
          iconAlt="Trigger Code Alert"
          onClick={props.onStartCodeAlert}
        />
        <ModuleLauncherCard
          title="OR Team Call-In"
          subtitle="Open team call-in workflow"
          iconSrc={orTeamIcon}
          iconAlt="Call In OR Team"
          onClick={props.onStartOrCallIn}
        />
        <ModuleLauncherCard
          title="DUI Intake"
          subtitle="Log synthetic intake"
          iconSrc={duiIntakeIcon}
          iconAlt="DUI Intake Form"
          onClick={props.onStartDuiIntake}
        />
        <ModuleLauncherCard
          title="Paging Log"
          subtitle="Record page requests"
          iconSrc={pagingLogIcon}
          iconAlt="Paging Log"
          onClick={props.onStartPagingLog}
        />
        <ModuleLauncherCard
          title="Alarm Panel"
          subtitle="Log alarm events"
          iconSrc={alarmPanelIcon}
          iconAlt="Alarm Panel Log"
          onClick={props.onStartFireAlarmPanel}
        />
      </div>
    </div>
  );
}
