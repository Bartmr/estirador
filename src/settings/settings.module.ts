import { Module, OnModuleInit } from '@nestjs/common';
import { TypeormFeatureModule } from 'src/internals/databases/typeorm.module';
import { SettingsService } from './settings.service';
import { Settings } from './typeorm/settings.entity';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Settings],
    }),
  ],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule implements OnModuleInit {
  constructor(private settingsService: SettingsService) {}

  async onModuleInit() {
    await this.settingsService.initializeSettings();
  }
}
