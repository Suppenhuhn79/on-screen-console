/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */
if (/\bconsole=[1-4]\b/i.test(window.location.search))
{
	let _ =
	{
		VERSION: "v1.3",
		ID: "on-screen-console",
		LOG_LEVEL: Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),
		CSS:
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
			".string": "color:inherit;",
			".object": "color:#3ff;",
			".object .expandable:hover": "text-decoration:underline;cursor:pointer;",
			".function": "color:#acf;font-weight:bold;",
			".itm": "display:inline-block;vertical-align:top;margin-right:0.7em;",
			".objdesc": "color:#999;"
		},
		PREFIXES:
		{
			"error": "!",
			"warn": "!",
			"info": "i",
			"input": "&gt;",
			"result": "&lt;"
		}
	};
	if (_.LOG_LEVEL > 0)
	{
		_.orgDbg = console.debug;
		_.orgLog = console.log;
		_.orgInf = console.info;
		_.orgWrn = console.warn;
		_.orgErr = console.error;
		_.ne = (eleDef, ...vals) =>
		{
			let res = document.createElement(/^[^#.\s]+/.exec(eleDef)[0]);
			let cssClassesRex = /\.([^.\s]+)/g,
			cssClassMatch;
			while (cssClassMatch = cssClassesRex.exec(eleDef))
				res.classList.add(cssClassMatch[1]);
			for (let val of vals)
			{
				if (["String", "Number"].includes(val.constructor.name))
					res.innerHTML = val;
				else if (val instanceof HTMLElement)
					res.appendChild(val);
			};
			return res;
		};
		_.store = (key, dat) =>
		{
			if (!!localStorage)
			{
				let c = JSON.parse(localStorage.getItem(_.ID)) ?? {};
				c[key] = dat;
				localStorage.setItem(_.ID, JSON.stringify(c));
			};
		};
		_.write = (kind, ...vals) =>
		{
			let content = _.ne("span.lin");
			switch (kind)
			{
			case "input":
				content.innerHTML = vals[0];
				break;
			case "result":
				content = _.formatVal(vals[0], kind);
				break;
			default:
				content.classList.add(kind);
				for (let v of vals[0])
					content.appendChild(_.formatVal(v, kind));
			};
			_.output.appendChild(_.ne("div", _.ne("span." + kind, (_.PREFIXES[kind] ?? "&nbsp;") + "&nbsp;"), content));
			_.output.scrollTo(0, _.output.scrollHeight);
		};
		_.formatVal = (val, kind) =>
		{
			const __escapeHtml = (val) => String(val).replaceAll("<", "&lt;").replaceAll(">", "&gt;");
			const __objOut = (obj, ele) =>
			{
				let objConstr = obj.constructor.name;
				let objNam = _.ne("span.expandable", objConstr);
				objNam.onclick = _.toggleUl;
				objNam["__object"] = obj;
				ele.appendChild(objNam);
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
					objDesc = __escapeHtml(/<.+?>/.exec(obj.outerHTML)[0]);
				if (!!objDesc)
					ele.appendChild(_.ne("span.objdesc", "&#32;" + objDesc));
				return ele;
			};
			let span = _.ne("span");
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
					else if (kind === "result")
					{
						val = "\"" + val.replaceAll("\"", "\\\"") + "\"";
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
						span.appendChild(_.ne("span.error", __escapeHtml(val)));
						if (!!val.stack)
							span.appendChild(_.ne("ul", _.ne("li.error", val.stack)));
					}
					else
					{
						__objOut(val, span);
					};
					break;
				default:
					span.innerHTML = __escapeHtml(val);
				};
			};
			span.classList.add("itm");
			return span;
		};
		_.toggleUl = (evt) =>
		{
			let obj = evt.target.__object;
			if (!!obj)
			{
				let ul = evt.target.parentElement.querySelector("ul");
				if (ul === null)
				{
					ul = _.ne("ul");
					for (let mem in obj)
					{
						let li = _.ne("li", _.ne("span", mem + ":&nbsp;"));
						try
						{
							li.appendChild(_.formatVal(obj[mem], "result"));
						}
						catch (ex)
						{
							let e = _.formatVal(obj[mem], "error");
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
		console.error = (...vals) =>
		{
			_.orgErr.apply(this, vals);
			_.write("error", vals);
		};
		if (_.LOG_LEVEL <= 3)
		{
			console.warn = (...vals) =>
			{
				_.orgWrn.apply(this, vals);
				_.write("warn", vals);
			};
			if (_.LOG_LEVEL <= 2)
			{
				console.log = (...vals) =>
				{
					_.orgLog.apply(this, vals);
					_.write("log", vals);
				};
				console.info = (...vals) =>
				{
					_.orgInf.apply(this, vals);
					_.write("info", vals);
				};
				if (_.LOG_LEVEL = 1)
				{
					console.debug = (...vals) =>
					{
						_.orgDbg.apply(this, vals);
						_.write("debug", vals);
					};
				};
			};
		};
		_.output = _.ne("div.output");
		_.prompt = _.ne("input");
		_.prompt.setAttribute("spellcheck", "false");
		_.body = _.ne("div.body", _.output, _.prompt);
		_.body.id = _.ID;
		_.hist = [];
		_.histPos = 0;
		_.execIntCmd = (cmd, arg) =>
		{
			let sizeArg = /([\d\.]+)(\w*)?/.exec(arg);
			let cmds =
			{
				"c": () =>
				{
					while (!!_.output.firstElementChild)
						_.output.firstElementChild.remove();
				},
				"fs": () => _.body.style.fontSize = sizeArg[1] + (sizeArg[2] ?? "rem"),
				"mh": () => _.output.style.maxHeight = sizeArg[1] + (sizeArg[2] ?? "vh"),
				"x": () =>
				{
					console.debug = _.orgDbg;
					console.log = _.orgLog;
					console.info = _.orgInf;
					console.warn = _.orgWrn;
					console.error = _.orgErr;
					document.body.removeChild(_.body);
				},
				"zi": () => _.body.style.zIndex = arg
			};
			return (!!cmds[cmd]) ? (cmds[cmd]() ?? true) : false;
		};
		_.prompt.onkeydown = (evt) =>
		{
			switch (evt.keyCode)
			{
			case 33:
				_.output.scrollBy(0, 0 - (_.output.clientHeight - 10));
				break;
			case 34:
				_.output.scrollBy(0, (_.output.clientHeight - 10));
				break;
			case 38:
				if (_.histPos > 0)
				{
					_.histPos -= 1;
					_.prompt.value = _.hist[_.histPos];
					setTimeout(() => _.prompt.selectionStart = _.prompt.selectionEnd = _.prompt.value.length, 1);
				};
				break;
			case 40:
				if (_.histPos < _.hist.length)
				{
					_.histPos += 1;
					if (_.histPos === _.hist.length)
						_.prompt.value = "";
					else
						_.prompt.value = _.hist[_.histPos];
				};
				break;
			};
		};
		_.prompt.onkeypress = (evt) =>
		{
			if (evt.keyCode === 13)
			{
				evt.stopPropagation();
				let cmd = evt.target.value;
				let intCmd = /^\.(\w+)(?:\s+(.+))?/.exec(cmd);
				_.histPos = (_.hist[_.hist.length - 1] !== cmd) ? _.hist.push(cmd) : _.hist.length;
				_.write("input", cmd);
				if (intCmd !== null)
				{
					if (_.execIntCmd(intCmd[1], intCmd[2]) === false)
						_.write("error", ["Unrecognized internal command " + intCmd[1]]);
					else
						_.store(intCmd[1], intCmd[2]);
				}
				else
				{
					_.store("history", _.hist);
					try
					{
						let res = eval(cmd);
						if (cmd.trim().startsWith("console.") === false)
							_.write("result", res);
					}
					catch (ex)
					{
						console.error(ex);
					};
				};
				_.prompt.value = "";
				_.prompt.focus();
			};
		};
		window.onerror = (msg, url, lineNo, columnNo, error) => _.write("error", (error instanceof Error) ? [msg] : [msg, url, lineNo, columnNo]);
		window.addEventListener("load", (event) =>
		{
			document.body.appendChild(_.body);
			let style = _.ne("style");
			document.head.insertBefore(style, document.head.firstChild);
			for (let rule in _.CSS)
				style.sheet.insertRule("#" + _.ID + " " + rule + " { " + _.CSS[rule] + " }");
		}
		);
		if (!!localStorage)
		{
			let c = JSON.parse(localStorage.getItem(_.ID)) ?? {};
			for (let k in c)
				_.execIntCmd(k, c[k]);
			_.hist = c.hist ?? [];
			_.histPos = _.hist.length;
		};
		_.write("log", ["Welcome to OnScreenConsole " + _.VERSION + "!"]);
		_.write("log", ["https://github.com/suppenhuhn79/on-screen-console"]);
	};
};
