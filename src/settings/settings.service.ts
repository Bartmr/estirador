import { InjectConnection } from '@nestjs/typeorm';
import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  IncrementalUpdateChanges,
  SimpleEntityRepository,
} from 'src/internals/databases/simple-entity/simple-entity.repository';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { ProcessContextManager } from 'src/internals/process/process-context-manager';
import { generateUniqueUUID } from 'src/internals/utils/generate-unique-uuid';
import { throwError } from 'src/internals/utils/throw-error';
import { Connection, EntityManager, EntityRepository } from 'typeorm';
import { Settings } from './typeorm/settings.entity';

@EntityRepository(Settings)
class SettingsRepository extends SimpleEntityRepository<Settings> {}

export class SettingsService {
  private forInstance: string;

  constructor(@InjectConnection() private connection: Connection) {
    if (NODE_ENV === NodeEnv.Test) {
      this.forInstance = generateUniqueUUID();
    } else {
      this.forInstance = 'main';
    }
  }

  async initializeSettings() {
    const auditContext: AuditContext = {
      operationId: generateUniqueUUID(),
      requestPath: undefined,
      requestMethod: undefined,
      authContext: undefined,
      processId: ProcessContextManager.getContext().id,
    };

    const repository = this.connection.getCustomRepository(SettingsRepository);

    const settings = await repository.findOne({
      where: { forInstance: this.forInstance },
    });

    if (!settings) {
      await repository.create({ forInstance: this.forInstance }, auditContext);
    }
  }

  async getSettings(options?: { manager: EntityManager }) {
    const manager = options?.manager || this.connection.manager;
    const repository = manager.getCustomRepository(SettingsRepository);

    const settings = await repository.findOne({
      where: { forInstance: this.forInstance },
    });

    return settings || throwError();
  }

  async updateSettings(
    settings: Settings,
    changes: IncrementalUpdateChanges<Settings>,
    auditContext: AuditContext,
    options?: { manager?: EntityManager },
  ) {
    const manager = options?.manager || this.connection.manager;
    const repository = manager.getCustomRepository(SettingsRepository);

    await repository.incrementalUpdate(settings, changes, auditContext);
  }
}
