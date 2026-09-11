import { hrmsStore } from '../services/store';
import { leaveService } from '../services/leaveService';
import { attendanceService } from '../services/attendanceService';
import { documentService } from '../services/documentService';
import { importService } from '../services/importService';
import { peopleService } from '../services/peopleService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

console.log('--- STARTING QEVN HRMS DOMAIN ENGINE TESTS ---');

// Test 1: Store Initialization & Seed Data Integrity
const persons = peopleService.getAllPersons();
assert(persons.length >= 20, `Seed data contains ${persons.length} active personas`);
assert(persons.some((p) => p.worker_type === 'employee'), 'Contains full-time employees');
assert(persons.some((p) => p.worker_type === 'intern'), 'Contains intern cohort personas');
assert(persons.some((p) => p.worker_type === 'contractor' || p.worker_type === 'consultant'), 'Contains contractor/consultants');

// Test 2: Leave Duration Calculator (Excluding Weekends & Holidays)
// Friday 2026-09-18 to Tuesday 2026-09-22 (Fri, Mon, Tue = 3 working days, Sat/Sun excluded)
const workingDays = leaveService.calculateWorkingDays('2026-09-18', '2026-09-22', false);
assert(workingDays === 3, `Calculated 3 working days for Fri-Tue span (excluding Sat & Sun), got: ${workingDays}`);

// Half day calculation
const halfDayDuration = leaveService.calculateWorkingDays('2026-09-18', '2026-09-18', true);
assert(halfDayDuration === 0.5, `Half day calculates to 0.5 days`);

// Test 3: Leave Request Submission & Automatic Attendance Synchronization on Approval
const testPerson = persons[0];
const newLeaveReq = leaveService.submitRequest({
  person_id: testPerson.id,
  leave_type_id: 'lt-1',
  start_date: '2026-10-12', // Monday
  end_date: '2026-10-13',   // Tuesday
  duration_days: 2,
  is_half_day: false,
  reason: 'Automated Test Annual Leave',
});

assert(newLeaveReq.status === 'pending', 'Submitted leave request has status pending');

// Approve request -> Verify automatic attendance sync
leaveService.approveRequest(newLeaveReq.id, 'Approved via automated test', 'Test Manager');
const attOnLeaveDate1 = hrmsStore.getAttendance('2026-10-12', testPerson.id);
const attOnLeaveDate2 = hrmsStore.getAttendance('2026-10-13', testPerson.id);

assert(attOnLeaveDate1.length > 0 && attOnLeaveDate1[0].status === 'leave', 'Approved leave automatically stamped attendance as "leave" on 2026-10-12');
assert(attOnLeaveDate2.length > 0 && attOnLeaveDate2[0].status === 'leave', 'Approved leave automatically stamped attendance as "leave" on 2026-10-13');

// Test 4: Document Compliance Matrix
const complianceMatrix = documentService.getComplianceMatrix();
assert(complianceMatrix.length > 0, `Generated compliance matrix for ${complianceMatrix.length} people`);
const sampleComp = complianceMatrix[0];
assert(typeof sampleComp.completionPercentage === 'number', `Calculated completion percentage: ${sampleComp.completionPercentage}%`);

// Test 5: Spreadsheet Import Validation Engine
const sampleHeaders = ['Full Name', 'Work Email', 'Phone', 'Worker Type', 'Department', 'Designation', 'Joining Date'];
const mappings = importService.getSmartInitialMappings(sampleHeaders);
assert(mappings.find((m) => m.targetField === 'full_name')?.csvHeader === 'Full Name', 'Smart mapping detected Full Name header');
assert(mappings.find((m) => m.targetField === 'work_email')?.csvHeader === 'Work Email', 'Smart mapping detected Work Email header');

const rawRows = [
  {
    'Full Name': 'Taro Yamada',
    'Work Email': 'taro.yamada@qevn.io',
    Phone: '+81 90 9999 8888',
    'Worker Type': 'employee',
    Department: 'Engineering & Tech',
    Designation: 'Senior Backend Engineer',
    'Joining Date': '2026-09-01',
  },
  {
    'Full Name': '', // Invalid row: missing name
    'Work Email': 'bad-email-no-at',
    Phone: '',
    'Worker Type': 'invalid-type',
    Department: '',
    Designation: '',
    'Joining Date': 'invalid-date',
  },
];

const validationResult = importService.validateRows(rawRows, mappings);
assert(validationResult[0].isValid === true, 'Valid employee row passes validation');
assert(validationResult[1].isValid === false, 'Invalid employee row is flagged with errors');
assert(validationResult[1].errors.length >= 3, `Invalid row caught ${validationResult[1].errors.length} validation errors`);

// Test 6: Audited Attendance Correction
const correctedAtt = attendanceService.correctAttendance(
  'att-1',
  testPerson.id,
  '2026-09-11',
  'present',
  'Misplaced punch corrected during standup',
  'Approved by manager'
);

assert(correctedAtt.corrected === true, 'Attendance record marked as corrected');
const auditLogs = hrmsStore.getAuditLogs();
const latestAudit = auditLogs[0];
assert(latestAudit.entity_type === 'attendance' && latestAudit.action === 'correct', 'Audit log automatically recorded for attendance correction with reason');

console.log('\n🎉 ALL QEVN HRMS CORE VERIFICATION TESTS PASSED SUCCESSFULLY!');
