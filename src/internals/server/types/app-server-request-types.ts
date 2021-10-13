import { Request } from 'express';
import { AuthContext } from 'src/auth/auth-context';
import { AuditContext } from '../../auditing/audit-context';

export type AppServerRequest = Request & {
  authContext?: AuthContext;
  auditContext?: AuditContext;
};

export type AppServerUploadedMulterFile = Express.Multer.File;
export type AppServerUploadedMulterFiles = Array<Express.Multer.File>;
