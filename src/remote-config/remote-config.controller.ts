import { Controller, Get } from '@nestjs/common';
import { GetRemoteConfigResponseDTO } from 'libs/shared/src/remote-config/remote-config.dto';
import { PublicRoute } from '../auth/public-route.decorator';

@Controller('remote-config')
export class RemoteConfigController {
  @Get()
  @PublicRoute()
  getRemoteConfig(): GetRemoteConfigResponseDTO {
    return {};
  }
}
