import { Module } from '@nestjs/common';
import { RemoteConfigController } from './remote-config.controller';

@Module({
  controllers: [RemoteConfigController],
})
export class RemoteConfigModule {}
