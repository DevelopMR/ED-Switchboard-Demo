import { SwDrawerCountState } from "../../models/SwDrawerCountState";
import { SharePointListItemRecord } from "./ISharePointListClient";

export function mapDrawerCountStateFromFieldValue(value: unknown): SwDrawerCountState {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { boxes: [{ slot: 1 }, { slot: 2 }, { slot: 3 }, { slot: 4 }] };
  }

  try {
    const parsed = JSON.parse(value) as SwDrawerCountState;
    if (!parsed || !Array.isArray(parsed.boxes)) {
      return { boxes: [{ slot: 1 }, { slot: 2 }, { slot: 3 }, { slot: 4 }] };
    }

    return {
      boxes: parsed.boxes.map((box, index) => ({
        slot: typeof box.slot === "number" ? box.slot : index + 1,
        countedAt: typeof box.countedAt === "string" ? box.countedAt : undefined,
        countedBy: typeof box.countedBy === "string" ? box.countedBy : undefined
      }))
    };
  } catch {
    return { boxes: [{ slot: 1 }, { slot: 2 }, { slot: 3 }, { slot: 4 }] };
  }
}

export function mapDrawerCountStateToFieldValue(state: SwDrawerCountState): string {
  return JSON.stringify(state);
}

export function getExistingShellStateItemId(records: SharePointListItemRecord[]): number | undefined {
  const itemId = records[0]?.Id;
  return typeof itemId === "number" ? itemId : undefined;
}
