export class JobsConfigService {
  public shouldCallScheduledJobs: boolean;

  constructor(params: { shouldCallScheduledJobs: boolean }) {
    this.shouldCallScheduledJobs = params.shouldCallScheduledJobs;
  }
}
