import { Controller, Get } from '@nestjs/common';
import { GetRemoteConfigResponseDTO } from 'libs/shared/src/remote-config/remote-config.dto';

@Controller('remote-config')
export class RemoteConfigController {
  @Get()
  getRemoteConfig(): GetRemoteConfigResponseDTO {
    return {};
  }
}
