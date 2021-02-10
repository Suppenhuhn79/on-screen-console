# on-screen-console
This is an onscreen/inpage console/debugger. It's vanilla-javascript in **one file** with **all features** and absolutely **zero dependencies**!

It hooks into the default `console` functions, so everything written to console, will also be written to on-screen-console.

All JavaScript errors will also be logged into on-screen-console.

Just add `<script src="onscreenconsole.js"></script>` to your HTML file and then add `console=n` as search parameter to the url (where `n` sets the log level: `1`=debug+info+warn+error, `2`=info+warn+error, `3`=warn+error, `4`=error only).

Take a look at the live demo:

https://suppenhuhn79.github.io/on-screen-console/?console=1

## Inernal commands
`:clear` clears the on-screen-console output

`:exit` exits the on-screen-console

(Yes, type colon and no space)

## Wanna customize?
You can customize almost everything on the on-screen-console. Just add a CSS stylesheet to your page. Here's the selectors:

`#on-screen-console` Consoles main body

`.prompt` Input prompt

`.output` output area

`.debug` Output beeing generated via `console.debug()`

`.warn` Output beeing generated via `console.warn()`

`.error` Output beeing generated via `console.error()` and errors

`.internal` Internal types like `undefined`, `null`, booean values

`.number` Numbers

`.object` Objects

`.function` Functions

`.ITEM` Output item
