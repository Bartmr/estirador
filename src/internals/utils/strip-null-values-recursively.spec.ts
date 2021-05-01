import { stripNullValuesRecursively } from './strip-null-values-recursively';

describe('Recursively strip null values', () => {
  it('Should strip null values from object', () => {
    const date = new Date();
    const dateAsString = date.toJSON();

    const value = stripNullValuesRecursively({
      a: 2,
      b: null,
      d: date,
    }) as { [key: string]: unknown };

    expect(JSON.stringify(value)).toEqual(
      JSON.stringify({
        a: 2,
        d: dateAsString,
      }),
    );
  });

  it('Should strip null values from class', () => {
    const date = new Date();
    const dateAsString = date.toJSON();

    class A {
      a = 2;
      b = null;
      d = date;
    }

    const value = stripNullValuesRecursively(new A()) as {
      [key: string]: unknown;
    };

    expect(JSON.stringify(value)).toEqual(
      JSON.stringify({
        a: 2,
        d: dateAsString,
      }),
    );
  });

  it('Serialization should convert all undefined and null values in an array to just null values', () => {
    const date = new Date();
    const dateAsString = date.toJSON();

    const value = stripNullValuesRecursively([1, null, 2, undefined, 3, date]);

    expect(JSON.stringify(value)).toEqual(
      JSON.stringify([1, null, 2, undefined, 3, dateAsString]),
    );
  });
});
