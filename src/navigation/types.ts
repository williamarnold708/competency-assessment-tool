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
  AdminItemForm: { processId: string; section: Section; itemId?: string };
};
