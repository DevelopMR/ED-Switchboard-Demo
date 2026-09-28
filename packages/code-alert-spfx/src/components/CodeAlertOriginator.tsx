import * as React from "react";
import * as ReactDom from "react-dom";

import codeAlertIcon from "../assets/moduleIcons/sbCodeAlert-iw.png";
import codeAlertIconHover from "../assets/moduleIcons/sbCodeAlert-iwh.png";
import { codeAlertCatalog, CodeAlertCategory, CodeAlertOption } from "../models/CodeAlertCatalog";
import { composeLocation, LocationPresets } from "../models/LocationPresets";
import { OriginatorRequest } from "../models/OriginatorRequest";
import { IOriginatorRequestService } from "../services/IOriginatorRequestService";
import { screenDescriptorText } from "../utils/privacyScreening";
import { originatorClassNames as styles, originatorCss } from "../styles/originatorStyles";

export interface ICodeAlertOriginatorProps {
  currentUserName: string;
  service: IOriginatorRequestService;
  presets: LocationPresets;
  displayFacility: string;
  displayTeam: string;
}

type SubmitState = "Idle" | "Sending" | "Sent" | "Error";

const acknowledgedRetentionMs = 5 * 60 * 1000;

export const CodeAlertOriginator: React.FC<ICodeAlertOriginatorProps> = (props) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [location, setLocation] = React.useState<LocationPresets>({ ...props.presets });
  const [selectedRuleId, setSelectedRuleId] = React.useState<string>("");
  const [evidenceNotes, setEvidenceNotes] = React.useState<string>("");
  const [activeRequests, setActiveRequests] = React.useState<OriginatorRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = React.useState<boolean>(true);
  const [requestError, setRequestError] = React.useState<string>("");
  const [validationError, setValidationError] = React.useState<string>("");
  const [submitState, setSubmitState] = React.useState<SubmitState>("Idle");
  const [reviewing, setReviewing] = React.useState<boolean>(false);
  const [allClearConfirmId, setAllClearConfirmId] = React.useState<string>("");
  const [pendingAllClearIds, setPendingAllClearIds] = React.useState<Set<string>>(new Set<string>());
  const [now, setNow] = React.useState<number>(Date.now());
  const [isLauncherHovered, setIsLauncherHovered] = React.useState<boolean>(false);
  const popupRef = React.useRef<HTMLElement>(null);

  const selectedAlert = codeAlertCatalog.find((item) => item.ruleId === selectedRuleId);
  const composedLocation = composeLocation(location);
  const visibleActiveRequests = activeRequests.filter((request) => shouldShowActiveRequest(request, now));
  const hasUnacknowledgedActiveRequest = visibleActiveRequests.some((request) => !isAcknowledged(request));
  const displayFacility = props.displayFacility || props.presets.facility || "Facility";
  const displayTeam = props.displayTeam || props.presets.department || "Team";
  const launcherStatus = visibleActiveRequests.length > 0 ? `${visibleActiveRequests.length} active alert${visibleActiveRequests.length === 1 ? "" : "s"}` : "Trigger Code Alert";

  const refreshRequests = React.useCallback(async (): Promise<void> => {
    try {
      const items = await props.service.getActiveRequests();
      setActiveRequests((current) => mergeVisibleRequests(items, current, Date.now()));
      setRequestError("");
    } catch (error) {
      setRequestError(toMessage(error));
    } finally {
      setLoadingRequests(false);
    }
  }, [props.service]);

  React.useEffect(() => {
    refreshRequests().catch(() => undefined);
  }, [refreshRequests]);

  React.useEffect(() => {
    setLocation((current) => ({
      ...current,
      facility: props.presets.facility,
      department: current.department || props.presets.department
    }));
  }, [props.presets.facility, props.presets.department]);

  React.useEffect(() => {
    if (activeRequests.length === 0) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setNow(Date.now());
      if (!document.hidden) {
        refreshRequests().catch(() => undefined);
      }
    }, 3000);
    return (): void => window.clearInterval(interval);
  }, [activeRequests.length, refreshRequests]);

  const beginReview = (): void => {
    setValidationError("");
    if (hasUnacknowledgedActiveRequest) {
      setValidationError("Switchboard must acknowledge the active Code Alert before another request can be created.");
      return;
    }
    if (!selectedAlert) {
      setValidationError("Select a Code Alert before continuing.");
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
    const screened = screenDescriptorText(`${location.additional} ${evidenceNotes}`);
    if (!screened.isAllowed) {
      setValidationError(screened.message ?? "Remove restricted identifying information before submitting.");
      return;
    }
    setReviewing(true);
  };

  const confirmSend = async (): Promise<void> => {
    if (!selectedAlert || !composedLocation || submitState === "Sending") {
      return;
    }
    setSubmitState("Sending");
    setValidationError("");
    try {
      const created = await props.service.submitAlert({
        requestId: createRequestId(),
        ruleId: selectedAlert.ruleId,
        category: selectedAlert.category,
        alertType: selectedAlert.alertType,
        location: composedLocation,
        evidenceNotes: selectedAlert.supportsEvidence ? evidenceNotes.trim() : undefined
      });
      setActiveRequests((current) => [created, ...current.filter((item) => item.requestId !== created.requestId)]);
      setSelectedRuleId("");
      setEvidenceNotes("");
      setLocation({ ...props.presets, room: "", additional: "" });
      setReviewing(false);
      setSubmitState("Sent");
      popupRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      if (created.signalWarning) {
        setRequestError(created.signalWarning);
      } else {
        setRequestError("");
      }
    } catch (error) {
      setSubmitState("Error");
      setValidationError(toMessage(error));
    }
  };

  const requestAllClear = async (request: OriginatorRequest): Promise<void> => {
    if (pendingAllClearIds.has(request.requestId)) {
      return;
    }
    setPendingAllClearIds((current) => new Set<string>(current).add(request.requestId));
    setAllClearConfirmId("");
    try {
      const created = await props.service.requestAllClear({
        requestId: createRequestId(),
        parentRequestId: request.requestId,
        parentRuleId: request.ruleId,
        parentAlertId: request.secureAlertId,
        parentCategory: request.category,
        parentAlertType: request.alertType,
        parentLocation: request.location
      });
      await refreshRequests();
      setRequestError(created.signalWarning ?? "");
      popupRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setRequestError(toMessage(error));
      setPendingAllClearIds((current) => {
        const next = new Set<string>(current);
        next.delete(request.requestId);
        return next;
      });
    }
  };

  const launcher = (
    <div className={`${styles.launcherShell} ${isExpanded ? styles.launcherShellOpen : ""}`}>
      <style>{originatorCss}</style>
      <button
        type="button"
        className={styles.launcherButton}
        title="Trigger Code Alert"
        aria-label="Trigger Code Alert"
        onMouseEnter={() => setIsLauncherHovered(true)}
        onMouseLeave={() => setIsLauncherHovered(false)}
        onFocus={() => setIsLauncherHovered(true)}
        onBlur={() => setIsLauncherHovered(false)}
        onClick={() => setIsExpanded(true)}
      >
        <img src={isLauncherHovered ? codeAlertIconHover : codeAlertIcon} alt="Trigger Code Alert" />
      </button>
      <div className={styles.launcherStatus}>{loadingRequests ? "Checking status..." : launcherStatus}</div>
      {requestError && !isExpanded ? <div className={styles.launcherError}>{requestError}</div> : null}
    </div>
  );

  const popup = isExpanded ? ReactDom.createPortal(
    <div className={styles.modalLayer} role="presentation">
      <main className={styles.originator} aria-labelledby="caOriginatorHeading" role="dialog" aria-modal="true" ref={popupRef}>
        <style>{originatorCss}</style>
        <header className={styles.header}>
          <div>
            <div className={styles.eyebrow}>{displayFacility} {displayTeam}</div>
            <h1 id="caOriginatorHeading">{displayTeam} Code Alerts</h1>
            <p>Submit the alert location to switchboard. Do not enter patient identifiers or clinical details.</p>
          </div>
          <div className={styles.identity} aria-label={`Current user ${props.currentUserName}`}>
            <span>Current user</span>
            <strong>{props.currentUserName}</strong>
          </div>
          <button type="button" className={styles.collapseButton} onClick={() => setIsExpanded(false)} disabled={hasUnacknowledgedActiveRequest}>
            Close
          </button>
        </header>

        <section className={styles.activeArea} aria-labelledby="ongoingAlertsHeading">
          <div className={styles.sectionHeadingRow}>
            <h2 id="ongoingAlertsHeading">Ongoing alerts</h2>
            <button type="button" className={styles.quietButton} onClick={() => refreshRequests()} disabled={loadingRequests}>
              Refresh
            </button>
          </div>
          {requestError ? <div className={styles.error} role="alert">{requestError}</div> : null}
          {loadingRequests ? <p>Checking for your active alerts...</p> : null}
          {!loadingRequests && visibleActiveRequests.length === 0 ? <p className={styles.empty}>No ongoing alerts for this user.</p> : null}
          <div className={styles.activeList}>
            {visibleActiveRequests.map((request) => {
              const acknowledged = isAcknowledged(request);
              const allClearPending = pendingAllClearIds.has(request.requestId);
              return (
                <article className={styles.activeCard} key={request.requestId}>
                  <div className={styles.activePrimary}>
                    <strong>{request.alertType}</strong>
                    <span>{request.location}</span>
                  </div>
                  <div className={styles.timer}>{formatElapsed(now - request.created.getTime())}</div>
                  <div className={acknowledged ? styles.acknowledged : styles.awaiting}>
                    {acknowledged ? "Acknowledged" : statusLabel(request.intakeStatus)}
                    {request.acknowledgedAt ? <small>{formatTime(request.acknowledgedAt)}</small> : null}
                  </div>
                  <div className={styles.allClearArea}>
                    {allClearPending ? <span>All Clear requested</span> : null}
                    {!allClearPending && acknowledged && allClearConfirmId !== request.requestId ? (
                      <button type="button" onClick={() => setAllClearConfirmId(request.requestId)}>Request All Clear</button>
                    ) : null}
                    {allClearConfirmId === request.requestId ? (
                      <div className={styles.inlineConfirm}>
                        <span>Ask switchboard to issue the All Clear?</span>
                        <button type="button" onClick={() => requestAllClear(request)}>Confirm</button>
                        <button type="button" className={styles.quietButton} onClick={() => setAllClearConfirmId("")}>Back</button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.formArea} aria-labelledby="newAlertHeading">
          <h2 id="newAlertHeading">Create New Code Alert</h2>

          <div className={styles.alertGroups}>
            {(["Medical", "Security", "Facility"] as CodeAlertCategory[]).map((category) => (
              <fieldset className={styles.alertGroup} key={category}>
                <legend>{category}</legend>
                {codeAlertCatalog.filter((item) => item.category === category).map((item) => (
                  <AlertChoice
                    key={item.ruleId}
                    item={item}
                    selected={selectedRuleId === item.ruleId}
                    onSelect={() => {
                      setSelectedRuleId(item.ruleId);
                      setEvidenceNotes("");
                      setReviewing(false);
                      setValidationError("");
                      setSubmitState("Idle");
                    }}
                  />
                ))}
              </fieldset>
            ))}
          </div>

          <fieldset className={styles.locationGroup}>
            <legend>Where is the alert?</legend>
            <p>Use the fields that apply. They will be combined into one location for switchboard.</p>
            <div className={styles.locationFields}>
              <TextField label="Facility" value={location.facility} readOnly={true} onChange={() => undefined} />
              <TextField label="Department or area" value={location.department} onChange={(value) => setLocationValue(setLocation, "department", value)} />
              <TextField label="Floor" value={location.floor} onChange={(value) => setLocationValue(setLocation, "floor", value)} />
              <TextField label="Direction" value={location.direction} placeholder="North, South, East, West" onChange={(value) => setLocationValue(setLocation, "direction", value)} />
              <TextField label="Room" value={location.room} onChange={(value) => setLocationValue(setLocation, "room", value)} />
              <TextField label="Additional location detail" value={location.additional} placeholder="3 South, west window" onChange={(value) => setLocationValue(setLocation, "additional", value)} />
            </div>
            <div className={styles.composedLocation}>
              <span>Location sent to switchboard</span>
              <strong>{composedLocation || "Enter at least one location value."}</strong>
            </div>
            {reviewing && selectedAlert ? (
              <section className={styles.review} aria-labelledby="reviewHeading">
                <h3 id="reviewHeading">Review before sending</h3>
                <dl>
                  <dt>Alert</dt><dd>{selectedAlert.alertType}</dd>
                  <dt>Location</dt><dd>{composedLocation}</dd>
                  {evidenceNotes.trim() ? <><dt>Descriptors</dt><dd>{evidenceNotes.trim()}</dd></> : null}
                </dl>
                <p>This creates an intake request. It is not acknowledged until switchboard responds.</p>
                <div className={styles.actionRow}>
                  <button type="button" className={styles.sendButton} onClick={() => confirmSend()} disabled={submitState === "Sending"}>
                    {submitState === "Sending" ? "Sending..." : "Confirm Send"}
                  </button>
                  <button type="button" className={styles.quietButton} onClick={() => setReviewing(false)} disabled={submitState === "Sending"}>Back</button>
                </div>
              </section>
            ) : null}
          </fieldset>

          {selectedAlert?.supportsEvidence ? (
            <div className={styles.evidenceField}>
              <label htmlFor="caEvidenceNotes">{selectedAlert.evidenceLabel}</label>
              <textarea
                id="caEvidenceNotes"
                value={evidenceNotes}
                onChange={(event) => {
                  setEvidenceNotes(event.currentTarget.value);
                  setReviewing(false);
                }}
                rows={4}
                maxLength={2000}
              />
              <small>Optional. Do not enter names, MRNs, visit codes, SSNs, phone numbers, diagnoses, or copied clinical text.</small>
            </div>
          ) : null}

          {validationError ? <div className={styles.error} role="alert">{validationError}</div> : null}
          {submitState === "Sent" ? <div className={styles.success} role="status">Received by intake. Fast signal sent where configured. Awaiting switchboard acknowledgement.</div> : null}

          <button type="button" className={styles.sendButton} onClick={beginReview} disabled={hasUnacknowledgedActiveRequest || submitState === "Sending"}>
            Review Alert
          </button>
        </section>
      </main>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {launcher}
      {popup}
    </>
  );
};

const AlertChoice: React.FC<{
  item: CodeAlertOption;
  selected: boolean;
  onSelect: () => void;
}> = ({ item, selected, onSelect }) => (
  <button
    type="button"
    className={`${styles.alertChoice} ${selected ? styles.alertChoiceSelected : ""}`}
    style={{ borderLeftColor: item.color }}
    aria-pressed={selected}
    onClick={onSelect}
  >
    {item.alertType}
  </button>
);

const TextField: React.FC<{
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
}> = ({ label, value, placeholder, readOnly, onChange }) => {
  const id = `ca${label.replace(/[^A-Za-z]/g, "")}`;
  return (
    <div className={styles.textField}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={100}
        readOnly={readOnly === true}
        aria-readonly={readOnly === true}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </div>
  );
};

function setLocationValue(
  setter: React.Dispatch<React.SetStateAction<LocationPresets>>,
  key: keyof LocationPresets,
  value: string
): void {
  setter((current) => ({ ...current, [key]: value }));
}

function createRequestId(): string {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `OR-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function formatElapsed(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ${minutes % 60} min`;
}

function formatTime(value: Date): string {
  return value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function isAcknowledged(request: OriginatorRequest): boolean {
  return Boolean(request.acknowledgedAt) || request.intakeStatus === "Acknowledged";
}

function shouldShowActiveRequest(request: OriginatorRequest, now: number): boolean {
  if (!isAcknowledged(request)) {
    return true;
  }

  const acknowledgedAt = request.acknowledgedAt?.getTime();
  if (!acknowledgedAt) {
    return true;
  }

  return now - acknowledgedAt <= acknowledgedRetentionMs;
}

function mergeVisibleRequests(incoming: OriginatorRequest[], current: OriginatorRequest[], now: number): OriginatorRequest[] {
  const incomingIds = new Set(incoming.map((request) => request.requestId));
  const retained = current.filter((request) => !incomingIds.has(request.requestId) && isAcknowledged(request) && shouldShowActiveRequest(request, now));
  return [...incoming, ...retained];
}

function statusLabel(status: string): string {
  switch (status) {
    case "Promoted":
      return "Sent - awaiting acknowledgement";
    case "Validating":
      return "Validating";
    case "Received":
      return "Received by intake";
    default:
      return status;
  }
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}


