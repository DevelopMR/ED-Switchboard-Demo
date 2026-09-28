export const OrCallInFields = {
  Parent: {
    CallInId: "OrCallInId",
    Date: "OrDate",
    TimeContacted: "OrTimeContacted",
    AodName: "OrAodName",
    Procedure: "OrProcedure",
    Surgeon: "OrSurgeon",
    SurgeryDateTime: "OrSurgeryDateTime",
    SurgeryStatus: "OrSurgeryStatus",
    CovidStatus: "OrCovidStatus",
    CArmRequired: "OrCArmRequired",
    RadiologyContactedTime: "OrRadiologyContactedTime",
    AodCallbackTime: "OrAodCallbackTime",
    OperatorInitials: "OrOperatorInitials",
    CallInScript: "OrCallInScript",
    Status: "OrStatus",
    DailyNoteId: "OrDailyNoteId",
    Notes: "OrNotes",
    TeamCallInNotes: "OrTeamCallInNotes"
  },
  Contact: {
    CallInId: "OrCallInId",
    Role: "OrRole",
    StaffName: "OrStaffName",
    PhoneOne: "OrPhoneOne",
    PhoneTwo: "OrPhoneTwo",
    TimeContacted: "OrTimeContacted",
    ContactNotes: "OrContactNotes",
    SortOrder: "OrSortOrder",
    Required: "OrRequired",
    Completed: "OrCompleted",
    AodCalledAnesth: "OrAODCalledAnesth",
    AodCalledAnesthAt: "OrAODCalledAnesthAt"
  },
  Roster: {
    Role: "OrRole",
    StaffName: "OrStaffName",
    PhoneOne: "OrPhoneOne",
    PhoneTwo: "OrPhoneTwo",
    OnCallStart: "OrOnCallStart",
    OnCallEnd: "OrOnCallEnd",
    IsActive: "OrIsActive",
    DefaultNotes: "OrDefaultNotes",
    SortOrder: "OrSortOrder",
    RequiredByDefault: "OrRequiredByDefault"
  }
} as const;
