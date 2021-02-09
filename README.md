# on-screen-console
This is an onscreen/inpage console/debugger. It's vanilla-javascript in **one file** with **all features** and absolutely **zero dependencies**!

Just add `<script src="onscreenconsole.js"></script>` to your HTML file and then add `console=n` as search parameter to the url (where `n` sets the log level: `1`=debug+info+warn+error, `2`=info+warn+error, `3`=warn+error, `4`=error only).

Everything written to console, will also be written to on-screen-console.

## Inernal commands
`:clear` clears the on-screen-console output

`:exit` exits the on-screen-console

(Yes, type colon and no space)

## Wanna customize?
You can customize almost everything on the on-screen-console via `_osc.styles`. It uses common CSS.
