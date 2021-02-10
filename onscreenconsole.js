"use strict";

/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */

if (/\bconsole=\d\b/i.test(window.location.search))
{
	let _osc =
	{
		VERSION: "v1.0",
		ELEMENT_ID: "on-screen-console",
		logLevel: Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),
		styles:
		{
			"#": "background-color:#006;color:#bbb;font-family:monospace;font-size:small;position:fixed;top:0px;left:0px;width:100%;margin:0rem;padding:0.5rem;z-index:" + Number.MAX_SAFE_INTEGER + ";",
			"prompt": "background-color:inherit;color:inherit;font-family:inherit;width:100%;border:1px solid #666;outline:none;",
			"output": "white-space:pre;padding:0rem;margin:0rem;max-height:60vh;overflow:scroll;",
			"warn": "color:#dd6;",
			"error": "color:#f66;",
			"internal": "color:#fff;font-style:italic;",
			"number": "color:#2d2;",
			"string": "",
			"object": "color:#3ff;",
			"function": "color:#acf;",
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
	if (_osc.logLevel > 0)
	{
		_osc.browserDbg = console.debug;
		_osc.browserLog = console.log;
		_osc.browserWrn = console.warn;
		_osc.browserErr = console.error;
		_osc._log = (rel, ...vals) =>
		{
			function __styleElement(element, style)
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
			function __formatSimpleType(val, rel)
			{
				let span = document.createElement("span");
				span.innerHTML = val;
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
					default:
						span.classList.add("object");
						span.innerHTML = val.constructor.name;
					};
				};
				return span;
			};
			function __classMap(obj)
			{
				let result = [];
				switch (obj.constructor.name.toUpperCase())
				{
				case "WINDOW":
					result.push(obj.location);
					break;
				};
				if (obj instanceof HTMLElement)
				{
					result.push(/<.+?>/.exec(obj.outerHTML)[0].replace("<", "&lt;").replace(">", "&gt;"));
				};
				return result;
			};
			function __formattedValue(val, rel)
			{
				let span = document.createElement("span");
				if (val === null)
				{
					span = __formatSimpleType(val, rel);
				}
				else
				{
					switch (typeof val)
					{
					case "object":
						let titleSpan = document.createElement("span");
						titleSpan.innerHTML = (val.constructor === Array) ? "Array(" + val.length + ")" : val.constructor.name;
						span.appendChild(titleSpan);
						if (val instanceof Error)
						{
							span.classList.add("error");
							titleSpan.innerHTML = val;
							if (val.stack !== undefined)
							{
								let stackSpan = document.createElement("ul");
								__styleElement(stackSpan, "list-style: none; margin: 0rem; padding: 0rem;");
								let li = document.createElement("li");
								stackSpan.appendChild(li);
								li.innerHTML = val.stack;
								span.appendChild(stackSpan);
							};
						}
						else
						{
							titleSpan.classList.add("object");
							let ul = document.createElement("ul");
							__styleElement(ul, "list-style: none; margin: 0rem; padding-left: 1.4em;");
							let classMap = __classMap(val);
							if (classMap.length > 0)
							{
								for (let m of classMap)
								{
									let li = document.createElement("li");
									li.innerHTML = m;
									ul.appendChild(li);
								};
							}
							else
							{
								for (let m in val)
								{
									let li = document.createElement("li");
									let keySpan = document.createElement("span");
									keySpan.innerHTML = m + ":&nbsp;";
									li.appendChild(keySpan);
									li.appendChild(__formatSimpleType(val[m], "result"));
									ul.appendChild(li);
								};
							};
							span.appendChild(ul);
						};
						break;
					default:
						span = __formatSimpleType(val, rel);
					};
				};
				span.classList.add("ITEM");
				return span;
			};
			let div = document.createElement("div");
			__styleElement(div, "display: block;");
			let prefix = document.createElement("span");
			__styleElement(prefix, "white-space: nowrap; display: inline-block; vertical-align: top;");
			let content = document.createElement("span");
			__styleElement(content, "display: inline-block; vertical-align: top;");
			prefix.innerHTML = (_osc.prefixes[rel] !== undefined) ? _osc.prefixes[rel] : "&nbsp;";
			prefix.classList.add(rel);
			switch (rel)
			{
			case "input":
				content.innerHTML = vals[0];
				break;
			case "result":
				content = __formattedValue(vals[0], rel);
				if (vals[0]instanceof Error)
				{
					content.classList.add("error");
				};
				break;
			default:
				content.classList.add(rel);
				for (let v = 0, vv = vals[0].length; v < vv; v += 1)
				{
					content.appendChild(__formattedValue(vals[0][v], rel));
				};
			};
			prefix.innerHTML += "&nbsp;";
			div.appendChild(prefix);
			div.appendChild(content);
			_osc.output.appendChild(div);
		};
		/* hijack browser default console functionions */
		console.error = (...vals) =>
		{
			_osc.browserErr.apply(this, vals);
			_osc._log("error", vals);
		};
		if (_osc.logLevel <= 3)
		{
			console.warn = (...vals) =>
			{
				_osc.browserWrn.apply(this, vals);
				_osc._log("warn", vals);
			};
			if (_osc.logLevel <= 2)
			{
				console.log = (...vals) =>
				{
					_osc.browserLog.apply(this, vals);
					_osc._log("info", vals);
				};
				if (_osc.logLevel = 1)
				{
					console.debug = (...vals) =>
					{
						_osc.browserDbg.apply(this, vals);
						_osc._log("debug", vals);
					};
				};
			};
		};
		/* init */
		_osc.body = document.createElement("div");
		_osc.body.id = _osc.ELEMENT_ID;
		_osc.body.classList.add("body");
		_osc.output = document.createElement("div");
		_osc.output.classList.add("output");
		_osc.prompt = document.createElement("input");
		_osc.prompt.classList.add("prompt");
		_osc.prompt.setAttribute("spellcheck", "false");
		_osc.body.appendChild(_osc.output);
		_osc.body.appendChild(_osc.prompt);
		_osc.history = [];
		_osc.historyPosition = 0;
		_osc.prompt.onkeydown = (keypressEvent) =>
		{
			switch (keypressEvent.keyCode)
			{
			case 33: /* pg up */
				_osc.output.scrollBy(0, 0 - (_osc.output.clientHeight - 10));
				break;
			case 34: /* pg dn*/
				_osc.output.scrollBy(0, (_osc.output.clientHeight - 10));
				break;
			case 38: /* up */
				if (_osc.historyPosition > 0)
				{
					_osc.historyPosition -= 1;
					_osc.prompt.value = _osc.history[_osc.historyPosition];
					setTimeout(() =>
					{
						let inputLength = _osc.prompt.value.length;
						_osc.prompt.selectionStart = inputLength;
						_osc.prompt.selectionEnd = inputLength;
					}, 1);
				};
				break;
			case 40: /* dn */
				if (_osc.historyPosition < _osc.history.length)
				{
					_osc.historyPosition += 1;
					if (_osc.historyPosition === _osc.history.length)
					{
						_osc.prompt.value = "";
					}
					else
					{
						_osc.prompt.value = _osc.history[_osc.historyPosition];
					};
				};
				break;
			};
		};
		_osc.prompt.onkeypress = (keypressEvent) =>
		{
			if (keypressEvent.keyCode === 13)
			{
				keypressEvent.stopPropagation();
				let cmd = keypressEvent.target.value;
				let intCmd = /^:(\w+)(?:\s+(.+))?/.exec(cmd);
				_osc.historyPosition = _osc.history.push(cmd);
				if (intCmd !== null)
				{
					switch (intCmd[1])
					{
					case "clr":
						for (let e of _osc.output.querySelectorAll("div"))
						{
							_osc.output.removeChild(e);
						};
						break;
					case "x":
						console.debug = _osc.browserDbg;
						console.log = _osc.browserLog;
						console.warn = _osc.browserWrn;
						console.error = _osc.browserErr;
						document.body.removeChild(_osc.body);
						break;
					case "mh":
						_osc.output.style.maxHeight = intCmd[2];
						break;
					case "fs":
						_osc.body.style.fontSize = intCmd[2];
						break;
					default:
						_osc._log("error", ["Unrecognized internal command " + intCmd[1]]);
					};
				}
				else
				{
					_osc._log("input", cmd);
					try
					{
						let result = eval(cmd);
						if (cmd.trim().startsWith("console.") === false)
						{
							_osc._log("result", result);
						};
					}
					catch (ex)
					{
						console.error(ex);
					};
				};
				keypressEvent.target.value = "";
				_osc.prompt.focus();
				_osc.output.scrollTo(0, _osc.output.scrollHeight);
			};
		};
		window.onerror = (msg, url, lineNo, columnNo, error) => _osc._log("error", [error]);
		window.addEventListener("load", (event) =>
		{
			document.body.appendChild(_osc.body);
			let style = document.createElement("style");
			document.head.insertBefore(style, document.head.firstChild);
			for (let rules in _osc.styles)
			{
				let selector = (rules.startsWith("#")) ? "#" + _osc.ELEMENT_ID : "#" + _osc.ELEMENT_ID + " ." + rules;
				style.sheet.insertRule(selector + " { " + _osc.styles[rules] + " }");
			};
		}
		);
		_osc._log("info", ["Welcome to OnScreenConsole " + _osc.VERSION + "!"]);
		_osc._log("info", ["Copyright 2021 Christoph Zager"]);
		_osc._log("info", ["Licensed under the Apache License, Version 2.0"]);
		_osc._log("info", ["https://github.com/suppenhuhn79/on-screen-console"]);
	};
};
