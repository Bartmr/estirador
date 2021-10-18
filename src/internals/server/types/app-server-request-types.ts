import { Request } from 'express';
import { AuditContext } from '../../auditing/audit-context';

export type AppServerRequest = Request & {
  auditContext?: AuditContext;
};

export type AppServerUploadedMulterFile = Express.Multer.File;
export type AppServerUploadedMulterFiles = Array<Express.Multer.File>;
