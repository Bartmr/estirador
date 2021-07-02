import { ToJSON } from '@app/shared/internals/transports/json-type-converters';
import { GetRemoteConfigResponseDTO } from '@app/shared/remote-config/remote-config.dto';

export type RemoteConfig = ToJSON<GetRemoteConfigResponseDTO>;
