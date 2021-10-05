import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { throwError } from 'src/internals/utils/throw-error';
import { EntityRepository } from 'typeorm';
import { Settings } from './settings.entity';

let settingsId: string;

@EntityRepository(Settings)
export class SettingsRepository extends SimpleEntityRepository<Settings> {
  async getSettings() {
    const settings = await this.findOne({ where: { id: settingsId } });

    return settings || throwError();
  }

  async initializeSettings(auditContext: AuditContext) {
    const settingsRes = await this.find({ skip: 0 });

    if (settingsRes.rows.length > 1) {
      throw new Error();
    }

    const settings = settingsRes.rows[0];

    if (settings) {
      settingsId = settings.id;
    } else {
      const newSettings = await this.create({}, auditContext);

      settingsId = newSettings.id;
    }
  }
}
