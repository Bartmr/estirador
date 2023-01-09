import { AuthContext } from 'src/auth/auth-context';
import { ProcessContextManager } from '../process/process-context-manager';

export class AuditContext {
  public operationId: string;
  public requestPath: string | null;
  public requestMethod: string | null;
  public processId: string;
  public authContext: AuthContext | null;

  constructor(params: {
    operationId: string;
    requestPath: string | null;
    requestMethod: string | null;
    authContext: AuthContext | null;
  }) {
    this.operationId = params.operationId;
    this.requestPath = params.requestPath;
    this.requestMethod = params.requestMethod;
    this.processId = ProcessContextManager.getContext().id;
    this.authContext = params.authContext;
  }
}
