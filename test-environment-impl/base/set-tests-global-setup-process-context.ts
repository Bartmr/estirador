import { ProcessType } from 'src/internals/process/process-context';
import { ProcessContextManager } from 'src/internals/process/process-context-manager';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';

ProcessContextManager.setContext({
  type: ProcessType.Testing,
  name: 'tests-global-setup',
  workerId: generateRandomUUID(),
});
