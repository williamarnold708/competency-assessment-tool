import { doc, getDoc, getDocs, limit as fsLimit, orderBy, query, serverTimestamp, updateDoc, setDoc } from 'firebase/firestore';
import { Audit, RatingValue, TrailEntry } from '../types';
import { userCollection, userDoc } from './scope';

interface NewAuditInput {
  candidateId: string;
  candidateName: string;
  processId: string;
  processName: string;
  auditorId: string;
  auditorName: string;
  expectedLevel: number;
}

function toAudit(id: string, data: any): Audit {
  return {
    id,
    candidateId: data.candidateId,
    candidateName: data.candidateName,
    processId: data.processId,
    processName: data.processName,
    auditorId: data.auditorId,
    auditorName: data.auditorName,
    expectedLevel: data.expectedLevel,
    ratings: data.ratings ?? {},
    kpScore: data.kpScore ?? 0,
    tsScore: data.tsScore ?? 0,
    awardedLevel: data.awardedLevel ?? 0,
    status: data.status,
    auditorSignedAt: data.auditorSignedAt?.toMillis ? data.auditorSignedAt.toMillis() : data.auditorSignedAt ?? null,
    signedAt: data.signedAt?.toMillis ? data.signedAt.toMillis() : data.signedAt ?? null,
    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt ?? Date.now(),
    trail: (data.trail ?? []).map((t: any) => ({
      ...t,
      ts: t.ts?.toMillis ? t.ts.toMillis() : t.ts,
    })),
  };
}

export async function createAudit(input: NewAuditInput): Promise<string> {
  const ref = doc(userCollection('audits'));
  const trail: TrailEntry[] = [{ ts: Date.now(), what: 'Audit started', who: input.auditorName }];
  await setDoc(ref, {
    ...input,
    ratings: {},
    kpScore: 0,
    tsScore: 0,
    awardedLevel: 0,
    status: 'in_progress',
    auditorSignedAt: null,
    signedAt: null,
    createdAt: serverTimestamp(),
    trail,
  });
  return ref.id;
}

export async function getAudit(id: string): Promise<Audit | null> {
  const snap = await getDoc(userDoc('audits', id));
  if (!snap.exists()) return null;
  return toAudit(snap.id, snap.data());
}

export async function setRating(auditId: string, itemId: string, value: RatingValue | undefined) {
  await updateDoc(userDoc('audits', auditId), {
    [`ratings.${itemId}`]: value ?? null,
  });
}

export async function completeKpSection(auditId: string, kpScore: number, ratedCount: number, total: number) {
  const entry: TrailEntry = {
    ts: Date.now(),
    what: `Knowledge section completed — ${ratedCount} of ${total} rated`,
    who: 'System',
  };
  await appendResultUpdate(auditId, { kpScore }, entry);
}

export async function completeTsSection(
  auditId: string,
  tsScore: number,
  awardedLevel: number,
  ratedCount: number,
  total: number
) {
  const entry: TrailEntry = {
    ts: Date.now(),
    what: `Troubleshooting section completed — ${ratedCount} of ${total} rated`,
    who: 'System',
  };
  await appendResultUpdate(auditId, { tsScore, awardedLevel, status: 'awaiting_signoff' }, entry);
}

async function appendResultUpdate(auditId: string, fields: Record<string, any>, entry: TrailEntry) {
  const ref = userDoc('audits', auditId);
  const snap = await getDoc(ref);
  const trail = snap.exists() ? (snap.data().trail ?? []) : [];
  await updateDoc(ref, { ...fields, trail: [...trail, entry] });
}

export async function signAuditAsAuditor(auditId: string, auditorName: string): Promise<number> {
  const ref = userDoc('audits', auditId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Audit not found');
  const existing = snap.data().auditorSignedAt;
  if (existing) {
    // Already confirmed by the auditor — never allow a second write.
    return existing?.toMillis ? existing.toMillis() : existing;
  }
  const signedAtMs = Date.now();
  const trail = snap.data().trail ?? [];
  const entry: TrailEntry = { ts: signedAtMs, what: 'Auditor confirmed', who: auditorName };
  await updateDoc(ref, {
    auditorSignedAt: signedAtMs,
    trail: [...trail, entry],
  });
  return signedAtMs;
}

export async function signAudit(auditId: string, candidateName: string): Promise<number> {
  const ref = userDoc('audits', auditId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Audit not found');
  if (snap.data().status === 'signed') {
    // Already signed — never allow a second write (this is the fix for the
    // old app's stuck-sign-off bug).
    return snap.data().signedAt?.toMillis ? snap.data().signedAt.toMillis() : snap.data().signedAt;
  }
  const signedAtMs = Date.now();
  const trail = snap.data().trail ?? [];
  const entry: TrailEntry = { ts: signedAtMs, what: 'Auditee confirmed', who: `${candidateName}, on shared device` };
  await updateDoc(ref, {
    status: 'signed',
    signedAt: signedAtMs,
    trail: [...trail, entry],
  });
  return signedAtMs;
}

export async function listRecentAudits(count = 10): Promise<Audit[]> {
  const snap = await getDocs(query(userCollection('audits'), orderBy('createdAt', 'desc'), fsLimit(count)));
  return snap.docs.map((d) => toAudit(d.id, d.data()));
}
