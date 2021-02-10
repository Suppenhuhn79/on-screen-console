# on-screen-console
This is an onscreen/inpage console/debugger. It's vanilla-javascript with **all features** in **one file** and absolutely **zero dependencies**!

It hooks into the default `console` functions, so everything written to console, will also be written to on-screen-console.

All JavaScript errors will also be logged into on-screen-console.

Just add `<script src="onscreenconsole.js"></script>` to your HTML file and then add `console=n` as search parameter to the url (where `n` sets the log level: `1`=debug+info+warn+error, `2`=info+warn+error, `3`=warn+error, `4`=error only).

Take a look at the live demo:

https://suppenhuhn79.github.io/on-screen-console/demo-page.html?console=1

## Inernal commands

`:clr` clears the on-screen-console output

`:x` exits the on-screen-console

`:mh value` sets the maximum height of the output. _value_ is any valid CSS size specification. This should always be less than 100vh or 100% (consider padding and input prompt size).

`:fs value` sets the font size. _value_ is any valid CSS size specification.

`zi: number` sets the z-index of the on-screen-console. Initially console is the very top most element. Be careful to not set the z-index too low.

Shorthand makes it more handy for mobile devices. And yes, type colon and no space.

## Wanna customize?
You can customize almost everything on the on-screen-console. Just add a CSS stylesheet to your page. Here's a blank template:

```css
#on-screen-console { /* Consoles main body */
}
#on-screen-console .prompt { /* Input prompt */
}
#on-screen-console .output { /* output area */
}
#on-screen-console .debug { /* Output beeing generated via console.debug() */
}
#on-screen-console .warn { /* Output beeing generated via console.warn() */
}
#on-screen-console .error { /* Output beeing generated via console.error() and errors */
}
#on-screen-console .internal { /* Internal types like undefined, null, booean values */
}
#on-screen-console .number { /* Numbers */
}
#on-screen-console .string { /* Strings */
}
#on-screen-console .object { /* Objects */
}
#on-screen-console .function { /* Functions */
}
#on-screen-console .ITEM { /* Output item */
}
```
