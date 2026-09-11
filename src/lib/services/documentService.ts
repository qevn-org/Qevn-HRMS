import { DocumentRecord, DocumentRequirement, Person } from '@/types/database';
import { DocumentFilterOptions } from '@/types/domain';
import { hrmsStore } from './store';
import { parseISO, differenceInDays } from 'date-fns';

export interface PersonDocumentCompliance {
  person: Person;
  requiredCount: number;
  uploadedCount: number;
  missingRequirements: DocumentRequirement[];
  isComplete: boolean;
  completionPercentage: number;
}

export const documentService = {
  getAllDocuments(filters?: Partial<DocumentFilterOptions>): DocumentRecord[] {
    let docs = hrmsStore.getDocuments();

    if (filters?.category && filters.category !== 'all') {
      docs = docs.filter((d) => d.category === filters.category);
    }

    if (filters?.personId && filters.personId !== 'all') {
      docs = docs.filter((d) => d.person_id === filters.personId);
    }

    if (filters?.searchQuery?.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      docs = docs.filter(
        (d) =>
          d.original_file_name.toLowerCase().includes(q) ||
          d.document_type.toLowerCase().includes(q) ||
          d.person_name?.toLowerCase().includes(q) ||
          d.person_code?.toLowerCase().includes(q)
      );
    }

    if (filters?.expiringOnly) {
      const today = new Date();
      docs = docs.filter((d) => {
        if (!d.expiry_date) return false;
        const expiry = parseISO(d.expiry_date);
        const days = differenceInDays(expiry, today);
        return days >= 0 && days <= 45;
      });
    }

    return docs;
  },

  getDocumentsForPerson(personId: string): DocumentRecord[] {
    return hrmsStore.getDocuments(personId);
  },

  getDocumentRequirements(workerType?: string): DocumentRequirement[] {
    return hrmsStore.getDocumentRequirements(workerType);
  },

  getComplianceMatrix(): PersonDocumentCompliance[] {
    const activePersons = hrmsStore.getPersons().filter((p) => p.is_active);
    const allRequirements = hrmsStore.getDocumentRequirements();
    const allDocs = hrmsStore.getDocuments();

    return activePersons.map((person) => {
      const personReqs = allRequirements.filter((r) => r.worker_type === person.worker_type && r.required && r.active);
      const personDocs = allDocs.filter((d) => d.person_id === person.id && d.is_current);

      const missingRequirements: DocumentRequirement[] = [];
      let uploadedCount = 0;

      personReqs.forEach((req) => {
        const found = personDocs.find((d) => d.document_type === req.document_type || d.category === req.category);
        if (found) {
          uploadedCount++;
        } else {
          missingRequirements.push(req);
        }
      });

      const requiredCount = personReqs.length;
      const completionPercentage = requiredCount === 0 ? 100 : Math.round((uploadedCount / requiredCount) * 100);

      return {
        person,
        requiredCount,
        uploadedCount,
        missingRequirements,
        isComplete: missingRequirements.length === 0,
        completionPercentage,
      };
    });
  },

  getExpiringDocumentsQueue(withinDays: number = 45): { document: DocumentRecord; daysRemaining: number }[] {
    const today = new Date();
    const allDocs = hrmsStore.getDocuments();

    const queue: { document: DocumentRecord; daysRemaining: number }[] = [];
    allDocs.forEach((doc) => {
      if (doc.expiry_date) {
        const expiry = parseISO(doc.expiry_date);
        const days = differenceInDays(expiry, today);
        if (days >= 0 && days <= withinDays) {
          queue.push({ document: doc, daysRemaining: days });
        }
      }
    });

    return queue.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  uploadDocument(doc: Omit<DocumentRecord, 'id' | 'uploaded_at' | 'version' | 'is_current'>, actorName?: string): DocumentRecord {
    return hrmsStore.uploadDocument(doc, actorName);
  },

  generateSignedDownloadUrl(documentId: string): string {
    const doc = hrmsStore.getDocuments().find((d) => d.id === documentId);
    if (!doc) return '#';
    // For demo or Supabase storage, provide a clean download simulation or storage URL
    return doc.file_url || `https://demo-storage.qevn.io/private/${doc.storage_path}?token=exp_${Date.now() + 3600}`;
  }
};
