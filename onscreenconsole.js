"use strict";

/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */

if (/\bconsole=\d\b/i.test(window.location.search) === true)
{
	let _osc = {};
	_osc.version = "v1.0";
	_osc.logLevel = Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]);
	if (_osc.logLevel > 0)
	{
		_osc.browserConsoleDebug = console.debug;
		_osc.browserConsoleLog = console.log;
		_osc.browserConsoleWarn = console.warn;
		_osc.browserConsoleError = console.error;
		_osc.styles =
		{
			"wrapper": "background-color: #006; color: #bbb; font-family: monospace; position: fixed; width: 100%; margin: 0rem; padding: 0.5rem; max-height: 60vh; overflowY: scroll; z-index: " + Number.MAX_SAFE_INTEGER + ";",
			"input": "background-color: inherit; color: inherit; font-family: inherit; width: 100%; border: 1px solid #666; outline: none;",
			"output": "white-space: pre; padding: 0rem; margin: 0rem;",
			"warn": "color: #dd6;",
			"error": "color: #f66;",
			"internal": "color: #fff; font-style: italic;",
			"number": "color: #4d8;",
			"object": "color: #3ff;",
			"function": "color: #acf;",
			"ITEM": "display: inline-block; vertical-align: top; margin-right: 0.7em;"
		};
		_osc._setElementStyle = (element, style) =>
		{
			let rex = /(.+?):(.+?);/g;
			let rem = rex.exec(style);
			while (rem !== null)
			{
				element.style[rem[1].trim()] = rem[2].trim();
				rem = rex.exec(style);
			};
		};
		_osc._log = (kind, ...values) =>
		{
			function __formatSimpleType(value, kind)
			{
				let span = document.createElement("span");
				span.innerHTML = value;
				let valueType = typeof value;
				if (value === null)
				{
					_osc._setElementStyle(span, _osc.styles.internal);
					span.innerHTML = "null";
				}
				else
				{
					switch (valueType)
					{
					case "undefined":
					case "boolean":
						_osc._setElementStyle(span, _osc.styles.internal);
						break;
					case "string":
						if (value === "")
						{
							value = "&lt;empty string&gt;";
							_osc._setElementStyle(span, _osc.styles.internal);
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
						_osc._setElementStyle(span, _osc.styles.number);
						span.innerHTML = value;
						break;
					case "function":
						_osc._setElementStyle(span, _osc.styles["function"]);
						let funcBody = value.toString().trim();
						if (funcBody.startsWith("function") === false)
						{
							funcBody = "function" + funcBody;
						};
						span.innerHTML = funcBody.substr(0, funcBody.indexOf(")") + 1).replaceAll("\n", "").replaceAll("\r", "");
						break;
					default:
						_osc._setElementStyle(span, _osc.styles.object);
						span.innerHTML = "[object " + value.constructor.name + "]";
					};
				};
				_osc._setElementStyle(span, _osc.styles.ITEM);
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
						if (value instanceof Error === true)
						{
							_osc._setElementStyle(span, _osc.styles.error);
						}
						else
						{
							_osc._setElementStyle(titleSpan, _osc.styles.object);
							let ul = document.createElement("ul");
							_osc._setElementStyle(ul, "list-style: none; margin: 0rem; padding-left: 1.4em;");
							for (let m in value)
							{
								{
									let li = document.createElement("li");
									let keySpan = document.createElement("span");
									keySpan.innerHTML = m + ":&nbsp;";
									li.appendChild(keySpan);
									li.appendChild(__formatSimpleType(value[m]), kind);
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
				_osc._setElementStyle(span, _osc.styles.ITEM);
				return span;
			};
			let div = document.createElement("div");
			_osc._setElementStyle(div, _osc.styles.output + "display: block;");
			let prefix = document.createElement("span");
			_osc._setElementStyle(prefix, "display: inline-block; vertical-align: top;");
			let content = document.createElement("span");
			_osc._setElementStyle(content, "display: inline-block; vertical-align: top;");
			prefix.innerHTML = "&nbsp;";
			switch (kind)
			{
			case "error":
				prefix.innerHTML = "!";
				_osc._setElementStyle(div, _osc.styles.error);
				content = __formattedValue(values[0], kind);
				break;
			case "warn":
				_osc._setElementStyle(div, _osc.styles.warn);
				prefix.innerHTML = "!";
				_osc._setElementStyle(content, _osc.styles.warn);
				content = __formattedValue(values[0], kind);
				break;
			case "input":
				prefix.innerHTML = "&rarr;"
					content.innerHTML = values[0];
				break;
			case "result":
				prefix.innerHTML = "&larr;";
				content = __formattedValue(values[0], kind);
				break;
			case "debug":
			default:
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
		console.error = (errorText) =>
		{
			_osc.browserConsoleError(errorText);
			_osc._log("error", errorText);
		};
		if (_osc.logLevel <= 3)
		{
			console.warn = (text) =>
			{
				_osc.browserConsoleWarn(text);
				_osc._log("warn", text);
			};
			if (_osc.logLevel <= 2)
			{
				console.log = (...values) =>
				{
					_osc.browserConsoleLog.apply(this, values);
					_osc._log("default", values);
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
		_osc.wrapper = document.createElement("div");
		_osc.wrapper.id = "on-screen-console";
		_osc._setElementStyle(_osc.wrapper, _osc.styles.wrapper);
		_osc.output = document.createElement("div");
		_osc.input = document.createElement("input");
		_osc._setElementStyle(_osc.input, _osc.styles.input);
		_osc.wrapper.appendChild(_osc.output);
		_osc.wrapper.appendChild(_osc.input);
		document.body.appendChild(_osc.wrapper);
		_osc.history = [];
		_osc.historyPosition = 0;
		_osc.input.onkeydown = (keypressEvent) =>
		{
			switch (keypressEvent.keyCode)
			{
			case 38: /* up */
				if (_osc.historyPosition > 0)
				{
					_osc.historyPosition -= 1;
					_osc.input.value = _osc.history[_osc.historyPosition];
					setTimeout(() =>
					{
						let inputLength = _osc.input.value.length;
						_osc.input.selectionStart = inputLength;
						_osc.selectionEnd = inputLength;
					}, 1);
				};
				break;
			case 40: /* dn */
				if (_osc.historyPosition < _osc.history.length)
				{
					_osc.historyPosition += 1;
					if (_osc.historyPosition === _osc.history.length)
					{
						_osc.input.value = "";
					}
					else
					{
						_osc.input.value = _osc.history[_osc.historyPosition];
					};
				};
				break;
			};
		};
		_osc.input.onkeypress = (keypressEvent) =>
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
						document.body.removeChild(_osc.wrapper);
						break;
					default:
						_osc._log("Unrecognized command " + cmd);
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
				_osc.input.focus();
				_osc.wrapper.scrollTo(0, _osc.wrapper.scrollHeight);
			};
		};
		_osc._log("default", ["Welcome to OnScreenConsole " + _osc.version + "!"]);
		_osc._log("default", ["Copyright 2021 Christoph Zager"]);
		_osc._log("default", ["Licensed under the Apache License, Version 2.0"]);
		_osc._log("default", ["https://github.com/suppenhuhn79/on-screen-console"]);
	};
};
