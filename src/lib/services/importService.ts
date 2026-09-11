import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Person, WorkerType, EmploymentStatusType } from '@/types/database';
import { ColumnMapping, ImportValidationRow, ImportResult } from '@/types/domain';
import { hrmsStore } from './store';
import { parseISO, isValid } from 'date-fns';

export const importService = {
  async parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
    const isCsv = file.name.endsWith('.csv');

    if (isCsv) {
      return new Promise((resolve, reject) => {
        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = results.meta.fields || [];
            resolve({ headers, rows: results.data });
          },
          error: (err) => reject(err),
        });
      });
    } else {
      // Excel parse
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { header: 1 });

      if (data.length === 0) return { headers: [], rows: [] };

      const headers = (data[0] as unknown as string[]).map((h) => String(h || '').trim());
      const rows: Record<string, string>[] = [];

      for (let i = 1; i < data.length; i++) {
        const rowData = data[i] as unknown as string[];
        if (!rowData || rowData.length === 0) continue;
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = rowData[idx] !== undefined ? String(rowData[idx]).trim() : '';
        });
        rows.push(rowObj);
      }

      return { headers, rows };
    }
  },

  getSmartInitialMappings(headers: string[]): ColumnMapping[] {
    const targetFields = [
      { key: 'full_name', label: 'Full Name', required: true, aliases: ['name', 'full name', 'employee name', 'fullname'] },
      { key: 'work_email', label: 'Work Email', required: true, aliases: ['email', 'work email', 'work email address', 'email address'] },
      { key: 'phone', label: 'Phone Number', required: true, aliases: ['phone', 'mobile', 'contact', 'telephone', 'phone number'] },
      { key: 'worker_type', label: 'Worker Type (employee/intern/contractor)', required: true, aliases: ['type', 'worker type', 'employment type', 'role type'] },
      { key: 'department_name', label: 'Department', required: true, aliases: ['dept', 'department', 'department name', 'team'] },
      { key: 'designation_name', label: 'Designation / Job Title', required: true, aliases: ['designation', 'title', 'role', 'position', 'job title'] },
      { key: 'joining_date', label: 'Joining Date (YYYY-MM-DD)', required: true, aliases: ['joining date', 'doj', 'start date', 'hire date'] },
      { key: 'person_code', label: 'Person / Employee Code', required: false, aliases: ['id', 'emp id', 'employee id', 'person id', 'code'] },
      { key: 'work_location', label: 'Work Location', required: false, aliases: ['location', 'office', 'city', 'work location'] },
      { key: 'remote_status', label: 'Remote Status (office/hybrid/remote)', required: false, aliases: ['remote', 'work mode', 'remote status'] },
    ];

    return targetFields.map((tf) => {
      const match = headers.find((h) => {
        const clean = h.toLowerCase().trim();
        return tf.aliases.includes(clean) || clean === tf.key;
      });

      return {
        csvHeader: match || '',
        targetField: tf.key,
        required: tf.required,
      };
    });
  },

  validateRows(rows: Record<string, string>[], mappings: ColumnMapping[]): ImportValidationRow[] {
    const existingPersons = hrmsStore.getPersons();
    const existingCodes = new Set(existingPersons.map((p) => p.person_code.toLowerCase()));
    const existingEmails = new Set(existingPersons.map((p) => p.work_email.toLowerCase()));

    const mappingMap = new Map<string, string>();
    mappings.forEach((m) => {
      if (m.csvHeader) {
        mappingMap.set(m.targetField, m.csvHeader);
      }
    });

    const validWorkerTypes: WorkerType[] = ['employee', 'intern', 'consultant', 'contractor', 'other'];

    return rows.map((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const mapped: Partial<Person> & { department_name?: string; designation_name?: string } = {};

      const fullName = row[mappingMap.get('full_name') || '']?.trim();
      const email = row[mappingMap.get('work_email') || '']?.trim();
      const phone = row[mappingMap.get('phone') || '']?.trim();
      const rawWorkerType = row[mappingMap.get('worker_type') || '']?.trim().toLowerCase();
      const deptName = row[mappingMap.get('department_name') || '']?.trim();
      const desigName = row[mappingMap.get('designation_name') || '']?.trim();
      const joiningDate = row[mappingMap.get('joining_date') || '']?.trim();
      const personCode = row[mappingMap.get('person_code') || '']?.trim();
      const location = row[mappingMap.get('work_location') || '']?.trim() || 'San Francisco HQ';
      const remote = (row[mappingMap.get('remote_status') || '']?.trim().toLowerCase() as 'office' | 'hybrid' | 'remote') || 'office';

      // 1. Full name check
      if (!fullName) {
        errors.push('Missing Full Name');
      } else {
        mapped.full_name = fullName;
      }

      // 2. Email check
      if (!email) {
        errors.push('Missing Work Email');
      } else if (!email.includes('@') || !email.includes('.')) {
        errors.push(`Invalid email format: ${email}`);
      } else if (existingEmails.has(email.toLowerCase())) {
        errors.push(`Email already exists in HR records: ${email}`);
      } else {
        mapped.work_email = email;
      }

      // 3. Phone check
      if (!phone) {
        errors.push('Missing Phone Number');
      } else {
        mapped.phone = phone;
      }

      // 4. Worker type
      let workerType: WorkerType = 'employee';
      if (!rawWorkerType) {
        errors.push('Missing Worker Type (employee, intern, contractor)');
      } else if (!validWorkerTypes.includes(rawWorkerType as WorkerType)) {
        warnings.push(`Unrecognized worker type "${rawWorkerType}", defaulted to employee`);
      } else {
        workerType = rawWorkerType as WorkerType;
      }
      mapped.worker_type = workerType;

      // 5. Joining date check
      if (!joiningDate) {
        errors.push('Missing Joining Date');
      } else {
        try {
          const parsed = parseISO(joiningDate);
          if (!isValid(parsed)) {
            errors.push(`Invalid date format for joining date: ${joiningDate}`);
          } else {
            mapped.joining_date = joiningDate;
          }
        } catch {
          errors.push(`Invalid date format for joining date: ${joiningDate}`);
        }
      }

      // 6. Person Code check
      if (personCode) {
        if (existingCodes.has(personCode.toLowerCase())) {
          errors.push(`Person Code already in use: ${personCode}`);
        } else {
          mapped.person_code = personCode;
        }
      }

      mapped.work_location = location;
      mapped.remote_status = ['office', 'hybrid', 'remote'].includes(remote) ? remote : 'office';
      mapped.department_name = deptName || 'General';
      mapped.designation_name = desigName || 'Team Member';
      mapped.current_status = workerType === 'intern' ? 'intern_active' : 'active';

      return {
        rowIndex: index + 1,
        rawRow: row,
        mappedData: mapped as Partial<Person>,
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    });
  },

  commitImport(validRows: ImportValidationRow[], actorName: string = 'HR Admin'): ImportResult {
    const depts = hrmsStore.getDepartments();
    const desigs = hrmsStore.getDesignations();
    const importedPersons: Person[] = [];

    validRows.forEach((vr) => {
      if (!vr.isValid) return;

      const data = vr.mappedData as Partial<Person> & { department_name?: string; designation_name?: string };

      // Find or create department
      let dept = depts.find((d) => d.name.toLowerCase() === (data.department_name || '').toLowerCase());
      if (!dept && data.department_name) {
        dept = hrmsStore.addDepartment({
          name: data.department_name,
          code: data.department_name.substring(0, 3).toUpperCase(),
          is_active: true,
          sort_order: depts.length + 1,
        });
      }

      // Find or create designation
      let desig = desigs.find((d) => d.name.toLowerCase() === (data.designation_name || '').toLowerCase());
      if (!desig && data.designation_name) {
        desig = hrmsStore.addDesignation({
          name: data.designation_name,
          department_id: dept?.id || null,
          is_active: true,
        });
      }

      const created = hrmsStore.addPerson(
        {
          person_code: data.person_code || '',
          full_name: data.full_name || '',
          work_email: data.work_email || '',
          phone: data.phone || '',
          worker_type: data.worker_type || 'employee',
          work_location: data.work_location || 'San Francisco HQ',
          remote_status: data.remote_status || 'office',
          joining_date: data.joining_date || new Date().toISOString().split('T')[0],
          current_status: (data.worker_type === 'intern' ? 'intern_active' : 'active') as EmploymentStatusType,
          is_active: true,
          department_id: dept?.id,
          designation_id: desig?.id,
          employment_type_id: data.worker_type === 'intern' ? 'empt-2' : 'empt-1',
        },
        actorName
      );

      importedPersons.push(created);
    });

    hrmsStore.addAuditLog({
      actor_name: actorName,
      entity_type: 'person',
      entity_id: 'batch-import',
      action: 'import',
      reason: `Batch imported ${importedPersons.length} employee records from spreadsheet`,
    });

    return {
      totalRows: validRows.length,
      successCount: importedPersons.length,
      errorCount: validRows.length - importedPersons.length,
      importedPersons,
      validationRows: validRows,
    };
  }
};
