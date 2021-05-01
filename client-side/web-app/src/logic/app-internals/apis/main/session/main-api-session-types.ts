export type MainApiSessionData = {
  token: string;
};

export enum LoginAttemptRejection {
  WrongCredentials = 'wc',
}
