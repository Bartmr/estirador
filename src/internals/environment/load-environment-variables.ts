import dotenv from 'dotenv';
import path from 'path';
import { isValueFromEnum } from 'libs/shared/src/internals/utils/enums/is-value-from-enum';
import { NodeEnv } from './node-env.types';

// eslint-disable-next-line node/no-process-env
const NODE_ENV = process.env['NODE_ENV'];

if (isValueFromEnum(NodeEnv, NODE_ENV)) {
  dotenv.config({
    path: path.join(process.cwd(), `.env.${NODE_ENV}`),
  });
} else {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unexpected NODE_ENV: ${NODE_ENV}`);
}
