import { PreRenderHTMLArgs } from 'gatsby';
import { attachFontsProviders } from './components/ui-kit/fonts-ssr-apis';
import sortBy from 'lodash/sortBy';

export function onPreRenderHTML(args: PreRenderHTMLArgs) {
  attachFontsProviders(args);

  const headComponents = args.getHeadComponents() as Array<
    React.ReactNode & { type?: string }
  >;

  args.replaceHeadComponents(
    sortBy(
      sortBy(headComponents, (c) => {
        return c.type === 'link' ? 1 : 0;
      }),
      (c) => {
        return c.type === 'style' ||
          c.type === 'script' ||
          c.type === 'noscript'
          ? 1
          : 0;
      },
    ),
  );
}
