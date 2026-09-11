'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { importService } from '@/lib/services/importService';
import { ColumnMapping, ImportValidationRow, ImportResult } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Users,
} from 'lucide-react';

export default function SpreadsheetImportPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationRows, setValidationRows] = useState<ImportValidationRow[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle File Upload or Load Sample
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    try {
      setIsProcessing(true);
      setFile(uploadedFile);
      const parsed = await importService.parseFile(uploadedFile);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);
      const smartMappings = importService.getSmartInitialMappings(parsed.headers);
      setMappings(smartMappings);
      setStep(2);
      toast.success(`Parsed ${parsed.rows.length} rows and ${parsed.headers.length} columns`);
    } catch {
      toast.error('Failed to parse spreadsheet. Please ensure CSV or XLSX format.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Load Built-in Demo Spreadsheet
  const handleLoadSampleSheet = () => {
    const sampleCsv = `Full Name,Work Email,Phone,Worker Type,Department,Designation,Joining Date,Person Code,Work Location,Remote Status
Kenji Sato,kenji.sato@qevn.io,+81 90 5555 1111,employee,Engineering & Tech,Full Stack Engineer,2026-09-01,QEVN-021,Tokyo Hub,hybrid
Ananya Roy,ananya.roy@qevn.io,+91 98765 11223,intern,Product & Design,UX Research Intern,2026-09-01,QEVN-022,Bangalore Tech Center,office
Liam Gallagher,liam.gallagher@qevn.io,+44 7700 112233,contractor,Engineering & Tech,DevOps Contractor,2026-08-15,QEVN-023,London Hub,remote
Soraya Haddad,soraya.haddad@qevn.io,+971 50 888 7777,employee,Sales & Growth,Account Executive,2026-09-10,QEVN-024,Dubai Tech Hub,hybrid`;

    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const sampleFile = new File([blob], 'sample_qevn_employees.csv', { type: 'text/csv' });

    importService.parseFile(sampleFile).then((parsed) => {
      setFile(sampleFile);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);
      const smartMappings = importService.getSmartInitialMappings(parsed.headers);
      setMappings(smartMappings);
      setStep(2);
      toast.success('Loaded sample migration spreadsheet with 4 employee rows');
    });
  };

  // Step 2 -> Step 3: Run Validation
  const handleProceedToValidation = () => {
    const missingRequired = mappings.filter((m) => m.required && !m.csvHeader);
    if (missingRequired.length > 0) {
      toast.error(`Please map required fields: ${missingRequired.map((m) => m.targetField).join(', ')}`);
      return;
    }

    const validated = importService.validateRows(rawRows, mappings);
    setValidationRows(validated);
    setStep(3);
  };

  // Step 3 -> Step 4: Commit Batch Import
  const handleCommitImport = () => {
    const validCount = validationRows.filter((r) => r.isValid).length;
    if (validCount === 0) {
      toast.error('No valid rows to import. Please resolve validation errors.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = importService.commitImport(validationRows, user.display_name);
      setImportResult(result);
      setStep(4);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      toast.success(`Successfully imported ${result.successCount} master employee records!`);
    } catch {
      toast.error('Failed to commit batch import');
    } finally {
      setIsProcessing(false);
    }
  };

  const validRowCount = validationRows.filter((r) => r.isValid).length;
  const errorRowCount = validationRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="sticker-tag bg-[#FFDE59] text-black">
            MIGRATION ENGINE
          </span>
          <span className="sticker-tag bg-[#00D06C] text-black">
            CSV & XLSX
          </span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
          SPREADSHEET EMPLOYEE IMPORT WIZARD
        </h1>
        <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
          Migrate existing employee spreadsheets into QEVN HRMS with column mapping and strict validation.
        </p>

        {/* Wizard Steps Tracker */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          {[
            { num: 1, label: 'Upload Sheet' },
            { num: 2, label: 'Map Columns' },
            { num: 3, label: 'Validate & Preview' },
            { num: 4, label: 'Commit & Done' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 border-2 border-black flex items-center justify-between ${
                step === s.num
                  ? 'bg-[#00D06C] text-black font-black shadow-neo-sm'
                  : step > s.num
                  ? 'bg-[#FAF7EE] text-black font-bold'
                  : 'bg-white text-zinc-500'
              }`}
            >
              <span>{s.num}. {s.label}</span>
              {step > s.num && <CheckCircle2 className="w-4 h-4 text-black font-black" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <div className="bg-white border-3 border-black shadow-neo p-8 text-center space-y-6">
          <div className="border-3 border-dashed border-black hover:bg-[#FFFDF5] p-10 transition-colors bg-[#FAF7EE] flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#FFDE59] border-3 border-black flex items-center justify-center text-black mb-4 shadow-neo-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-mono text-base font-black text-black uppercase">
              SELECT CSV OR EXCEL (.XLSX) EMPLOYEE SHEET
            </h3>
            <p className="text-xs text-zinc-700 max-w-md mt-1 font-sans font-medium">
              Upload your legacy employee master sheet to begin column mapping and automatic ID allocation.
            </p>

            <label className="mt-5 inline-block cursor-pointer">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="green" size="md" className="pointer-events-none">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> BROWSE FILE TO UPLOAD
              </Button>
            </label>
          </div>

          <div className="p-4 bg-[#FAF7EE] border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <div className="font-mono text-xs font-black text-black uppercase">
                NEED A TEST FILE?
              </div>
              <div className="text-[11px] text-zinc-600 font-sans font-medium">
                Load our verified 4-person multi-department sample dataset immediately.
              </div>
            </div>
            <Button variant="purple" size="sm" onClick={handleLoadSampleSheet}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> LOAD DEMO SPREADSHEET
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <div className="bg-white border-3 border-black shadow-neo p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                MAP SPREADSHEET HEADERS TO QEVN HRMS FIELDS
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">File: {file?.name} ({rawRows.length} rows detected)</p>
            </div>
          </div>

          <div className="space-y-3">
            {mappings.map((mapping, idx) => (
              <div
                key={mapping.targetField}
                className="p-3.5 bg-[#FAF7EE] border-2 border-black shadow-neo-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div className="flex-1">
                  <div className="text-black font-black uppercase flex items-center gap-1.5">
                    <span>{mapping.targetField.replace(/_/g, ' ')}</span>
                    {mapping.required && <span className="text-[#FF4365]">*</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <span className="text-zinc-600 font-bold text-[11px] hidden sm:inline">MAPS TO &rarr;</span>
                  <select
                    value={mapping.csvHeader}
                    onChange={(e) => {
                      const updated = [...mappings];
                      updated[idx].csvHeader = e.target.value;
                      setMappings(updated);
                    }}
                    className="w-full bg-white border-2 border-black text-black p-2 font-mono text-xs font-bold focus:outline-hidden"
                  >
                    <option value="">-- Ignore / Not Mapped --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t-2 border-black flex items-center justify-between">
            <Button variant="white" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="green" size="sm" onClick={handleProceedToValidation}>
              VALIDATE {rawRows.length} ROWS & PREVIEW <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: VALIDATION & PREVIEW */}
      {step === 3 && (
        <div className="bg-white border-3 border-black shadow-neo p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                ROW VALIDATION PREVIEW & CONFLICT DETECTION
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">Review validation rules before writing to master database</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <Badge variant="green">{validRowCount} VALID ROWS</Badge>
              {errorRowCount > 0 && <Badge variant="rose">{errorRowCount} ERRORS</Badge>}
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 border-2 border-black bg-[#FCFAF5]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAF7EE] border-b-2 border-black text-black uppercase font-black sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3 border-r border-black/20">ROW</th>
                  <th className="py-2.5 px-3 border-r border-black/20">FULL NAME</th>
                  <th className="py-2.5 px-3 border-r border-black/20">WORK EMAIL</th>
                  <th className="py-2.5 px-3 border-r border-black/20">WORKER TYPE</th>
                  <th className="py-2.5 px-3 border-r border-black/20">DEPARTMENT</th>
                  <th className="py-2.5 px-3 border-r border-black/20">STATUS</th>
                  <th className="py-2.5 px-3">VALIDATION ISSUES</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {validationRows.map((vr) => (
                  <tr
                    key={vr.rowIndex}
                    className={vr.isValid ? 'hover:bg-[#FFFDF5]' : 'bg-[#FFF0F3] text-black'}
                  >
                    <td className="py-2.5 px-3 font-black border-r border-black/10">{vr.rowIndex}</td>
                    <td className="py-2.5 px-3 font-black text-black border-r border-black/10">{vr.mappedData.full_name || '—'}</td>
                    <td className="py-2.5 px-3 text-zinc-700 font-bold border-r border-black/10">{vr.mappedData.work_email || '—'}</td>
                    <td className="py-2.5 px-3 uppercase font-bold border-r border-black/10">{vr.mappedData.worker_type || '—'}</td>
                    <td className="py-2.5 px-3 border-r border-black/10">{vr.mappedData.department_name || '—'}</td>
                    <td className="py-2.5 px-3 border-r border-black/10">
                      <Badge variant={vr.isValid ? 'green' : 'rose'}>
                        {vr.isValid ? 'READY' : 'ERROR'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-bold">
                      {vr.errors.length > 0 && (
                        <div className="text-[#FF4365] font-black">{vr.errors.join('; ')}</div>
                      )}
                      {vr.warnings.length > 0 && (
                        <div className="text-[#8B5CF6] font-bold">{vr.warnings.join('; ')}</div>
                      )}
                      {vr.isValid && <span className="text-[#00D06C] font-black">All checks passed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t-2 border-black flex items-center justify-between">
            <Button variant="white" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Re-map Columns
            </Button>
            <Button
              variant="green"
              size="sm"
              disabled={validRowCount === 0}
              onClick={handleCommitImport}
            >
              COMMIT & IMPORT {validRowCount} RECORDS <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: IMPORT COMPLETED */}
      {step === 4 && importResult && (
        <div className="bg-white border-3 border-black shadow-neo-lg p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#00D06C] border-3 border-black mx-auto flex items-center justify-center text-black shadow-neo-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-mono text-2xl font-black text-black uppercase tracking-tight">
              IMPORT COMPLETED SUCCESSFULLY
            </h2>
            <p className="text-xs text-zinc-700 font-sans mt-1 font-medium">
              Created {importResult.successCount} master records with initial employment logs and leave allocations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto font-mono text-xs">
            <div className="p-3 bg-[#E8FBF0] border-2 border-black shadow-neo-sm">
              <span className="text-zinc-600 font-bold block text-[10px]">IMPORTED RECORDS</span>
              <span className="font-mono text-2xl font-black text-black">
                {importResult.successCount}
              </span>
            </div>
            <div className="p-3 bg-[#FAF7EE] border-2 border-black shadow-neo-sm">
              <span className="text-zinc-600 font-bold block text-[10px]">AUDIT TRAIL</span>
              <span className="font-mono text-sm font-black text-black">COMMITTED</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Button variant="green" size="md" onClick={() => router.push('/people')}>
              <Users className="w-4 h-4 mr-1.5" /> VIEW PEOPLE DIRECTORY
            </Button>
            <Button variant="white" size="md" onClick={() => setStep(1)}>
              IMPORT ANOTHER SHEET
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
