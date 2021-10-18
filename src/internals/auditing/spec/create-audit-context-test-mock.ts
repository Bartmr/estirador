import { ProcessContextManager } from 'src/internals/process/process-context-manager';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';
import { AuditContext } from '../audit-context';

export function createAuditContextTestMock() {
  const processContext = ProcessContextManager.getContext();

  const operationId = generateRandomUUID();
  const processId = processContext.id;

  const auditContext: AuditContext = {
    operationId,
    processId,
    requestPath: undefined,
    requestMethod: undefined,
  };

  const auditContextEntityProps = {
    operationId: null,
    processId: undefined,
    deletedAt: null,
    archivedByUserId: undefined,
    requestMethod: undefined,
    requestPath: undefined,
    id: expect.any(String) as unknown,
  };

  const auditContextArchivedEntityProps = {
    operationId: auditContext.operationId,
    processId: undefined,
    archivedByUserId: undefined,
    requestMethod: undefined,
    requestPath: undefined,
    deletedAt: expect.any(Date) as unknown,
    id: expect.any(String) as unknown,
  };

  return {
    auditContext,
    persisted: {
      auditContextEntityProps,
      auditContextArchivedEntityProps,
    },
  };
}
