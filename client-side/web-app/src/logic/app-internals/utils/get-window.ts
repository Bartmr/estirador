import { RUNNING_IN_CLIENT } from '../runtime/running-in';

export function getWindow() {
  if (RUNNING_IN_CLIENT) {
    return window;
  } else {
    return undefined;
  }
}
