## Development

### Development Tools:

- **[SCSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=mrmlnc.vscode-scss)**: helps locating functions and shows method calls information.

### CSS:

#### Colors and Dark Mode:

**While background colors can be freely used, text and element colors must contrast the background colors, in order to ensure readability and accessibility**. For that case, this project encourages you to use _SASS_ compatible color values for background colors, and let the text and element colors be picked by a system based on _CSS Custom Properties / CSS variables_. If you want to override a text color, you need to get the desired color by calling:

- `get-contrasting-color('color-name')` to get a contrasting color
- `set-contrasting-color-alpha('color-name')` to get the a contrasting color and set its opacity

If you create a new CSS class with a background and you want the text inside of it to be automatically contrasted, just call `@include with-contrasting-colors($background-color-sass-variable);` and set the child elements contrasting text color. Here's an example:

```scss
.filled-box {
  $color-name: primary;

  background-color: get-theme-color($color-name);

  @include with-contrasting-colors(get-theme-color($color-name));

  /* Set colors for dark mode */
  @include on-inverted-color-scheme {
    background-color: get-inverted-theme-color($color-name);

    @include with-contrasting-colors(get-inverted-theme-color($color-name));
  }
}
```

**To see which text colors are available to you and their names**, check the `$contrasting-colors-names` variable in `client-side/web-app/src/components/ui-kit/global-styles/_variables.scss`.

There's also a React component implementation of the `with-contrasting-colors` mixin, for when you need to colors that contrast with a background color that is generated during runtime. It's in `client-side/web-app/src/components/ui-kit/core/coloring/with-contrasting-colors`, and when using it you need to pass the same `dominantBackgroundColor` as you would normally do in _SASS_, and also decide which HTML element will be rendered with those color _CSS Custom Properties_ attached.

### Useful snippets:

- **// @refresh reset**: Sometimes you might want to force the state to be reset, and a component to be remounted. For example, this can be handy if you're tweaking an animation that only happens on mount. To do this, you can add this snippet anywhere in the file you're editing. This directive is local to the file, and instructs Fast Refresh to remount components defined in that file on every edit.

### Recipes

#### Replace Bootstrap and SASS with another UI library

- `$ npm uninstall --save bootstrap react-bootstrap gatsby-plugin-sass` **`(node-sass or sass)`** `@fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome tinycolor2`
- `$ npm uninstall --save-dev @types/tinycolor2`
- Inspect `package.json` for any more packages that are no longer needed, and uninstall them
- Remove `gatsby-plugin-sass` from `gatsby-config`
- Delete `src/components/ui-kit/global-styles` and any other _SCSS_ and _Sass_ files that are present in this project
- Delete `src/components/ui-kit/components/icons`
- Delete `src/components/ui-kit/core/coloring/with-contrasting-colors.tsx`
- Fix any import errors that might arise
- Install and setup UI library of choice
- Search for all files containing `className` and change their implementations in order to work with the UI library you chose
