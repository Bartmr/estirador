const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '<circular reference>';
      }
      seen.add(value);
    }
    return value;
  };
};

export function stringifySafely(value: unknown): string {
  return JSON.stringify(value, getCircularReplacer());
}
