import { Request } from 'express';
import { AuditContext } from '../../auditing/audit-context';

export type AppServerRequest = Request & {
  auditContext?: AuditContext;
};
