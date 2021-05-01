import { ProcessContextManager } from 'src/internals/process/process-context-manager';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { AuditContext } from '../audit-context';

export function createTestAuditContext() {
  const processContext = ProcessContextManager.getContext();

  const toPersist: AuditContext = {
    operationId: generateRandomUUID(),
    processId: processContext.id,
    requestPath: undefined,
    requestMethod: undefined,
    authContext: undefined,
  };

  const toExpect = {
    ...toPersist,
    operationId: undefined,
    processId: undefined,
  };

  const toExpectOnArchivedRows = {
    ...toExpect,
    operationId: toPersist.operationId,
  };

  return {
    toPersist,
    toExpect,
    toExpectOnArchivedRows,
  };
}
