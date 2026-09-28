import * as React from "react";
import { SwDailyNoteCategory } from "../models/SwDailyNoteCategory";
import { SwDailyNoteItem } from "../models/SwDailyNoteItem";
import { SwDrawerCountState } from "../models/SwDrawerCountState";
import { ISwDailyNotesService } from "../services/contracts/ISwDailyNotesService";
import { ISwDrawerCountService } from "../services/contracts/ISwDrawerCountService";
import { addDaysToIsoDate, getTodayIsoDate } from "../utils/dateMath";

export interface UseDailyNotesStateArgs {
  notesService: ISwDailyNotesService;
  drawerCountService: ISwDrawerCountService;
  currentUserName: string;
}

export interface CreateManualNoteInput {
  title: string;
  summary: string;
  details?: string;
  entryType: SwDailyNoteCategory;
}

export interface CreateModuleNoteInput extends CreateManualNoteInput {
  sourceModule: string;
  sourceItemId?: string;
  locationText?: string;
}

export interface UseDailyNotesStateResult {
  selectedDate: string;
  notes: SwDailyNoteItem[];
  visibleNotes: SwDailyNoteItem[];
  drawerState: SwDrawerCountState;
  searchText: string;
  isEntryDialogOpen: boolean;
  setSearchText: (value: string) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  openEntryDialog: () => void;
  closeEntryDialog: () => void;
  createManualNote: (input: CreateManualNoteInput) => Promise<void>;
  createModuleNote: (input: CreateModuleNoteInput) => Promise<void>;
  toggleDrawerSlot: (slot: number, currentUserName: string) => Promise<void>;
}

export function useDailyNotesState(args: UseDailyNotesStateArgs): UseDailyNotesStateResult {
  const [selectedDate, setSelectedDate] = React.useState<string>(getTodayIsoDate());
  const [notes, setNotes] = React.useState<SwDailyNoteItem[]>([]);
  const [drawerState, setDrawerState] = React.useState<SwDrawerCountState>({ boxes: [] });
  const [searchText, setSearchText] = React.useState<string>("");
  const [isEntryDialogOpen, setIsEntryDialogOpen] = React.useState<boolean>(false);
  const createdModuleNoteKeysRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    void args.notesService.getNotesByDate(selectedDate).then(setNotes);
    void args.drawerCountService.getDrawerCountState(selectedDate).then(setDrawerState);
  }, [args.drawerCountService, args.notesService, selectedDate]);

  const visibleNotes = React.useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) {
      return notes;
    }

    return notes.filter((note) => {
      return (
        note.title.toLowerCase().includes(text) ||
        note.summary.toLowerCase().includes(text) ||
        (note.details ?? "").toLowerCase().includes(text) ||
        (note.searchText ?? "").toLowerCase().includes(text)
      );
    });
  }, [notes, searchText]);

  const createNote = React.useCallback(
    async (input: CreateModuleNoteInput): Promise<void> => {
      const moduleNoteKey = input.sourceItemId ? `${input.sourceModule}:${input.sourceItemId}` : undefined;
      if (
        moduleNoteKey &&
        (createdModuleNoteKeysRef.current.has(moduleNoteKey) ||
          notes.some((note) => note.sourceModule === input.sourceModule && note.sourceItemId === input.sourceItemId))
      ) {
        return;
      }

      if (moduleNoteKey) {
        createdModuleNoteKeysRef.current.add(moduleNoteKey);
      }

      const now = new Date();
      const note: SwDailyNoteItem = {
        id: `SWN-${now.getTime()}`,
        logDate: selectedDate,
        eventTime: now.toISOString(),
        entryType: input.entryType,
        title: input.title.trim(),
        summary: input.summary.trim(),
        details: input.details?.trim(),
        sourceModule: input.sourceModule,
        sourceItemId: input.sourceItemId,
        locationText: input.locationText,
        operatorName: args.currentUserName,
        searchText: `${input.title} ${input.summary} ${input.details ?? ""}`.trim().toLowerCase()
      };

      try {
        const created = await args.notesService.createNote(note);
        setNotes((current) => [created, ...current]);
      } catch (error) {
        if (moduleNoteKey) {
          createdModuleNoteKeysRef.current.delete(moduleNoteKey);
        }

        throw error;
      }
    },
    [args.currentUserName, args.notesService, notes, selectedDate]
  );

  const createManualNote = React.useCallback(
    async (input: CreateManualNoteInput): Promise<void> => {
      await createNote({
        ...input,
        sourceModule: "Manual"
      });
      setIsEntryDialogOpen(false);
    },
    [createNote]
  );

  const toggleDrawerSlot = React.useCallback(
    async (slot: number, currentUserName: string): Promise<void> => {
      const nextState: SwDrawerCountState = {
        boxes: drawerState.boxes.map((box) => {
          if (box.slot !== slot) {
            return box;
          }

          if (box.countedAt) {
            return { slot: box.slot };
          }

          return {
            slot: box.slot,
            countedAt: new Date().toISOString(),
            countedBy: currentUserName
          };
        })
      };

      const saved = await args.drawerCountService.saveDrawerCountState(selectedDate, nextState);
      setDrawerState(saved);
    },
    [args.drawerCountService, drawerState.boxes, selectedDate]
  );

  return {
    selectedDate,
    notes,
    visibleNotes,
    drawerState,
    searchText,
    isEntryDialogOpen,
    setSearchText,
    goToToday: () => setSelectedDate(getTodayIsoDate()),
    goToPreviousDay: () => setSelectedDate((current) => addDaysToIsoDate(current, -1)),
    goToNextDay: () => setSelectedDate((current) => addDaysToIsoDate(current, 1)),
    openEntryDialog: () => setIsEntryDialogOpen(true),
    closeEntryDialog: () => setIsEntryDialogOpen(false),
    createManualNote,
    createModuleNote: createNote,
    toggleDrawerSlot
  };
}
