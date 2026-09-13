import { Audit } from '../types';
import { formatFullDate } from './format';
import { formatSignedTime, ORG_TIMEZONE_LABEL } from '../theme/tokens';

function csvEscape(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const HEADERS = [
  'Candidate',
  'Task',
  'Auditor',
  'Status',
  'K&P score',
  'TS score',
  'Awarded level',
  'Expected level',
  'Gap',
  'Started',
  `Signed (${ORG_TIMEZONE_LABEL})`,
];

function auditRow(a: Audit): (string | number)[] {
  return [
    a.candidateName,
    a.processName,
    a.auditorName,
    a.status,
    `${a.kpScore}%`,
    `${a.tsScore}%`,
    a.awardedLevel,
    a.expectedLevel,
    a.awardedLevel - a.expectedLevel,
    formatFullDate(a.createdAt),
    a.signedAt ? `${formatFullDate(a.signedAt)} ${formatSignedTime(new Date(a.signedAt))}` : '',
  ];
}

export function auditToCsv(audit: Audit): string {
  const lines = [HEADERS, auditRow(audit)];
  return lines.map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function auditsToCsv(audits: Audit[]): string {
  const lines = [HEADERS, ...audits.map(auditRow)];
  return lines.map((row) => row.map(csvEscape).join(',')).join('\n');
}
