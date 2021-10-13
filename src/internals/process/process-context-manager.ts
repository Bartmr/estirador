import { throwError } from 'libs/shared/src/internals/utils/throw-error';
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
    });
  },
  getContext: () => processContext || throwError(),
};
