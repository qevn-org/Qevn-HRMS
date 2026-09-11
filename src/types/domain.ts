import { Person, AttendanceRecord, LeaveRequest, DocumentRecord, OnboardingTask, WorkerType, EmploymentStatusType, AttendanceStatusType, LeaveRequestStatusType } from './database';

export interface DashboardMetrics {
  totalActivePeople: number;
  activeEmployees: number;
  activeInterns: number;
  activeContractors: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  wfhToday: number;
  halfDayToday: number;
  unmarkedToday: number;
  newJoinersThisMonth: number;
  upcomingProbationCount: number;
  upcomingInternshipCompletions: number;
  pendingLeaveApprovals: number;
  missingDocumentsCount: number;
  expiringDocumentsCount: number;
  upcomingExitsCount: number;
}

export interface PeopleFilterOptions {
  searchQuery: string;
  workerType?: WorkerType | 'all';
  departmentId?: string | 'all';
  managerId?: string | 'all';
  employmentStatus?: EmploymentStatusType | 'all';
  workLocation?: string | 'all';
  remoteStatus?: string | 'all';
}

export interface AttendanceFilterOptions {
  date: string;
  departmentId?: string | 'all';
  status?: AttendanceStatusType | 'all';
  searchQuery: string;
}

export interface LeaveFilterOptions {
  status?: LeaveRequestStatusType | 'all';
  leaveTypeId?: string | 'all';
  departmentId?: string | 'all';
  personId?: string | 'all';
  startDate?: string;
  endDate?: string;
}

export interface DocumentFilterOptions {
  category?: string | 'all';
  personId?: string | 'all';
  requiredOnly?: boolean;
  expiringOnly?: boolean;
  missingOnly?: boolean;
  searchQuery: string;
}

export interface ColumnMapping {
  csvHeader: string;
  targetField: string;
  required: boolean;
  sampleValue?: string;
}

export interface ImportValidationRow {
  rowIndex: number;
  rawRow: Record<string, string>;
  mappedData: Partial<Person> & { department_name?: string; designation_name?: string };
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  importedPersons: Person[];
  validationRows: ImportValidationRow[];
}

export interface ExportReportOptions {
  reportType: 'headcount' | 'attendance' | 'leave' | 'compliance' | 'probation' | 'interns' | 'exits';
  format: 'csv' | 'xlsx' | 'pdf';
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  workerType?: string;
  title: string;
}
