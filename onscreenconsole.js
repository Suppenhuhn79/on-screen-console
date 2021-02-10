"use strict";

/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */

if (/\bconsole=\d\b/i.test(window.location.search) === true)
{
	let _osc =
	{
		"VERSION": "v1.0",
		"ELEMENT_ID": "on-screen-console",
		"logLevel": Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),
		"styles":
		{
			"#": "background-color: #006; color: #bbb; font-family: monospace; position: fixed; top: 0px; left: 0px; width: 100%; margin: 0rem; padding: 0.5rem; z-index: " + Number.MAX_SAFE_INTEGER + ";",
			"prompt": "background-color: inherit; color: inherit; font-family: inherit; width: 100%; border: 1px solid #666; outline: none;",
			"output": "white-space: pre; padding: 0rem; margin: 0rem; max-height: 60vh; overflow: scroll;",
			"warn": "color: #dd6;",
			"error": "color: #f66;",
			"internal": "color: #fff; font-style: italic;",
			"number": "color: #2d2;",
			"object": "color: #3ff;",
			"function": "color: #acf;",
			"ITEM": "display: inline-block; vertical-align: top; margin-right: 0.7em;",
			"ITEM:hover": "background-color: #008;"
		},
		"prefixes":
		{
			"error": "!",
			"warn": "!",
			"input": "&rarr;",
			"result": "&larr;"
		}
	};
	if (_osc.logLevel > 0)
	{
		_osc.test = (a) => window.alert(a);
		_osc.browserConsoleDebug = console.debug;
		_osc.browserConsoleLog = console.log;
		_osc.browserConsoleWarn = console.warn;
		_osc.browserConsoleError = console.error;
		_osc._log = (kind, ...values) =>
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
			function __formatSimpleType(value, kind)
			{
				let span = document.createElement("span");
				span.innerHTML = value;
				let valueType = typeof value;
				if (value === null)
				{
					span.innerHTML = "null";
					span.classList.add("internal");
				}
				else
				{
					switch (valueType)
					{
					case "undefined":
					case "boolean":
						span.classList.add("internal");
						break;
					case "string":
						if (value === "")
						{
							value = "&lt;empty string&gt;";
							span.classList.add("internal");
						}
						else
						{
							value = value.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
							if (kind === "result")
							{
								value = "\"" + value + "\"";
							};
						};
						span.innerHTML = value;
						break;
					case "number":
						span.classList.add("number");
						span.innerHTML = value;
						break;
					case "function":
						span.classList.add("function");
						span.innerHTML = "function" + /\(.*?\)/.exec(value.toString())[0].replaceAll(/[\r\n]/g, "");
						break;
					default:
						span.classList.add("object");
						span.innerHTML = "[object " + value.constructor.name + "]";
					};
				};
				span.classList.add("ITEM");
				return span;
			};
			function __formattedValue(value, kind)
			{
				let span = document.createElement("span");
				if (value === null)
				{
					span = __formatSimpleType(value, kind);
				}
				else
				{
					switch (typeof value)
					{
					case "object":
						let titleSpan = document.createElement("span");
						titleSpan.innerHTML = (value.constructor === Array) ? "Array(" + value.length + ")\n" : value.toString() + "\n";
						span.appendChild(titleSpan);
						if ((value instanceof Error) === true)
						{
							titleSpan.innerHTML = value;
							if (value.stack !== undefined)
							{
								let stackSpan = document.createElement("ul");
								__styleElement(stackSpan, "list-style: none; margin: 0rem; padding: 0rem;");
								let li = document.createElement("li");
								stackSpan.appendChild(li);
								li.innerHTML = value.stack;
								span.appendChild(stackSpan);
							};
						}
						else
						{
							titleSpan.classList.add("object");
							let ul = document.createElement("ul");
							__styleElement(ul, "list-style: none; margin: 0rem; padding-left: 1.4em;");
							for (let m in value)
							{
								{
									let li = document.createElement("li");
									let keySpan = document.createElement("span");
									keySpan.innerHTML = m + ":&nbsp;";
									li.appendChild(keySpan);
									li.appendChild(__formatSimpleType(value[m], kind));
									ul.appendChild(li);
								};
								span.appendChild(ul);
							};
						};
						break;
					default:
						span = __formatSimpleType(value, kind);
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
			prefix.innerHTML = (_osc.prefixes[kind] !== undefined) ? _osc.prefixes[kind] : "&nbsp;";
			prefix.classList.add(kind);
			switch (kind)
			{
			case "input":
				content.innerHTML = values[0];
				break;
			case "result":
				content = __formattedValue(values[0], kind);
				if ((values[0] instanceof Error) === true)
				{
					content.classList.add("error");
				};
				break;
			default:
				content.classList.add(kind);
				for (let v = 0, vv = values[0].length; v < vv; v += 1)
				{
					content.appendChild(__formattedValue(values[0][v], kind));
				};
			};
			prefix.innerHTML += "&nbsp;";
			div.appendChild(prefix);
			div.appendChild(content);
			_osc.output.appendChild(div);
		};
		/* hijack browser default console functionions */
		console.error = (...values) =>
		{
			_osc.browserConsoleError.apply(this, values);
			_osc._log("error", values);
		};
		if (_osc.logLevel <= 3)
		{
			console.warn = (...values) =>
			{
				_osc.browserConsoleWarn.apply(this, values);
				_osc._log("warn", values);
			};
			if (_osc.logLevel <= 2)
			{
				console.log = (...values) =>
				{
					_osc.browserConsoleLog.apply(this, values);
					_osc._log("info", values);
				};
				if (_osc.logLevel = 1)
				{
					console.debug = (...values) =>
					{
						_osc.browserConsoleDebug.apply(this, values);
						_osc._log("debug", values);
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
				_osc.output.scrollBy(0, (_osc.output.clientHeight -10));
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
				if (cmd.startsWith(":") === true)
				{
					switch (cmd)
					{
					case ":clear":
						for (let e of _osc.output.querySelectorAll("div"))
						{
							_osc.output.removeChild(e);
						};
						break;
					case ":exit":
						document.body.removeChild(_osc.body);
						break;
					default:
						_osc._log("error", ["Unrecognized command " + cmd]);
					};
				}
				else
				{
					_osc.historyPosition = _osc.history.push(cmd);
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
				let selector = (rules.startsWith("#") === true) ? "#" + _osc.ELEMENT_ID : "#" + _osc.ELEMENT_ID + " ." + rules;
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
