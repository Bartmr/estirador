import { throwError } from '@app/shared/internals/utils/throw-error';
import { NODE_ENV } from '../environment/node-env.constants';
import { ProcessContext, ProcessType } from './process-context';

let processContext: ProcessContext | undefined = undefined;

export const ProcessContextManager = {
  setContext: (params: {
    type: ProcessType;
    name: string;
    workerId: string;
  }) => {
    processContext = new ProcessContext({
      ...params,
      nodeEnv: NODE_ENV || throwError(),
    });
  },
  getContext: () => processContext || throwError(),
};
