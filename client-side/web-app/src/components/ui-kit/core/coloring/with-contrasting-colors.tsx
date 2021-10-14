import { ComponentClass, ReactNode } from 'react';
import { Logger } from 'src/logic/app-internals/logging/logger';
import tinycolor from 'tinycolor2';

type Props<AsHTMLElement extends keyof JSX.IntrinsicElements> = {
  asHTMLElement: AsHTMLElement;
  dominantBackgroundColor: string;
  children?: ReactNode;
  className?: string;
  justAttachTheColors?: boolean;
} & JSX.IntrinsicElements[AsHTMLElement];

export function WithContrastingColors<
  AsHTMLElement extends keyof JSX.IntrinsicElements,
>({
  asHTMLElement,
  dominantBackgroundColor,
  children,
  className,
  justAttachTheColors,
  ...htmlElementProps
}: Props<AsHTMLElement>) {
  const As = asHTMLElement as unknown as ComponentClass;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const _htmlElementProps = htmlElementProps as any;

  const colorInstance = tinycolor(dominantBackgroundColor);

  if (colorInstance.isValid()) {
    const isDarkBackgroundColor = tinycolor(colorInstance).isDark();

    return (
      <As
        {..._htmlElementProps}
        className={`${className || ''} ${
          justAttachTheColors ? 'attach' : 'with'
        }-${
          isDarkBackgroundColor
            ? 'light-contrasting-colors'
            : 'dark-contrasting-colors'
        }`}
      >
        {children}
      </As>
    );
  } else {
    Logger.logError('with-contrasting-colors:invalid-color', new Error(), {
      color: dominantBackgroundColor,
    });

    return <>{children}</>;
  }
}
