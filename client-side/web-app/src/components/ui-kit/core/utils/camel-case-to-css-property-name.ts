export function camelCaseToCSSPropertyName(camelCasedName: string) {
  return camelCasedName.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
