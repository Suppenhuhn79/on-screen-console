# on-screen-console

This is an onscreen/inpage console/debugger. Using native javascript (ECMAScript 6) it offers **all features** in **one file** and absolutely **zero dependencies!** Great for mobile debugging.

[![ECMAScript6](https://img.shields.io/badge/ECMAScript-6-0066ff)](#)\
[![Standalone](https://img.shields.io/badge/Standalone-yes-33cc33)](#)\
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0)

It hooks into the default `console` functions, so every `console.log()`, `console.warn()`, `console.error()` and `console.debug()` will be written to both, the browsers build-in console and the on-screen-console.

All JavaScript errors will also be logged into on-screen-console (except for those in promises). The amount and value of error-information depends on the browser and error type.

Unfortunately there is no support for `console.trace()` and `console.group()`/`.groupEnd()` yet.

## How to use

Just add `<script src="onscreenconsole.js"></script>` to your HTML file (preferably at the very top of your `<script>`-elements) and then add `console=n` as search parameter to the url (where `n` sets the log level: `1`=debug+info+warn+error, `2`=info+warn+error, `3`=warn+error, `4`=error only).

Take a look at the live demo:

https://suppenhuhn79.github.io/on-screen-console/?console=1

## Inernal commands

`.c` clear the on-screen-console output.

`.fs value` set the font size. _value_ is a number or any valid CSS size specification. Default is `0.8rem`. If no unit is given, `rem` is assumed.

`.mh value` set the maximum height of the output area (not the entire console box!). _value_ is a number or any valid CSS size specification. Default is `30vh`. If no unit is given, `vh` is assumed.

`.od number` (object depth) set the maximum depth of child objects to inspect. With `0` you will be able to only inspect the members of the current object. Default is `2` so you can inspect the current object child und grandchild object. The higher this number, the longer it takes to evaluate objects and the more HTML is generated.

`.x` exit the on-screen-console.

`.zi number` set the z-index of the on-screen-console. Initially console is the very top most element. Be careful to not set the z-index too low.

Shorthand makes it more handy for mobile devices.

## Wanna customize?

You can customize almost everything on the on-screen-console. Just add a CSS stylesheet to your page. Take a look at the _template.css_ in the [github-pages](https://github.com/Suppenhuhn79/on-screen-console/tree/github-pages) branch.
