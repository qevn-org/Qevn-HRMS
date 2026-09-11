'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { documentService, PersonDocumentCompliance } from '@/lib/services/documentService';
import { peopleService } from '@/lib/services/peopleService';
import { hrmsStore } from '@/lib/services/store';
import { DocumentRecord, DocumentCategoryType, DocumentVisibilityLevel, Person } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Input, Select, Textarea } from '@/components/ui/FormControls';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Search,
  Download,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Clock,
} from 'lucide-react';

function DocumentVaultContent() {
  const searchParams = useSearchParams();
  const { canManagePeople, canViewConfidentialDocs, user } = useAuth();

  const [activeTab, setActiveTab] = useState('vault');
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [complianceList, setComplianceList] = useState<PersonDocumentCompliance[]>([]);
  const [expiringQueue, setExpiringQueue] = useState<{ document: DocumentRecord; daysRemaining: number }[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');

  // Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    person_id: '',
    category: 'Employment' as DocumentCategoryType,
    document_type: 'Signed Offer Letter',
    original_file_name: 'offer_letter.pdf',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    visibility_level: 'hr_only' as DocumentVisibilityLevel,
    notes: '',
  });

  useEffect(() => {
    loadDocsData();
    const unsubscribe = hrmsStore.subscribe(() => {
      loadDocsData();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'upload') {
      setIsUploadModalOpen(true);
    }
    const filterParam = searchParams.get('filter');
    if (filterParam === 'expiring') {
      setActiveTab('expiring');
    } else if (filterParam === 'compliance' || filterParam === 'missing') {
      setActiveTab('compliance');
    }
  }, [searchParams]);

  const loadDocsData = () => {
    hrmsStore.init();
    const allDocs = documentService.getAllDocuments();
    const compliance = documentService.getComplianceMatrix();
    const expiring = documentService.getExpiringDocumentsQueue(45);
    const allPersons = peopleService.getAllPersons().filter((p) => p.is_active);

    setDocuments(allDocs);
    setComplianceList(compliance);
    setExpiringQueue(expiring);
    setPersons(allPersons);

    if (allPersons.length > 0 && !uploadFormData.person_id) {
      setUploadFormData((prev) => ({ ...prev, person_id: allPersons[0].id }));
    }
  };

  const filteredDocs = useMemo(() => {
    return documentService.getAllDocuments({
      category: categoryFilter,
      personId: personFilter,
      searchQuery,
    });
  }, [documents, categoryFilter, personFilter, searchQuery]);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.document_type || !uploadFormData.original_file_name) {
      toast.error('Please enter document title and file name');
      return;
    }

    try {
      documentService.uploadDocument(
        {
          person_id: uploadFormData.person_id,
          category: uploadFormData.category,
          document_type: uploadFormData.document_type,
          original_file_name: uploadFormData.original_file_name,
          storage_bucket: 'employee-documents',
          storage_path: `${uploadFormData.person_id}/${uploadFormData.category}/${uploadFormData.original_file_name}`,
          mime_type: 'application/pdf',
          file_size: 320000,
          issue_date: uploadFormData.issue_date,
          expiry_date: uploadFormData.expiry_date || null,
          is_required: true,
          visibility_level: uploadFormData.visibility_level,
          uploaded_by: user.display_name,
          notes: uploadFormData.notes,
        },
        user.display_name
      );

      toast.success(`Stored ${uploadFormData.document_type} in secure vault`);
      setIsUploadModalOpen(false);
      setUploadFormData((prev) => ({
        ...prev,
        document_type: '',
        original_file_name: 'document.pdf',
        notes: '',
      }));
    } catch {
      toast.error('Failed to store document');
    }
  };

  const tabs = [
    { id: 'vault', label: 'Document Vault Repository', icon: <FileText className="w-3.5 h-3.5" />, count: documents.length },
    { id: 'compliance', label: 'Required Documents Checklist', icon: <ShieldCheck className="w-3.5 h-3.5" />, count: complianceList.filter((c) => !c.isComplete).length },
    { id: 'expiring', label: 'Expiring Documents Radar', icon: <Clock className="w-3.5 h-3.5" />, count: expiringQueue.length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border-3 border-black p-5 sm:p-6 shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker-tag bg-[#38BDF8] text-black">
              ENCRYPTED HR VAULT
            </span>
            <span className="sticker-tag bg-[#00D06C] text-black">
              COMPLIANCE VERIFIED
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-black tracking-tight mt-1 uppercase">
            DOCUMENT VAULT & COMPLIANCE
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-sans font-medium">
            Confidential file storage, mandatory checklist verification, and proactive expiry radar.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="green" size="sm" onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Upload Document
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: VAULT REPOSITORY */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white border-3 border-black p-4 shadow-neo flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by employee, title, filename..."
                className="w-full bg-[#FCFAF5] border-2 border-black text-black pl-9 pr-3.5 py-1.5 font-mono text-xs focus:outline-hidden shadow-[2px_2px_0px_#000]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
              >
                <option value="all">ALL CATEGORIES</option>
                <option value="Joining">JOINING (ID, RESUME)</option>
                <option value="Employment">EMPLOYMENT (OFFER, NDA)</option>
                <option value="Internship">INTERNSHIP (AGREEMENT, NOC)</option>
                <option value="Performance">PERFORMANCE (REVIEWS)</option>
                <option value="Exit">EXIT (RELIEVING)</option>
                <option value="Other">OTHER</option>
              </select>

              <select
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                className="bg-white border-2 border-black text-black px-2.5 py-1.5 font-mono text-xs font-bold cursor-pointer focus:outline-hidden shadow-[2px_2px_0px_#000]"
              >
                <option value="all">ALL EMPLOYEES</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of Documents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full bg-white border-3 border-dashed border-black p-12 text-center shadow-neo">
                <div className="font-mono text-base font-black text-black uppercase">No documents found</div>
                <p className="text-xs text-zinc-600 mt-1 font-sans font-medium">Try broadening your search or upload a new file.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border-3 border-black hover:shadow-neo-lg p-4 shadow-neo flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <div className="p-2 bg-[#FFDE59] border-2 border-black text-black shadow-neo-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <h4 className="font-mono text-xs font-black text-black group-hover:text-[#00D06C] transition-colors truncate">
                            {doc.document_type}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-zinc-600">{doc.person_name}</span>
                        </div>
                      </div>
                      <Badge variant="cyan">{doc.category}</Badge>
                    </div>

                    <div className="mt-3.5 space-y-1 text-xs font-mono text-zinc-700 border-t-2 border-black/10 pt-2.5 font-bold">
                      <div className="truncate text-black">{doc.original_file_name}</div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-600">
                        <span>ISSUED: {doc.issue_date ? formatDate(doc.issue_date) : '—'}</span>
                        <span>EXPIRY: {doc.expiry_date ? formatDate(doc.expiry_date) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-600 pt-1">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-black" /> {doc.visibility_level.toUpperCase()}
                        </span>
                        <span>BY: {doc.uploaded_by}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-zinc-600">VERSION {doc.version}</span>
                    <a
                      href={documentService.generateSignedDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs font-black text-black bg-[#00D06C] px-2 py-0.5 border border-black hover:bg-[#05DF72]"
                    >
                      <Download className="w-3.5 h-3.5" /> DOWNLOAD
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPLIANCE CHECKLIST */}
      {activeTab === 'compliance' && (
        <div className="bg-white border-3 border-black shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                EMPLOYEE DOCUMENT COMPLIANCE MATRIX
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">Verifies required joining & employment documentation completeness</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceList.map((comp) => (
              <div
                key={comp.person.id}
                className={`p-4 border-3 border-black transition-all ${
                  comp.isComplete
                    ? 'bg-[#E8FBF0]'
                    : 'bg-[#FFF0F3] shadow-neo-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-sm font-black text-black flex items-center gap-2">
                      <span>{comp.person.full_name}</span>
                      <span className="text-xs text-zinc-600 font-bold">[{comp.person.person_code}]</span>
                    </div>
                    <div className="text-xs font-mono text-zinc-600 font-bold">
                      {comp.person.designation?.name} • {comp.person.department?.name}
                    </div>
                  </div>
                  <Badge variant={comp.isComplete ? 'green' : 'rose'}>
                    {comp.completionPercentage}% COMPLETE
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-white h-2.5 border-2 border-black">
                  <div
                    className={`h-full ${comp.isComplete ? 'bg-[#00D06C]' : 'bg-[#FF4365]'}`}
                    style={{ width: `${comp.completionPercentage}%` }}
                  />
                </div>

                {/* Missing checklist items */}
                <div className="mt-3 pt-2 border-t-2 border-black/10 space-y-1 font-mono text-xs">
                  {comp.missingRequirements.length === 0 ? (
                    <div className="text-black font-black text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00D06C]" /> All required documents verified and stored.
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] text-[#FF4365] uppercase font-black block">
                        MISSING REQUIRED DOCUMENTS ({comp.missingRequirements.length}):
                      </span>
                      {comp.missingRequirements.map((req) => (
                        <div key={req.id} className="text-black font-bold text-[11px] flex items-center gap-1.5 pl-1">
                          <AlertTriangle className="w-3 h-3 text-[#FF4365] shrink-0" />
                          <span>{req.document_type} ({req.category})</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXPIRING RADAR */}
      {activeTab === 'expiring' && (
        <div className="bg-white border-3 border-black shadow-neo p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h3 className="font-mono text-sm font-black uppercase tracking-wider text-black">
                EXPIRING DOCUMENTS RADAR (&le; 45 DAYS)
              </h3>
              <p className="text-xs text-zinc-600 font-sans font-medium">Identifies passports, visas, consultant agreements, or IDs needing renewal</p>
            </div>
          </div>

          <div className="space-y-3">
            {expiringQueue.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 font-mono text-xs font-bold bg-[#FAF7EE] border-2 border-black">
                All stored document expiry dates are current and valid.
              </div>
            ) : (
              expiringQueue.map(({ document: doc, daysRemaining }) => (
                <div
                  key={doc.id}
                  className="p-4 bg-[#FFF0F3] border-3 border-black shadow-neo-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FF4365] border-2 border-black text-white">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-mono text-xs font-black text-black flex items-center gap-2">
                        <span>{doc.document_type}</span>
                        <span className="text-zinc-600">— {doc.person_name}</span>
                      </div>
                      <div className="text-xs text-zinc-700 font-sans font-medium mt-0.5">
                        File: {doc.original_file_name} • Category: {doc.category}
                      </div>
                      <div className="text-xs font-mono text-[#FF4365] font-black mt-1">
                        Expires on {formatDate(doc.expiry_date)} ({daysRemaining} days remaining!)
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="green"
                    size="sm"
                    onClick={() => {
                      setUploadFormData((prev) => ({
                        ...prev,
                        person_id: doc.person_id,
                        document_type: doc.document_type,
                        category: doc.category,
                      }));
                      setIsUploadModalOpen(true);
                    }}
                  >
                    UPLOAD RENEWAL
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD DOCUMENT */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="UPLOAD DOCUMENT TO VAULT"
        subtitle="Role-based access controls who can view and download"
        headerColor="purple"
        maxWidth="lg"
        footer={
          <>
            <Button variant="white" size="sm" onClick={() => setIsUploadModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="purple" size="sm" onClick={handleUploadSubmit}>
              STORE IN VAULT
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 font-mono text-xs">
          <Select
            label="Target Employee"
            value={uploadFormData.person_id}
            onChange={(e) => setUploadFormData({ ...uploadFormData, person_id: e.target.value })}
            options={persons.map((p) => ({ value: p.id, label: `${p.full_name} (${p.person_code})` }))}
          />

          <Select
            label="Document Category"
            value={uploadFormData.category}
            onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value as any })}
            options={[
              { value: 'Joining', label: 'Joining (Passport, ID, Resume, Prior Exp)' },
              { value: 'Employment', label: 'Employment (Offer Letter, NDA, Policy)' },
              { value: 'Internship', label: 'Internship (Agreement, NOC, Certificate)' },
              { value: 'Performance', label: 'Performance (Appraisal, Warning)' },
              { value: 'Exit', label: 'Exit (Relieving Letter, Handover)' },
              { value: 'Other', label: 'Other / Supporting' },
            ]}
          />

          <Input
            label="Document Title / Type"
            required
            placeholder="e.g. Government ID / Passport"
            value={uploadFormData.document_type}
            onChange={(e) => setUploadFormData({ ...uploadFormData, document_type: e.target.value })}
          />

          <Input
            label="File Name"
            required
            value={uploadFormData.original_file_name}
            onChange={(e) => setUploadFormData({ ...uploadFormData, original_file_name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issue Date"
              type="date"
              value={uploadFormData.issue_date}
              onChange={(e) => setUploadFormData({ ...uploadFormData, issue_date: e.target.value })}
            />
            <Input
              label="Expiry Date (if applicable)"
              type="date"
              value={uploadFormData.expiry_date}
              onChange={(e) => setUploadFormData({ ...uploadFormData, expiry_date: e.target.value })}
            />
          </div>

          <Select
            label="Visibility Level"
            value={uploadFormData.visibility_level}
            onChange={(e) => setUploadFormData({ ...uploadFormData, visibility_level: e.target.value as any })}
            options={[
              { value: 'hr_only', label: 'HR Admins Only (Strictly Confidential)' },
              { value: 'hr_manager', label: 'HR Admins & Reporting Manager' },
              { value: 'person', label: 'Visible to Employee Self-Service' },
            ]}
          />

          <Textarea
            label="Notes / Metadata"
            placeholder="Optional verification comments..."
            value={uploadFormData.notes}
            onChange={(e) => setUploadFormData({ ...uploadFormData, notes: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}

export default function DocumentVaultPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-black font-mono text-sm font-bold">Loading Document Vault...</div>}>
      <DocumentVaultContent />
    </Suspense>
  );
}
