import { getEnumValues } from '@app/shared/internals/utils/enums/get-enum-values';
import { TransportFailure } from './transport-failures';

const transportFailures = getEnumValues(TransportFailure);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isTransportFailure(t: any): t is TransportFailure {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  return transportFailures.includes(t);
}
