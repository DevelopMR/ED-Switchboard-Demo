import { SwDailyNoteItem } from "../../models/SwDailyNoteItem";
import { SwSearchQuery } from "../../models/SwSearchQuery";
import { IShellSearchService } from "../contracts/IShellSearchService";
import { ISwDailyNotesService } from "../contracts/ISwDailyNotesService";

export class ShellSearchService implements IShellSearchService {
  public constructor(private readonly notesService: ISwDailyNotesService) {}

  public async search(query: SwSearchQuery): Promise<SwDailyNoteItem[]> {
    return this.notesService.searchNotes(query);
  }
}
