export type Section = 'kp' | 'ts';

export type RatingValue = 'c' | 'p' | 'x' | 'n'; // correct / partial / incorrect / n/a

export interface Candidate {
  id: string;
  name: string;
  role: string;
  expectedLevelDefault: number;
}

export interface ProcessItem {
  id: string;
  name: string;
  // The troubleshooting scenario shown above the 'ts' section's questions —
  // written once per task so the questions can reference it.
  scenario?: string;
}

export interface ChecklistItem {
  id: string;
  processId: string;
  section: Section;
  text: string;
  category: string;
  critical: boolean;
  order: number;
}

export type AuditStatus = 'in_progress' | 'awaiting_signoff' | 'signed';

export interface TrailEntry {
  ts: number; // epoch millis
  what: string;
  who: string;
}

export interface Audit {
  id: string;
  candidateId: string;
  candidateName: string;
  processId: string;
  processName: string;
  auditorId: string;
  auditorName: string;
  expectedLevel: number;
  ratings: Record<string, RatingValue>;
  kpScore: number;
  tsScore: number;
  awardedLevel: number;
  status: AuditStatus;
  signedAt: number | null; // epoch millis
  createdAt: number;
  trail: TrailEntry[];
}
