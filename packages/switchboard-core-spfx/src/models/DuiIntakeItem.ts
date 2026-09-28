export interface DuiIntakeItem {
  id: string;
  title: string;
  intakeId: string;
  intakeDate: string;
  dob: string;
  ssn: string;
  nameLastFirst: string;
  policeDepartment: string;
  policeOfficer: string;
  policeIncidentNumber: string;
  registrationNumber: string;
  securityNotified: boolean;
  securityNotifiedAt?: string;
  labNotified: boolean;
  labNotifiedAt?: string;
  registered: boolean;
  registeredAt?: string;
  notes?: string;
  dailyNoteId?: string;
}
