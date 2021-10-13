import { AuthContext } from 'src/auth/auth-context';
import { ProcessContextManager } from '../process/process-context-manager';

export class AuditContext {
  public operationId: string;
  public requestPath: string | undefined;
  public requestMethod: string | undefined;
  public processId: string;
  public authContext: AuthContext | undefined;

  constructor(params: {
    operationId: string;
    requestPath: string | undefined;
    requestMethod: string | undefined;
    authContext: AuthContext | undefined;
  }) {
    this.operationId = params.operationId;
    this.requestPath = params.requestPath;
    this.requestMethod = params.requestMethod;
    this.processId = ProcessContextManager.getContext().id;
    this.authContext = params.authContext;
  }
}
