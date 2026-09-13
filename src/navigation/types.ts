import { Section } from '../types';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  NewAuditSetup: undefined;
  Checklist: { auditId: string; section: Section };
  Result: { auditId: string };
  Signoff: { auditId: string };
  Record: { auditId: string };
  AdminItemBank: undefined;
  AdminTaskDetail: { processId: string; processName: string };
  AdminBulkAddItems: { processId: string; section: Section };
  AdminItemForm: { processId: string; section: Section; itemId?: string };
  AdminCandidates: undefined;
};
