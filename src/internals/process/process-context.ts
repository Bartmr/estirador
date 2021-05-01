export enum ProcessType {
  WebServer = 'web-server',
  Job = 'job',
  Script = 'script',
  Testing = 'testing',
}

export class ProcessContext {
  id: string;

  constructor(params: {
    type: ProcessType;
    name: string;
    nodeEnv: string;
    workerId: string;
  }) {
    this.id = `${params.type}:${params.name}:${params.nodeEnv}:${params.workerId}`;
  }
}
