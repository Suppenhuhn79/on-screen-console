"use strict";

/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */

if (/\bconsole=[1-4]\b/i.test(window.location.search))
{
	let $0 =
	{
		VERSION: "v1.3",
		ELEMENT_ID: "on-screen-console",
		LOG_LEVEL: Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),
		STYLES:
		{
			"": "background-color:#006;color:#ccc;font-family:monospace;font-size:0.8rem;position:fixed;top:0px;left:0px;width:100%;margin:0rem;padding:0.5rem;box-sizing:border-box;z-index:" + Number.MAX_SAFE_INTEGER + ";",
			"ul": "list-style:none;margin:0rem;padding:0rem;",
			"li": "color:#ccc;",
			"input": "background-color:inherit;color:inherit;font-family:inherit;font-size:inherit;width:100%;border:1px solid #666;outline:none;",
			".output": "white-space:pre;padding:0rem;margin:0rem;max-height:30vh;overflow:scroll;",
			".warn": "color:#dd6;",
			".error": "color:#f66;",
			".internal,.boolean,.undefined": "color:#fff;font-style:italic;",
			".number": "color:#2d2;",
			".string": "color:#ccc;",
			".object": "color:#3ff;",
			".object .expandable:hover": "text-decoration:underline;cursor:pointer;",
			".function": "color:#acf;font-weight:bold;",
			".ITEM": "display:inline-block;vertical-align:top;margin-right:0.7em;",
			".ITEM:hover": "background-color:#448;",
			".objdesc": "color:#999;"
		},
		PREFIXES:
		{
			"error": "!",
			"warn": "!",
			"input": "&gt;",
			"result": "&lt;"
		}
	};
	if ($0.LOG_LEVEL > 0)
	{
		$0.browserDbg = console.debug;
		$0.browserLog = console.log;
		$0.browserWrn = console.warn;
		$0.browserErr = console.error;
		$0.newEle = (eleDef, ...vals) =>
		{
			let result = document.createElement(/^[^#.\s]+/.exec(eleDef)[0]);
			let cssClassesRex = /\.([^.\s]+)/g,
			cssClassMatch;
			while (cssClassMatch = cssClassesRex.exec(eleDef))
				result.classList.add(cssClassMatch[1]);
			for (let val of vals)
			{
				if (["String", "Number"].includes(val.constructor.name))
				{
					result.innerHTML = val;
				}
				else if (val instanceof HTMLElement)
				{
					result.appendChild(val);
				};
			};
			return result;
		};
		$0._cache = (key, dat) =>
		{
			if (!!localStorage)
			{
				let c = JSON.parse(localStorage.getItem($0.ELEMENT_ID)) ?? {};
				c[key] = dat;
				localStorage.setItem($0.ELEMENT_ID, JSON.stringify(c));
			};
		};
		$0.write = (rel, ...vals) =>
		{
			let content = $0.newEle("span");
			switch (rel)
			{
			case "input":
				content.innerHTML = vals[0];
				break;
			case "result":
				content = $0._formatValue(vals[0], rel);
				break;
			default:
				content.classList.add(rel);
				for (let v of vals[0])
					content.appendChild($0._formatValue(v, rel));
			};
			$0.output.appendChild($0.newEle("div", $0.newEle("span." + rel, ($0.PREFIXES[rel] ?? "&nbsp;") + "&nbsp;"), content));
			$0.output.scrollTo(0, $0.output.scrollHeight);
		};
		$0._formatValue = (val, rel) =>
		{
			const __escapeHtml = (val) => String(val).replaceAll("<", "&lt;").replaceAll(">", "&gt;");
			const __objEle = (obj) =>
			{
				let objConstr = obj.constructor.name;
				let objEle = $0.newEle("span.expandable", objConstr);
				objEle.onclick = $0.toggleUl;
				objEle["__object"] = obj;
				let objDesc = null;
				switch (objConstr.toLowerCase())
				{
				case "window":
					objDesc = obj.location.toString();
					break;
				case "date":
					objDesc = obj.toString();
					break;
				case "array":
					objDesc = "(" + obj.length + ")";
					break;
				};
				if (obj instanceof Element)
				{
					objDesc = __escapeHtml(/<.+?>/.exec(obj.outerHTML)[0]);
				};
				return (!!objDesc) ? $0.newEle("span", objEle, $0.newEle("span.objdesc", "&#32;" + objDesc)) : objEle;
			};
			let span = $0.newEle("span");
			if (val === null)
			{
				span.innerHTML = "null";
				span.classList.add("internal");
			}
			else
			{
				span.classList.add(typeof val);
				switch (typeof val)
				{
				case "undefined":
				case "boolean":
					span.innerHTML = val;
					break;
				case "string":
					if (val === "")
					{
						val = "&lt;empty string&gt;";
						span.classList.add("internal");
					}
					else if (rel === "result")
					{
						val = "\"" + val + "\"";
					};
					span.innerHTML = __escapeHtml(val);
					break;
				case "number":
					span.innerHTML = val;
					break;
				case "function":
					span.innerHTML = "function" + /\(.*?\)/.exec(val.toString())[0].replaceAll(/[\r\n]/g, "");
					break;
				case "object":
					if (val instanceof Error)
					{
						span.appendChild($0.newEle("span.error", __escapeHtml(val)));
						if (!!val.stack)
						{
							span.appendChild($0.newEle("ul", $0.newEle("li.error", val.stack)));
						};
					}
					else
					{
						span.appendChild(__objEle(val));
					};
					break;
				default:
					span.innerHTML = __escapeHtml(val);
				};
			};
			span.classList.add("ITEM");
			return span;
		};
		$0.toggleUl = (evt) =>
		{
			let obj = evt.target.__object;
			if (!!obj)
			{
				let ul = evt.target.parentElement.querySelector("ul");
				if (ul === null)
				{
					ul = $0.newEle("ul");
					for (let mem in obj)
					{
						let li = $0.newEle("li", $0.newEle("span", mem + ":&nbsp;"));
						try
						{
							li.appendChild($0._formatValue(obj[mem], "result"));
						}
						catch (ex)
						{
							let e = $0._formatValue(obj[mem], "error");
							e.style.textDecoration = "line-through";
							li.appendChild(e);
						};
						ul.appendChild(li);
					};
					evt.target.parentElement.appendChild(ul);
				};
				ul.style.display = (ul.style.display !== "initial") ? "initial" : "none";
			};
		};
		/* hijack browser default console functionions */
		console.error = (...vals) =>
		{
			$0.browserErr.apply(this, vals);
			$0.write("error", vals);
		};
		if ($0.LOG_LEVEL <= 3)
		{
			console.warn = (...vals) =>
			{
				$0.browserWrn.apply(this, vals);
				$0.write("warn", vals);
			};
			if ($0.LOG_LEVEL <= 2)
			{
				console.log = (...vals) =>
				{
					$0.browserLog.apply(this, vals);
					$0.write("info", vals);
				};
				if ($0.LOG_LEVEL = 1)
				{
					console.debug = (...vals) =>
					{
						$0.browserDbg.apply(this, vals);
						$0.write("debug", vals);
					};
				};
			};
		};
		/* init */
		$0.output = $0.newEle("div.output");
		$0.prompt = $0.newEle("input");
		$0.prompt.setAttribute("spellcheck", "false");
		$0.body = $0.newEle("div.body", $0.output, $0.prompt);
		$0.body.id = $0.ELEMENT_ID;
		$0.history = [];
		$0.historyPosition = 0;
		$0.execIntCmd = (cmd, arg) =>
		{
			let sizeArg = /([\d\.]+)(\w*)?/.exec(arg);
			let cmds =
			{
				"c": () =>
				{
					while (!!$0.output.firstElementChild)
						$0.output.firstElementChild.remove();
				},
				"fs": () => $0.body.style.fontSize = sizeArg[1] + (sizeArg[2] ?? "rem"),
				"mh": () => $0.output.style.maxHeight = sizeArg[1] + (sizeArg[2] ?? "vh"),
				"x": () =>
				{
					console.debug = $0.browserDbg;
					console.log = $0.browserLog;
					console.warn = $0.browserWrn;
					console.error = $0.browserErr;
					document.body.removeChild($0.body);
				},
				"zi": () => $0.body.style.zIndex = arg
			};
			return (!!cmds[cmd]) ? (cmds[cmd]() ?? true) : false;
		};
		$0.prompt.onkeydown = (keypressEvent) =>
		{
			switch (keypressEvent.keyCode)
			{
			case 33: /* pg up */
				$0.output.scrollBy(0, 0 - ($0.output.clientHeight - 10));
				break;
			case 34: /* pg dn*/
				$0.output.scrollBy(0, ($0.output.clientHeight - 10));
				break;
			case 38: /* up */
				if ($0.historyPosition > 0)
				{
					$0.historyPosition -= 1;
					$0.prompt.value = $0.history[$0.historyPosition];
					setTimeout(() =>
					{
						let inputLength = $0.prompt.value.length;
						$0.prompt.selectionStart = inputLength;
						$0.prompt.selectionEnd = inputLength;
					}, 1);
				};
				break;
			case 40: /* dn */
				if ($0.historyPosition < $0.history.length)
				{
					$0.historyPosition += 1;
					if ($0.historyPosition === $0.history.length)
					{
						$0.prompt.value = "";
					}
					else
					{
						$0.prompt.value = $0.history[$0.historyPosition];
					};
				};
				break;
			};
		};
		$0.prompt.onkeypress = (keypressEvent) =>
		{
			if (keypressEvent.keyCode === 13)
			{
				keypressEvent.stopPropagation();
				let cmd = keypressEvent.target.value;
				let intCmd = /^\.(\w+)(?:\s+(.+))?/.exec(cmd);
				$0.historyPosition = ($0.history[$0.history.length - 1] !== cmd) ? $0.history.push(cmd) : $0.history.length;
				$0.write("input", cmd);
				if (intCmd !== null)
				{
					if ($0.execIntCmd(intCmd[1], intCmd[2]) === false)
					{
						$0.write("error", ["Unrecognized internal command " + intCmd[1]]);
					}
					else
					{
						$0._cache(intCmd[1], intCmd[2]);
					};
				}
				else
				{
					$0._cache("history", $0.history);
					try
					{
						let result = eval(cmd);
						if (cmd.trim().startsWith("console.") === false)
						{
							$0.write("result", result);
						};
					}
					catch (ex)
					{
						console.error(ex);
					};
				};
				$0.prompt.value = "";
				$0.prompt.focus();
			};
		};
		window.onerror = (msg, url, lineNo, columnNo, error) => $0.write("error", (error instanceof Error) ? [msg] : [msg, url, lineNo, columnNo]);
		window.addEventListener("load", (event) =>
		{
			document.body.appendChild($0.body);
			let style = $0.newEle("style");
			document.head.insertBefore(style, document.head.firstChild);
			for (let rules in $0.STYLES)
				style.sheet.insertRule("#" + $0.ELEMENT_ID + " " + rules + " { " + $0.STYLES[rules] + " }");
		}
		);
		/* restore settings */
		if (!!localStorage)
		{
			let c = JSON.parse(localStorage.getItem($0.ELEMENT_ID)) ?? {};
			for (let k in c)
				$0.execIntCmd(k, c[k]);
			$0.history = c.history ?? [];
			$0.historyPosition = $0.history.length;
		};
		$0.write("info", ["Welcome to OnScreenConsole " + $0.VERSION + "!"]);
		$0.write("info", ["https://github.com/suppenhuhn79/on-screen-console"]);
	};
};
