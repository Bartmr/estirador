import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { Settings } from './typeorm/settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settings])],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule implements OnModuleInit {
  constructor(private settingsService: SettingsService) {}

  async onModuleInit() {
    await this.settingsService.initializeSettings();
  }
}
