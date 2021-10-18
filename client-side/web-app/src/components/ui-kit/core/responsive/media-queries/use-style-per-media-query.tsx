import { camelCaseToCSSPropertyName } from '../../utils/camel-case-to-css-property-name';

function styleToCSSString(style: {
  [K in keyof React.CSSProperties]: React.CSSProperties[K];
}) {
  return Object.entries<string | undefined | number>(style)
    .map(([k, v]) => {
      if (typeof v === 'undefined') {
        return '';
      }

      return `${camelCaseToCSSPropertyName(k)}:${v};`;
    })
    .join('\n    ');
}

export function useStylePerMediaQuery(params: {
  htmlClass: string;
  appendSelector?: string;
  stylePerMediaQuery: {
    [mediaQueryString: string]: React.CSSProperties;
  };
}) {
  const { htmlClass, appendSelector, stylePerMediaQuery } = params;

  const mediaQueries = Object.keys(stylePerMediaQuery);

  return {
    htmlClass,
    styleJSX: (
      <style>
        {`${mediaQueries.reduce((acc, c) => {
          const mediaQuery = c;
          const style = stylePerMediaQuery[mediaQuery] || {};

          return `${acc}
${mediaQuery} {
  .${htmlClass}${appendSelector || ''} {
    ${styleToCSSString(style)}
  }
}`;
        }, '')}`}
      </style>
    ),
  };
}
