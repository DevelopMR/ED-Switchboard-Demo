import * as React from "react";
import { SwDailyNoteCategory } from "../../models/SwDailyNoteCategory";
import { CreateManualNoteInput } from "../../hooks/useDailyNotesState";

export interface DailyNotesEntryDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateManualNoteInput) => Promise<void>;
}

export function DailyNotesEntryDialog(props: DailyNotesEntryDialogProps): JSX.Element | null {
  const [title, setTitle] = React.useState<string>("");
  const [summary, setSummary] = React.useState<string>("");
  const [details, setDetails] = React.useState<string>("");
  const [entryType, setEntryType] = React.useState<SwDailyNoteCategory>(SwDailyNoteCategory.GeneralNote);

  React.useEffect(() => {
    if (!props.isOpen) {
      setTitle("");
      setSummary("");
      setDetails("");
      setEntryType(SwDailyNoteCategory.GeneralNote);
    }
  }, [props.isOpen]);

  if (!props.isOpen) {
    return null;
  }

  const handleSubmit = async (): Promise<void> => {
    await props.onSubmit({
      title,
      summary,
      details,
      entryType
    });
  };

  return (
    <div className="swDialogBackdrop" role="dialog" aria-modal="true" aria-label="Add manual note">
      <div className="swDialogFrame">
        <h3>Add Manual Note</h3>
        <label className="swDialogField">
          <span>Category</span>
          <select value={entryType} onChange={(event) => setEntryType(event.currentTarget.value as SwDailyNoteCategory)}>
            <option value={SwDailyNoteCategory.GeneralNote}>General Note</option>
            <option value={SwDailyNoteCategory.CodeAlert}>Code Alert</option>
            <option value={SwDailyNoteCategory.AlarmPanel}>Alarm Panel</option>
            <option value={SwDailyNoteCategory.Paging}>Paging</option>
            <option value={SwDailyNoteCategory.OrCallIn}>OR Call-In</option>
            <option value={SwDailyNoteCategory.Dui}>DUI</option>
            <option value={SwDailyNoteCategory.Other}>Other</option>
          </select>
        </label>
        <label className="swDialogField">
          <span>Title</span>
          <input type="text" value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
        </label>
        <label className="swDialogField">
          <span>Summary</span>
          <textarea rows={3} value={summary} onChange={(event) => setSummary(event.currentTarget.value)} />
        </label>
        <label className="swDialogField">
          <span>Details</span>
          <textarea rows={5} value={details} onChange={(event) => setDetails(event.currentTarget.value)} />
        </label>
        <div className="swDialogActions">
          <button type="button" onClick={props.onCancel}>
            Cancel
          </button>
          <button type="button" onClick={() => void handleSubmit()} disabled={!title.trim() || !summary.trim()}>
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
