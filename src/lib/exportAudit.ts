import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { auditsToCsv, auditToCsv } from './csv';
import { certificateHtml, reportHtml } from './pdfTemplates';
import { Audit } from '../types';

async function shareFile(uri: string, mimeType: string, dialogTitle: string) {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle, UTI: mimeType === 'text/csv' ? 'public.comma-separated-values-text' : undefined });
}

function writeCsvFile(filename: string, content: string): string {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  return file.uri;
}

export async function exportAuditCsv(audit: Audit) {
  const filename = `${audit.candidateName.replace(/\s+/g, '_')}_${audit.processName.replace(/\s+/g, '_')}.csv`;
  const uri = writeCsvFile(filename, auditToCsv(audit));
  await shareFile(uri, 'text/csv', 'Export audit as CSV');
}

export async function exportAllAuditsCsv(audits: Audit[]) {
  const uri = writeCsvFile('audit_history.csv', auditsToCsv(audits));
  await shareFile(uri, 'text/csv', 'Export audit history as CSV');
}

export async function exportAuditPdf(audit: Audit) {
  const { uri } = await Print.printToFileAsync({ html: certificateHtml(audit), base64: false });
  await shareFile(uri, 'application/pdf', 'Export audit certificate');
}

export async function exportAllAuditsPdf(audits: Audit[]) {
  const { uri } = await Print.printToFileAsync({ html: reportHtml(audits), base64: false });
  await shareFile(uri, 'application/pdf', 'Export audit history as PDF');
}
