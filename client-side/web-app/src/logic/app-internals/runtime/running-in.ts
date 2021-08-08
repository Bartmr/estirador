export const RUNNING_IN_SERVER = typeof window === 'undefined';
export const RUNNING_IN_CLIENT = !RUNNING_IN_SERVER;
