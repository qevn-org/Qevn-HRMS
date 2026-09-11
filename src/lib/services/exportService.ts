import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { hrmsStore } from './store';
import { format } from 'date-fns';

export interface ExportDataPayload {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  reportCategory: string;
}

export const exportService = {
  exportToCSV(payload: ExportDataPayload, actorName: string = 'HR Admin') {
    const csvContent = [
      payload.headers.join(','),
      ...payload.rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${payload.filename}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    hrmsStore.addAuditLog({
      actor_name: actorName,
      entity_type: 'settings',
      entity_id: 'export-csv',
      action: 'import', // logged as export audit event
      reason: `Exported ${payload.title} as CSV (${payload.rows.length} rows)`,
    });
  },

  exportToExcel(payload: ExportDataPayload, actorName: string = 'HR Admin') {
    const worksheetData = [
      [`QEVN HRMS — ${payload.title.toUpperCase()}`],
      [`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`],
      [], // blank row
      payload.headers,
      ...payload.rows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    XLSX.writeFile(workbook, `${payload.filename}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);

    hrmsStore.addAuditLog({
      actor_name: actorName,
      entity_type: 'settings',
      entity_id: 'export-xlsx',
      action: 'import',
      reason: `Exported ${payload.title} as Excel XLSX (${payload.rows.length} rows)`,
    });
  },

  exportToPDF(payload: ExportDataPayload, actorName: string = 'HR Admin') {
    const doc = new jsPDF({ orientation: payload.headers.length > 5 ? 'landscape' : 'portrait' });

    // QEVN Maximalist Brand Header
    doc.setFillColor(13, 13, 17); // Onyx background header banner
    doc.rect(0, 0, doc.internal.pageSize.width, 28, 'F');

    doc.setTextColor(204, 255, 0); // Neon Lime Brand
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('QEVN // HRMS REPORT', 14, 12);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(payload.title.toUpperCase(), 14, 20);

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')} | Authorized Access`, doc.internal.pageSize.width - 90, 20);

    // Auto Table with high contrast styling
    autoTable(doc, {
      head: [payload.headers],
      body: payload.rows,
      startY: 34,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [20, 20, 25],
        textColor: [204, 255, 0],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 248],
      },
      margin: { top: 34, bottom: 15, left: 14, right: 14 },
    });

    doc.save(`${payload.filename}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);

    hrmsStore.addAuditLog({
      actor_name: actorName,
      entity_type: 'settings',
      entity_id: 'export-pdf',
      action: 'import',
      reason: `Exported ${payload.title} as PDF (${payload.rows.length} rows)`,
    });
  }
};
