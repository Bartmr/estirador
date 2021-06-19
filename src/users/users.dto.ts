export class UserSignupRequestDTO {
  email!: string;
  password!: string;
}

export enum SignupResult {
  Created = 'created',
  AwaitingVerification = 'awaiting-verification',
  AlreadyCreated = 'already-created',
}
