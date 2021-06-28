# on-screen-console

This is an onscreen/inpage console/debugger. Using native javascript (ECMAScript 6) it offers **all features** in **one file** and absolutely **zero dependencies!** Great for mobile debugging.

[![Standalone](https://img.shields.io/badge/Standalone-yes-33cc33)](#)\
[![FileSize](https://img.badgesize.io/Suppenhuhn79/on-screen-console/main/onscreenconsole.js?label=File%20size)](#)\
[![ECMAScript6](https://img.shields.io/badge/ECMAScript-6-0066ff)](#)\
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

It hooks into the default `console` functions, so every `console.log()`, `console.warn()`, `console.error()` and `console.debug()` will be written to both, the browsers build-in console and the on-screen-console.

All JavaScript errors (except for those in promises) will also be logged into on-screen-console. The amount and value of error-information depends on the browser and error type.

Unfortunately there is no support for `console.trace()` yet.

## How to use

Just add the script to your HTML file (preferably at the very top of your `<script>`-elements)

```html
<script src="https://suppenhuhn79.github.io/on-screen-console/onscreenconsole.js"></script>
```

and add `?console=n` to the url when calling your page (where `n` sets the log level: `1`=debug+log+info+warn+error, `2`=log+info+warn+error, `3`=warn+error, `4`=error only).

### Take a look at the live demo:

[https://suppenhuhn79.github.io/on-screen-console/demo.html?console=1](https://suppenhuhn79.github.io/on-screen-console/demo.html?console=1)

If you want on-screen-console to be responsive to light or dark mode, add the dark-mode stylesheet to your page:

```html
<link rel="stylesheet" href="https://suppenhuhn79.github.io/on-screen-console/dark.css"/>
```

## Inernal commands

`.ah value` auto hide on-screen-console. _value_ is either `1` (auto hide on) or `0` (auto hide off = console stays fully expanded). Default is `1`.

`.c` clear the on-screen-console output.

`.fs value` set the font size. _value_ is a number or any valid CSS size specification. Default is `0.8rem`. If no unit is given, `rem` is assumed.

`.mh value` set the maximum height of the output area (not the entire console box!). _value_ is a number or any valid CSS size specification. Default is `30vh`. If no unit is given, `vh` is assumed.

`.x` exit the on-screen-console.

`.zi number` set the z-index of the on-screen-console. Initially console is the very top most element. Be careful to not set the z-index too low.

Shorthand makes it more handy for mobile devices.

## Wanna customize?

You can customize almost everything on the on-screen-console. Just add a CSS stylesheet to your page. Take a look at the _template.css_.
