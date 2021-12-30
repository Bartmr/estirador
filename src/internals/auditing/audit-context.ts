import { ProcessContextManager } from '../process/process-context-manager';

export class AuditContext {
  public operationId: string;
  public requestPath: string | null;
  public requestMethod: string | null;
  public processId: string;

  constructor(params: {
    operationId: string;
    requestPath: string | null;
    requestMethod: string | null;
  }) {
    this.operationId = params.operationId;
    this.requestPath = params.requestPath;
    this.requestMethod = params.requestMethod;
    this.processId = ProcessContextManager.getContext().id;
  }
}
