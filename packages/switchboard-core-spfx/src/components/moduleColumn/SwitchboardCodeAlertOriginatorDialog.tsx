import * as React from "react";

import { AppPopupFormValues, AppPopupLaunchKind } from "../../models/AppPopupMessage";
import {
  composeSwitchboardCodeAlertLocation,
  createEmptySwitchboardCodeAlertLocation,
  SwitchboardCodeAlertLocation
} from "../../models/SwitchboardCodeAlertLocation";
import {
  getSwitchboardCodeAlert,
  switchboardCodeAlertCatalog,
  SwitchboardCodeAlertCategory
} from "../../models/SwitchboardCodeAlertCatalog";

const dialogCss = `
.swCodeAlertOriginatorDialog {
  width: min(1220px, calc(100vw - 40px));
  max-width: 1220px;
  max-height: calc(100vh - 40px);
  overflow: auto;
}
.swCodeAlertOriginatorEyebrow {
  color: #6e1f5f;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.swCodeAlertOriginatorTitle {
  margin: 0 0 8px;
}
.swCodeAlertOriginatorIntro {
  margin: 0 0 18px;
}
.swCodeAlertOriginatorSection,
.swCodeAlertOriginatorLocationGroup {
  border: 1px solid #d8c9d2;
  padding: 12px;
  margin: 0 0 16px;
}
.swCodeAlertOriginatorLocationGroup > p {
  margin: 0 0 12px;
}
.swCodeAlertOriginatorSection legend,
.swCodeAlertOriginatorLocationGroup legend {
  padding: 0 8px;
}
.swCodeAlertOriginatorSection > legend {
  color: #111111;
  font-size: 14px;;
}
.swCodeAlertOriginatorGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.swCodeAlertOriginatorGroup {
  border: 1px solid #c8c8c8;
  padding: 10px 10px 12px;
  min-width: 0;
}
.swCodeAlertOriginatorGroup legend {
  font-weight: 700;
  color: #4f1140;
  padding: 0 8px;
}
.swCodeAlertOriginatorChoice {
  width: 100%;
  display: flex;
  align-items: stretch;
  text-align: left;
  margin: 0 0 8px;
  border: 1px solid #b8b8b8;
  background: #ffffff;
  padding: 0;
  cursor: pointer;
}
.swCodeAlertOriginatorChoice:last-child {
  margin-bottom: 0;
}
.swCodeAlertOriginatorChoiceBar {
  width: 6px;
  flex: 0 0 6px;
}
.swCodeAlertOriginatorChoice span:last-child {
  display: block;
  padding: 12px 14px;
  font-size: .8rem;
}
.swCodeAlertOriginatorChoice.is-selected {
  box-shadow: inset 0 0 0 2px #6e1f5f;
  background: #faf6f9;
}
.swCodeAlertOriginatorFields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.swCodeAlertOriginatorField {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.swCodeAlertOriginatorField span {
  font-weight: 700;
}
.swCodeAlertOriginatorField input,
.swCodeAlertOriginatorField textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border: 1px solid #b8b8b8;
  font: inherit;
}
.swCodeAlertOriginatorField textarea {
  resize: vertical;
}
.swCodeAlertOriginatorField small {
  color: #555555;
}
.swCodeAlertOriginatorLocationPreview {
  border-left: 6px solid #7f285c;
  background: #f7d7dc;
  padding: 10px 12px;
}
.swCodeAlertOriginatorLocationPreview span {
  display: block;
  margin-bottom: 4px;
}
.swCodeAlertOriginatorLocationPreview strong {
  display: block;
}
.swCodeAlertOriginatorError {
  border-left: 6px solid #a4262c;
  background: #fde7e9;
  padding: 10px 12px;
  margin: 0 0 16px;
  color: #7a1f25;
  font-weight: 700;
}
@media (max-width: 1120px) {
  .swCodeAlertOriginatorGrid,
  .swCodeAlertOriginatorFields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 780px) {
  .swCodeAlertOriginatorGrid,
  .swCodeAlertOriginatorFields {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;


export interface SwitchboardCodeAlertOriginatorDialogProps {
  isOpen: boolean;
  defaultFacility: string;
  onCancel: () => void;
  onSubmit: (kind: AppPopupLaunchKind, values: AppPopupFormValues) => Promise<void>;
}

export function SwitchboardCodeAlertOriginatorDialog(props: SwitchboardCodeAlertOriginatorDialogProps): JSX.Element {
  const [selectedKind, setSelectedKind] = React.useState<AppPopupLaunchKind | "">("");
  const [location, setLocation] = React.useState<SwitchboardCodeAlertLocation>(() => createEmptySwitchboardCodeAlertLocation(props.defaultFacility || "HOS"));
  const [instructions, setInstructions] = React.useState<string>("");
  const [personName, setPersonName] = React.useState<string>("");
  const [validationError, setValidationError] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    setSelectedKind("");
    setLocation(createEmptySwitchboardCodeAlertLocation(props.defaultFacility || "HOS"));
    setInstructions("");
    setPersonName("");
    setValidationError("");
    setIsSubmitting(false);
  }, [props.defaultFacility, props.isOpen]);

  if (!props.isOpen) {
    return <React.Fragment />;
  }

  const selectedAlert = getSwitchboardCodeAlert(selectedKind);
  const composedLocation = composeSwitchboardCodeAlertLocation(location);
  const categories: SwitchboardCodeAlertCategory[] = ["Medical", "Security", "Facility"];

  const handleSubmit = async (): Promise<void> => {
    if (!selectedAlert) {
      setValidationError("Select a Code Alert before starting the popup workflow.");
      return;
    }

    if (!composedLocation) {
      setValidationError("Enter enough location information for switchboard to direct the alert.");
      return;
    }

    if (composedLocation.length > 255) {
      setValidationError("Shorten the combined location to 255 characters or fewer.");
      return;
    }

    if (selectedAlert.personNameLabel && !personName.trim()) {
      setValidationError("Enter the demo missing person / child name before starting the workflow.");
      return;
    }

    const trimmedInstructions = instructions.trim();
    const values: AppPopupFormValues = {
      CaLocation: composedLocation
    };

    if (trimmedInstructions) {
      values.CaInstructions = trimmedInstructions;
    }

    if (selectedAlert.personNameLabel) {
      values.CaPatientName = personName.trim();
      values.CaPatientDescription = trimmedInstructions;
    }

    setIsSubmitting(true);
    setValidationError("");
    try {
      await props.onSubmit(selectedAlert.kind, values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      handleSubmit().catch(() => undefined);
    }
  };

  return (
    <div className="swDialogBackdrop" role="dialog" aria-modal="true" aria-label="Code Alert Originator" onKeyDown={handleKeyDown}>
      <style>{dialogCss}</style>
      <div className="swDialogFrame swCodeAlertOriginatorDialog">
        <div className="swCodeAlertOriginatorEyebrow">ED SWITCHBOARD</div>
        <h3 className="swCodeAlertOriginatorTitle">Code Alert Originator</h3>
        <p className="swCodeAlertOriginatorIntro">
          Start a switchboard-local Code Alert. Do not enter patient identifiers or clinical details.
        </p>

        <fieldset className="swCodeAlertOriginatorSection">
          <legend>Which Code Alert?</legend>
          <div className="swCodeAlertOriginatorGrid">
            {categories.map((category) => (
              <fieldset className="swCodeAlertOriginatorGroup" key={category}>
                <legend>{category}</legend>
                {switchboardCodeAlertCatalog.filter((item) => item.category === category).map((item) => (
                  <button
                    key={item.kind}
                    type="button"
                    className={`swCodeAlertOriginatorChoice${selectedKind === item.kind ? " is-selected" : ""}`}
                    onClick={() => {
                      setSelectedKind(item.kind);
                      setValidationError("");
                    }}
                  >
                    <span className="swCodeAlertOriginatorChoiceBar" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span>{item.alertType}</span>
                  </button>
                ))}
              </fieldset>
            ))}
          </div>
        </fieldset>

        <fieldset className="swCodeAlertOriginatorLocationGroup">
          <legend>Where is the alert?</legend>
          <div className="swCodeAlertOriginatorFields">
            <TextField label="Facility" value={location.facility} onChange={(value) => setLocationValue(setLocation, "facility", value)} />
            <TextField label="Department or area" value={location.department} onChange={(value) => setLocationValue(setLocation, "department", value)} />
            <TextField label="Floor" value={location.floor} onChange={(value) => setLocationValue(setLocation, "floor", value)} />
            <TextField label="Direction" value={location.direction} placeholder="North, South, East, West" onChange={(value) => setLocationValue(setLocation, "direction", value)} />
            <TextField label="Room" value={location.room} onChange={(value) => setLocationValue(setLocation, "room", value)} />
            <TextField label="Additional location detail" value={location.additional} placeholder="3 South, west window" onChange={(value) => setLocationValue(setLocation, "additional", value)} />
          </div>
          <div className="swCodeAlertOriginatorLocationPreview">
            <span>Location sent to switchboard popup</span>
            <strong>{composedLocation || "Enter at least one location value."}</strong>
          </div>
        </fieldset>

        {selectedAlert?.personNameLabel ? (
          <label className="swCodeAlertOriginatorField">
            <span>{selectedAlert.personNameLabel}</span>
            <input type="text" value={personName} onChange={(event) => setPersonName(event.currentTarget.value)} />
          </label>
        ) : null}

        {selectedAlert?.instructionsLabel ? (
          <label className="swCodeAlertOriginatorField">
            <span>{selectedAlert.instructionsLabel}</span>
            <textarea rows={4} value={instructions} onChange={(event) => setInstructions(event.currentTarget.value)} />
            <small>Optional. Use synthetic demo details only.</small>
          </label>
        ) : null}

        {validationError ? <div className="swCodeAlertOriginatorError" role="alert">{validationError}</div> : null}

        <div className="swDialogActions">
          <button type="button" onClick={props.onCancel} disabled={isSubmitting}>Cancel</button>
          <button type="button" onClick={() => handleSubmit().catch(() => undefined)} disabled={isSubmitting}>
            {isSubmitting ? "Starting..." : "Start Code Alert"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TextField(props: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="swCodeAlertOriginatorField">
      <span>{props.label}</span>
      <input type="text" value={props.value} placeholder={props.placeholder} onChange={(event) => props.onChange(event.currentTarget.value)} />
    </label>
  );
}

function setLocationValue(
  setLocation: React.Dispatch<React.SetStateAction<SwitchboardCodeAlertLocation>>,
  key: keyof SwitchboardCodeAlertLocation,
  value: string
): void {
  setLocation((current) => ({
    ...current,
    [key]: value
  }));
}



