import * as React from "react";
import { codeAlertLaunchOptions, getCodeAlertLaunchOption } from "../../constants/CodeAlertLaunchOptions";
import { AppPopupFormValues, AppPopupLaunchKind } from "../../models/AppPopupMessage";

const additionalAlertQuickSelectKinds: AppPopupLaunchKind[] = [
  "StrokeAlert",
  "OutsideMedicalEmergency",
  "EnhancedSecurityMeasures",
  "ConditionSupport",
  "ArmedSubjectActiveShooter",
  "FireAlarm",
  "SevereWeatherEventActivation",
  "TraumaAlert",
  "BombThreat",
  "ChildAbduction",
  "InfantAbduction",
  "MissingPersonMissingChild",
  "Decontamination",
  "HazardousMaterialsSpillRelease",
  "MassCasualtyIncident",
  "EmergencyOperationsPlan"
];

const demoHospitalLocations = [
  "ED Room 12",
  "ED Room 4",
  "Main Lobby",
  "Radiology Hallway",
  "North Entrance",
  "Ambulance Bay",
  "Waiting Area B",
  "Triage 2"
];

const demoPatientNames = [
  "Mortimer Pickle",
  "Bernadette Waffles",
  "Crispin Noodle",
  "Agatha Turnip",
  "Basil Spoon",
  "Mildred Biscuit"
];

export interface ModuleLaunchDialogProps {
  launchKind: AppPopupLaunchKind | undefined;
  onCancel: () => void;
  onSubmit: (kind: AppPopupLaunchKind, values: AppPopupFormValues) => Promise<void>;
}

export function ModuleLaunchDialog(props: ModuleLaunchDialogProps): JSX.Element {
  const [selectedCodeAlertKind, setSelectedCodeAlertKind] = React.useState<AppPopupLaunchKind>("CodeBlueAdult");
  const [location, setLocation] = React.useState<string>("");
  const [instructions, setInstructions] = React.useState<string>("");
  const [patientName, setPatientName] = React.useState<string>("");
  const [patientDescription, setPatientDescription] = React.useState<string>("");

  React.useEffect(() => {
    if (props.launchKind && props.launchKind !== "FireAlarmPanel") {
      setSelectedCodeAlertKind(props.launchKind);
      setLocation(getRandomDemoHospitalLocation());
      setInstructions("");
      setPatientName(getRandomDemoPatientName());
      setPatientDescription("Demo patient description not provided.");
    }

    if (props.launchKind === "FireAlarmPanel") {
      setLocation("Fire Alarm Panel");
      setInstructions("Maintenance contact pending");
    }
  }, [props.launchKind]);

  if (!props.launchKind) {
    return <React.Fragment />;
  }

  const isFireAlarm = props.launchKind === "FireAlarmPanel";
  const selectedCodeAlert = getCodeAlertLaunchOption(selectedCodeAlertKind);
  const additionalCodeAlertOptions = codeAlertLaunchOptions.filter((option) => additionalAlertQuickSelectKinds.indexOf(option.kind) >= 0);
  const selectedAdditionalKind = additionalCodeAlertOptions.some((option) => option.kind === selectedCodeAlertKind)
    ? selectedCodeAlertKind
    : "";
  const title = isFireAlarm ? "Start Fire Alarm Panel" : "Start Code Alert";
  const requiresPatientName = selectedCodeAlertKind === "MissingPersonMissingChild";

  const handleSubmit = async (): Promise<void> => {
    await props.onSubmit(isFireAlarm ? "FireAlarmPanel" : selectedCodeAlertKind, {
      CaLocation: location,
      CaInstructions: instructions,
      CaPatientName: patientName,
      CaPatientDescription: patientDescription
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.ctrlKey && event.key === "Enter" && location.trim()) {
      event.preventDefault();
      handleSubmit().catch(() => undefined);
    }
  };

  return (
    <div className="swDialogBackdrop" role="dialog" aria-modal="true" aria-label={title} onKeyDown={handleKeyDown}>
      <div className="swDialogFrame">
        <h3>{title}</h3>
        {!isFireAlarm ? (
          <label className="swDialogField">
            <span>Alert Type</span>
            <select
              value={selectedCodeAlertKind}
              onChange={(event) => setSelectedCodeAlertKind(event.currentTarget.value as AppPopupLaunchKind)}
            >
              {codeAlertLaunchOptions.map((option) => (
                <option key={option.kind} value={option.kind}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {!isFireAlarm ? (
          <label className="swDialogField">
            <span>Additional Alert Quick Select</span>
            <select
              value={selectedAdditionalKind}
              onChange={(event) => {
                if (event.currentTarget.value) {
                  setSelectedCodeAlertKind(event.currentTarget.value as AppPopupLaunchKind);
                }
              }}
            >
              <option value="">Choose one of the newer alert forms</option>
              {additionalCodeAlertOptions.map((option) => (
                <option key={option.kind} value={option.kind}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="swDialogField">
          <span>Room / Location</span>
          <input type="text" value={location} onChange={(event) => setLocation(event.currentTarget.value)} />
        </label>
        {requiresPatientName ? (
          <React.Fragment>
            <label className="swDialogField">
              <span>Demo Patient Name</span>
              <input type="text" value={patientName} onChange={(event) => setPatientName(event.currentTarget.value)} />
            </label>
            <label className="swDialogField">
              <span>Demo Patient Description</span>
              <textarea rows={2} value={patientDescription} onChange={(event) => setPatientDescription(event.currentTarget.value)} />
            </label>
          </React.Fragment>
        ) : null}
        {!isFireAlarm && selectedCodeAlert ? <div className="swDialogHint">{selectedCodeAlert.label}</div> : null}
        {isFireAlarm ? (
          <React.Fragment>
            <label className="swDialogField">
              <span>Notes / Instructions</span>
              <textarea rows={3} value={instructions} onChange={(event) => setInstructions(event.currentTarget.value)} />
            </label>
          </React.Fragment>
        ) : null}
        <div className="swDialogActions">
          <button type="button" onClick={props.onCancel}>
            Cancel
          </button>
          <button type="button" onClick={() => handleSubmit().catch(() => undefined)} disabled={!location.trim() || (requiresPatientName && !patientName.trim())}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

function getRandomDemoHospitalLocation(): string {
  const index = Math.floor(Math.random() * demoHospitalLocations.length);
  return demoHospitalLocations[index];
}

function getRandomDemoPatientName(): string {
  const index = Math.floor(Math.random() * demoPatientNames.length);
  return demoPatientNames[index];
}
