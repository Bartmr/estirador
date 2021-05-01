export function isRunningOnServer() {
  return typeof window === 'undefined';
}

export function isRunningOnClient() {
  return !isRunningOnServer();
}
