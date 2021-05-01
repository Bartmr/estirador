export function stringArrayToListString(array: string[]): string {
  return array.reduce((acc, c, i) => `${acc}${i === 0 ? '' : ','}${c}`, '');
}
