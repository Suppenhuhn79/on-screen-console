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
		logLevel: Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),
		styles:
		{
			"#": "background-color:#006;color:#ccc;font-family:monospace;font-size:0.8rem;position:fixed;top:0px;left:0px;width:100%;margin:0rem;padding:0.5rem;box-sizing:border-box;z-index:" + Number.MAX_SAFE_INTEGER + ";",
			"prompt": "background-color:inherit;color:inherit;font-family:inherit;font-size:inherit;width:100%;border:1px solid #666;outline:none;",
			"output": "white-space:pre;padding:0rem;margin:0rem;max-height:30vh;overflow:scroll;",
			"warn": "color:#dd6;",
			"error": "color:#f66;",
			"internal": "color:#fff;font-style:italic;",
			"number": "color:#2d2;",
			"string": "",
			"object": "color:#3ff;",
			"object.expandable:hover": "text-decoration:underline;cursor:pointer;",
			"function": "color:#acf;font-weight:bold;",
			"ITEM": "display:inline-block;vertical-align:top;margin-right:0.7em;",
			"ITEM:hover": "background-color:#337;"
		},
		prefixes:
		{
			"error": "!",
			"warn": "!",
			"input": "&rarr;",
			"result": "&larr;"
		}
	};
	if ($0.logLevel > 0)
	{
		$0.browserDbg = console.debug;
		$0.browserLog = console.log;
		$0.browserWrn = console.warn;
		$0.browserErr = console.error;
		$0._cache = (key, val) =>
		{
			if (!!localStorage)
			{
				let c = JSON.parse(localStorage.getItem($0.ELEMENT_ID)) ?? {};
				c[key] = val
					localStorage.setItem($0.ELEMENT_ID, JSON.stringify(c));
			};
		};
		$0._log = (rel, ...vals) =>
		{
			let div = document.createElement("div");
			$0.__styleElement(div, "display:block;");
			let prefix = document.createElement("span");
			$0.__styleElement(prefix, "white-space:nowrap;display:inline-block;vertical-align:top;");
			let content = document.createElement("span");
			$0.__styleElement(content, "display:inline-block;vertical-align: top;");
			prefix.innerHTML = $0.prefixes[rel] ?? "&nbsp;";
			prefix.classList.add(rel);
			switch (rel)
			{
			case "input":
				content.innerHTML = vals[0];
				break;
			case "result":
				content = $0.__formattedValue(vals[0], rel, 0);
				if (vals[0]instanceof Error)
				{
					content.classList.add("error");
				};
				break;
			default:
				content.classList.add(rel);
				for (let v = 0, vv = vals[0].length; v < vv; v += 1)
				{
					content.appendChild($0.__formattedValue(vals[0][v], rel, 0));
				};
			};
			prefix.innerHTML += "&nbsp;";
			div.appendChild(prefix);
			div.appendChild(content);
			$0.output.appendChild(div);
			$0.output.scrollTo(0, $0.output.scrollHeight);
		};
		$0.__styleElement = (element, style) =>
		{
			if (style !== undefined)
			{
				let rex = /(.+?):(.+?);/g;
				let rem = rex.exec(style);
				while (rem !== null)
				{
					element.style[rem[1].trim()] = rem[2].trim();
					rem = rex.exec(style);
				};
			};
		};
		$0.__escapeHtml = (val) => String(val).replace("<", "&lt;").replace(">", "&gt;");
		$0.__formatSimpleType = (val, rel) =>
		{
			let span = document.createElement("span");
			if (val === null)
			{
				span.innerHTML = "null";
				span.classList.add("internal");
			}
			else
			{
				switch (typeof val)
				{
				case "undefined":
				case "boolean":
					span.classList.add("internal");
					span.innerHTML = val;
					break;
				case "string":
					if (val === "")
					{
						val = "&lt;empty string&gt;";
						span.classList.add("internal");
					}
					else
					{
						val = val.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
						if (rel === "result")
						{
							span.classList.add("string");
							val = "\"" + val + "\"";
						};
					};
					span.innerHTML = val;
					break;
				case "number":
					span.classList.add("number");
					span.innerHTML = val;
					break;
				case "function":
					span.classList.add("function");
					span.innerHTML = "function" + /\(.*?\)/.exec(val.toString())[0].replaceAll(/[\r\n]/g, "");
					break;
				case "object":
					span.appendChild($0.__formattedValue(val, rel));
					break;
				default:
					span.innerHTML = val;
				};
			};
			return span;
		};
		$0.__classMap = (obj) =>
		{
			let result = [];
			switch (obj.constructor.name.toUpperCase())
			{
			case "WINDOW":
				result.push(obj.location);
				break;
			case "DATE":
				result.push(obj.toString());
				break;
			};
			if (obj instanceof HTMLElement)
			{
				result.push($0.__escapeHtml(/<.+?>/.exec(obj.outerHTML)[0]));
			};
			return result;
		};
		$0.__formattedValue = (val, rel) =>
		{
			let span = document.createElement("span");
			if (val === null)
			{
				span = $0.__formatSimpleType(val, rel);
			}
			else
			{
				switch (typeof val)
				{
				case "object":
					let titleSpan = document.createElement("span");
					titleSpan.innerHTML = ((val.constructor === Array) ? "Array(" + val.length + ")" : val.constructor.name) + " {&hellip;}";
					if (val instanceof Error)
					{
						span.classList.add("error");
						titleSpan.innerHTML = $0.__escapeHtml(val);
						if (val.stack !== undefined)
						{
							let stackSpan = document.createElement("ul");
							$0.__styleElement(stackSpan, "list-style:none;margin:0rem;padding:0rem;");
							let li = document.createElement("li");
							stackSpan.appendChild(li);
							li.innerHTML = val.stack;
							span.appendChild(stackSpan);
						};
					}
					else
					{
						titleSpan.classList.add("object");
						titleSpan.classList.add("expandable");
					};
					titleSpan.onclick = $0.toggleUl;
					span.appendChild(titleSpan);
					break;
				default:
					span = $0.__formatSimpleType(val, rel);
				};
			};
			span.classList.add("ITEM");
			span["__object"] = val;
			return span;
		};
		$0.toggleUl = (evt) =>
		{
			let obj = evt.target.parentElement.__object;
			$0.browserLog("toggleUl:", obj);
			if (!!obj)
			{
				let ul = evt.target.parentElement.querySelector("ul");
				if (ul === null)
				{
					ul = document.createElement("ul");
					$0.__styleElement(ul, "list-style:none;margin:0rem;padding-left:1.4em;display:none;");
					for (let k of $0.__classMap(obj))
					{
						let li = document.createElement("li");
						$0.__styleElement(li, "font-weight:bold;");
						li.innerHTML = k;
						ul.appendChild(li);
					};
					for (let m in obj)
					{
						let li = document.createElement("li");
						let keySpan = document.createElement("span");
						keySpan.innerHTML = m + ":&nbsp;";
						li.appendChild(keySpan);
						try
						{
							li.appendChild($0.__formattedValue(obj[m], "result"));
						}
						catch (ex)
						{
							let e = $0.__formatSimpleType(obj[m], "error", Number.MAX_SAFE_INTEGER);
							e.style.textDecoration = "line-through";
							li.appendChild(e);
						};
						ul.appendChild(li);
					};
					evt.target.parentElement.appendChild(ul);
				};
				ul.style.display = (ul.style.display === "none") ? "initial" : "none";
			};
		};
		/* hijack browser default console functionions */
		console.error = (...vals) =>
		{
			$0.browserErr.apply(this, vals);
			$0._log("error", vals);
		};
		if ($0.logLevel <= 3)
		{
			console.warn = (...vals) =>
			{
				$0.browserWrn.apply(this, vals);
				$0._log("warn", vals);
			};
			if ($0.logLevel <= 2)
			{
				console.log = (...vals) =>
				{
					$0.browserLog.apply(this, vals);
					$0._log("info", vals);
				};
				if ($0.logLevel = 1)
				{
					console.debug = (...vals) =>
					{
						$0.browserDbg.apply(this, vals);
						$0._log("debug", vals);
					};
				};
			};
		};
		/* init */
		$0.body = document.createElement("div");
		$0.body.id = $0.ELEMENT_ID;
		$0.body.classList.add("body");
		$0.output = document.createElement("div");
		$0.output.classList.add("output");
		$0.prompt = document.createElement("input");
		$0.prompt.classList.add("prompt");
		$0.prompt.setAttribute("spellcheck", "false");
		$0.body.appendChild($0.output);
		$0.body.appendChild($0.prompt);
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
				$0._log("input", cmd);
				if (intCmd !== null)
				{
					if ($0.execIntCmd(intCmd[1], intCmd[2]) === false)
					{
						$0._log("error", ["Unrecognized internal command " + intCmd[1]]);
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
							$0._log("result", result);
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
		window.onerror = (msg, url, lineNo, columnNo, error) => $0._log("error", (error instanceof Error) ? [msg] : [msg, url, lineNo, columnNo]);
		window.addEventListener("load", (event) =>
		{
			document.body.appendChild($0.body);
			let style = document.createElement("style");
			document.head.insertBefore(style, document.head.firstChild);
			for (let rules in $0.styles)
				style.sheet.insertRule("#" + $0.ELEMENT_ID + ((rules.startsWith("#")) ? "" : " ." + rules) + " { " + $0.styles[rules] + " }");
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
		$0._log("info", ["Welcome to OnScreenConsole " + $0.VERSION + "!"]);
		$0._log("info", ["https://github.com/suppenhuhn79/on-screen-console"]);
	};
};
