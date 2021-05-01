import { camelCaseToCSSPropertyName } from '../../utils/camel-case-to-css-property-name';
import { MediaQueryCondition } from './media-queries-types';

function makeMediaQueryConditionString(
  property: keyof MediaQueryCondition,
  value: string,
  index: number,
) {
  const cssProperty = camelCaseToCSSPropertyName(property);

  return `${index === 0 ? '' : ' and '}${cssProperty}: ${value}`;
}

export function makeMediaQueryString(condition: MediaQueryCondition) {
  const properties = Object.keys(condition) as Array<keyof MediaQueryCondition>;

  return `@media (${properties.reduce((acc, property, index) => {
    const value = condition[property];

    return `${acc}${
      value ? makeMediaQueryConditionString(property, value, index) : ''
    }`;
  }, '')})`;
}
