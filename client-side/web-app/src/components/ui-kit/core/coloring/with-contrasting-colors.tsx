import { ComponentClass, ReactNode } from 'react';
import { Logger } from 'src/logic/app-internals/logging/logger';
import tinycolor from 'tinycolor2';

type Props<AsHTMLElement extends keyof JSX.IntrinsicElements> = {
  asHTMLElement: AsHTMLElement;
  dominantBackgroundColor: string;
  children?: ReactNode;
  className?: string;
} & JSX.IntrinsicElements[AsHTMLElement];

function isColorDark(color: string): boolean {
  const colorInstance = tinycolor(color);

  if (colorInstance.isValid()) {
    return tinycolor(color).isDark();
  } else {
    Logger.logError(
      'attach-contrasting-colors:is-color-dark:invalid-color',
      new Error(),
      { color },
    );
    return false;
  }
}

export function WithContrastingColors<
  AsHTMLElement extends keyof JSX.IntrinsicElements,
>(props: Props<AsHTMLElement>) {
  const {
    asHTMLElement,
    dominantBackgroundColor,
    children,
    className,
    ...htmlElementProps
  } = props;

  const As = asHTMLElement as unknown as ComponentClass;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const _htmlElementProps = htmlElementProps as any;

  return (
    <As
      {..._htmlElementProps}
      className={`${className || ''} ${
        isColorDark(dominantBackgroundColor)
          ? 'with-light-contrasting-colors'
          : 'with-dark-contrasting-colors'
      }`}
    >
      {children}
    </As>
  );
}
