import { getEnumValues } from './get-enum-values';

describe('Get enum values', () => {
  it('Should only return explicit alphanumeric values from enum', () => {
    enum TestEnum {
      A = 'a',
      B = 'b',
    }

    expect(getEnumValues(TestEnum)).toStrictEqual(['a', 'b']);
  });

  it('Should only return explicit numeric values from enum', () => {
    enum TestEnum {
      A,
      B,
    }

    expect(getEnumValues(TestEnum)).toStrictEqual([0, 1]);
  });

  it('Should return all explicit values from enum', () => {
    enum TestEnum {
      A,
      B,
      C = 'c',
      D = 'd',
    }

    expect(getEnumValues(TestEnum)).toStrictEqual([0, 1, 'c', 'd']);
  });
});
