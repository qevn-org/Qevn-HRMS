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
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
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
    // Check if required fields are mapped
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
      <div className="bg-[#121218] border-2 border-[#262636] p-5 shadow-neo">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#CCFF00]" />
          <span className="font-mono text-xs font-bold uppercase text-[#CCFF00] tracking-wider">
            DATA MIGRATION WIZARD
          </span>
        </div>
        <h1 className="font-mono text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
          SPREADSHEET EMPLOYEE IMPORT WIZARD
        </h1>
        <p className="text-xs text-zinc-400 font-sans">
          Migrate existing employee spreadsheets into QEVN HRMS with column mapping and strict row validation.
        </p>

        {/* Wizard Steps Tracker */}
        <div className="mt-5 grid grid-cols-4 gap-2 font-mono text-xs">
          {[
            { num: 1, label: 'Upload Sheet' },
            { num: 2, label: 'Map Columns' },
            { num: 3, label: 'Validate & Preview' },
            { num: 4, label: 'Commit & Done' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 border-2 flex items-center justify-between ${
                step === s.num
                  ? 'bg-[#CCFF00] text-black border-black font-black shadow-neo-sm'
                  : step > s.num
                  ? 'bg-[#0D0D12] text-[#CCFF00] border-[#CCFF00]/40 font-bold'
                  : 'bg-[#0D0D12] text-zinc-500 border-[#262636]'
              }`}
            >
              <span>{s.num}. {s.label}</span>
              {step > s.num && <CheckCircle2 className="w-4 h-4 text-[#CCFF00]" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-8 text-center space-y-6">
          <div className="border-2 border-dashed border-[#3B3B4F] hover:border-[#CCFF00] p-10 transition-colors bg-[#0D0D12] flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-900 border-2 border-black flex items-center justify-center text-[#CCFF00] mb-4 shadow-neo-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-mono text-base font-bold text-white uppercase">
              SELECT CSV OR EXCEL (.XLSX) EMPLOYEE SHEET
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mt-1 font-sans">
              Upload your legacy employee master sheet to begin column mapping and automatic ID allocation.
            </p>

            <label className="mt-5 inline-block cursor-pointer">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="primary" size="md" className="pointer-events-none">
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> BROWSE FILE TO UPLOAD
              </Button>
            </label>
          </div>

          <div className="p-4 bg-[#0A0A0E] border border-[#262636] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <div className="font-mono text-xs font-bold text-white uppercase">
                NEED A TEST FILE?
              </div>
              <div className="text-[11px] text-zinc-400 font-sans">
                Load our verified 4-person multi-department sample dataset immediately.
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLoadSampleSheet}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> LOAD DEMO SPREADSHEET
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && (
        <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                MAP SPREADSHEET HEADERS TO QEVN HRMS FIELDS
              </h3>
              <p className="text-xs text-zinc-400">File: {file?.name} ({rawRows.length} rows detected)</p>
            </div>
          </div>

          <div className="space-y-3">
            {mappings.map((mapping, idx) => (
              <div
                key={mapping.targetField}
                className="p-3.5 bg-[#0D0D12] border border-[#262636] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div className="flex-1">
                  <div className="text-white font-bold uppercase flex items-center gap-1.5">
                    <span>{mapping.targetField.replace(/_/g, ' ')}</span>
                    {mapping.required && <span className="text-[#F43F5E]">*</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <span className="text-zinc-500 text-[11px] hidden sm:inline">MAPS TO &rarr;</span>
                  <select
                    value={mapping.csvHeader}
                    onChange={(e) => {
                      const updated = [...mappings];
                      updated[idx].csvHeader = e.target.value;
                      setMappings(updated);
                    }}
                    className="w-full bg-[#121218] border-2 border-[#262636] text-white p-2 font-mono text-xs focus:border-[#CCFF00] focus:outline-hidden"
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

          <div className="pt-4 border-t border-[#262636] flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button variant="primary" size="sm" onClick={handleProceedToValidation}>
              VALIDATE {rawRows.length} ROWS & PREVIEW <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: VALIDATION & PREVIEW */}
      {step === 3 && (
        <div className="bg-[#121218] border-2 border-[#262636] shadow-neo p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#262636]">
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                ROW VALIDATION PREVIEW & CONFLICT DETECTION
              </h3>
              <p className="text-xs text-zinc-400">Review validation rules before writing to master database</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <Badge variant="lime">{validRowCount} VALID ROWS</Badge>
              {errorRowCount > 0 && <Badge variant="rose">{errorRowCount} ERRORS</Badge>}
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 border border-[#262636]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#171722] border-b border-[#262636] text-zinc-400 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">ROW</th>
                  <th className="py-2.5 px-3">FULL NAME</th>
                  <th className="py-2.5 px-3">WORK EMAIL</th>
                  <th className="py-2.5 px-3">WORKER TYPE</th>
                  <th className="py-2.5 px-3">DEPARTMENT</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">VALIDATION ISSUES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22222E]">
                {validationRows.map((vr) => (
                  <tr
                    key={vr.rowIndex}
                    className={vr.isValid ? 'hover:bg-[#1A1A26]' : 'bg-rose-950/20 text-rose-300'}
                  >
                    <td className="py-2.5 px-3 font-bold">{vr.rowIndex}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{vr.mappedData.full_name || '—'}</td>
                    <td className="py-2.5 px-3 text-zinc-300">{vr.mappedData.work_email || '—'}</td>
                    <td className="py-2.5 px-3 uppercase">{vr.mappedData.worker_type || '—'}</td>
                    <td className="py-2.5 px-3">{vr.mappedData.department_name || '—'}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={vr.isValid ? 'lime' : 'rose'}>
                        {vr.isValid ? 'READY' : 'ERROR'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      {vr.errors.length > 0 && (
                        <div className="text-rose-400 font-bold">{vr.errors.join('; ')}</div>
                      )}
                      {vr.warnings.length > 0 && (
                        <div className="text-amber-400">{vr.warnings.join('; ')}</div>
                      )}
                      {vr.isValid && <span className="text-emerald-400">All checks passed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-[#262636] flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Re-map Columns
            </Button>
            <Button
              variant="primary"
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
        <div className="bg-[#121218] border-2 border-[#CCFF00] shadow-neo-lime p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#CCFF00] border-2 border-black mx-auto flex items-center justify-center text-black shadow-neo-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="font-mono text-2xl font-black text-white uppercase tracking-tight">
              IMPORT COMPLETED SUCCESSFULLY
            </h2>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Created {importResult.successCount} master records with initial employment logs and leave allocations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto font-mono text-xs">
            <div className="p-3 bg-[#0D0D12] border border-emerald-500/40">
              <span className="text-zinc-500 block text-[10px]">IMPORTED RECORDS</span>
              <span className="font-mono text-2xl font-black text-[#CCFF00]">
                {importResult.successCount}
              </span>
            </div>
            <div className="p-3 bg-[#0D0D12] border border-[#262636]">
              <span className="text-zinc-500 block text-[10px]">AUDIT TRAIL</span>
              <span className="font-mono text-sm font-bold text-white">COMMITTED</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Button variant="primary" size="md" onClick={() => router.push('/people')}>
              <Users className="w-4 h-4 mr-1.5" /> VIEW PEOPLE DIRECTORY
            </Button>
            <Button variant="outline" size="md" onClick={() => setStep(1)}>
              IMPORT ANOTHER SHEET
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
