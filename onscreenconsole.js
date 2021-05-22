/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */
if(/\bconsole=[1-4]\b/i.test(window.location.search))
{let _={VERSION:"v1.3",ID:"on-screen-console",LOG_LEVEL:Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),CSS:{"":"background-color:#fcfcfc;color:#777;font-family:monospace;font-size:0.8rem;position:fixed;top:0px;left:0px;width:100vw;margin:0px;padding:0px;box-sizing:border-box;z-index:"+Number.MAX_SAFE_INTEGER+";border:none;border-bottom:0.3rem solid #888;","ul":"list-style:none;margin:0rem;padding:0rem;color:#bbb;","input":"background-color:inherit;color:inherit;font-family:inherit;font-size:inherit;width:100%;border:none;border-top:1px solid #eee;outline:none;",".output":"padding:0px;margin:0px;max-height:30vh;overflow-y:scroll;",".output>div":"border-top:1px solid #eee;",".output>div>div:nth-child(1)":"float:left;margin-left:0.3em",".output>div>div:nth-child(2)":"margin-left:1.3em;",".itm":"display:inline-block;white-space:pre-line;vertical-align:top;margin-right:0.7em;",".expandable:hover":"text-decoration:underline;cursor:pointer;","div.warn":"background-color:#fdfdd8;","div.error":"background-color:#fee8e8;",".internal,.boolean,.undefined":"color:#00f;",".string":"color:#777;",".number":"color:#2a2;",".object":"color:#3bd;",".function":"color:#6af;font-weight:bold;",".error":"color:#c44;",".objdesc":"color:#bbb;font-style:italic;"},PREFIXES:{"error":"X","warn":"!","info":"i","input":">","result":"<"}};if(_.LOG_LEVEL>0)
{_.orgDbg=console.debug;_.orgLog=console.log;_.orgInf=console.info;_.orgWrn=console.warn;_.orgErr=console.error;_.hist=[];_.histPos=0;_.mk=(eleDef,...vals)=>{let ele=document.createElement(/^[^\.\[\s]+/.exec(eleDef)[0]);let attrRx=/\[(.+?)='(.+?)'\]/g,attrRm;while(attrRm=attrRx.exec(eleDef))
ele.setAttribute(attrRm[1],attrRm[2]);let classRex=/\.([^.\s]+)/g,classRm;while(classRm=classRex.exec(eleDef))
ele.classList.add(classRm[1]);for(let val of vals)
if(["string","number"].includes(typeof val))
ele.innerText=val;else if(val instanceof HTMLElement)
ele.appendChild(val);return ele;};_.output=_.mk("div.output");_.prompt=_.mk("input[spellcheck='false'][autocorrect='off'][autocapitalize='none'][placeholder='>>']");_.prompt.onkeydown=(evt)=>{switch(evt.keyCode)
{case 33:_.output.scrollBy(0,0-(_.output.clientHeight-10));break;case 34:_.output.scrollBy(0,(_.output.clientHeight-10));break;case 38:if(_.histPos>0)
{_.histPos-=1;_.prompt.value=_.hist[_.histPos];setTimeout(()=>_.prompt.selectionStart=_.prompt.selectionEnd=_.prompt.value.length,1);};break;case 40:if(_.histPos<_.hist.length)
{_.histPos+=1;if(_.histPos===_.hist.length)
_.prompt.value="";else
_.prompt.value=_.hist[_.histPos];};break;};};_.prompt.onkeypress=(evt)=>{if(evt.keyCode===13)
{evt.stopPropagation();let cmd=evt.target.value;if(cmd.trim()!=="")
{let intCmd=/^\.(\w+)(?:\s+(.+))?/.exec(cmd);_.histPos=(_.hist[_.hist.length-1]!==cmd)?_.hist.push(cmd):_.hist.length;_.write("input",cmd);if(intCmd!==null)
{if(_.execIntCmd(intCmd[1],intCmd[2])===false)
_.write("error",["Unrecognized internal command "+intCmd[1]]);else
_.store(intCmd[1],intCmd[2]);_.refresh();}
else
{_.store("history",_.hist);try
{let res=eval(cmd);if(cmd.trim().startsWith("console.")===false)
_.write("result",res);}
catch(ex)
{console.error(ex);};};};_.prompt.value="";_.prompt.focus();};};_.body=_.mk("div.body",_.output,_.prompt);_.body.id=_.ID;_.store=(key,dat)=>{if(!!localStorage)
{let c=JSON.parse(localStorage.getItem(_.ID))??{};c[key]=dat;localStorage.setItem(_.ID,JSON.stringify(c));};};_.write=(kind,...vals)=>{let content=_.mk("div");switch(kind)
{case"input":content.innerText=vals[0];break;case"result":content.appendChild(_.formatVal(vals[0],kind));break;default:for(let v of vals[0])
content.appendChild(_.formatVal(v,kind));};_.output.appendChild(_.mk("div."+kind,_.mk("div",(_.PREFIXES[kind]??"\u0020")),content));_.refresh();_.output.scrollTo(0,_.output.scrollHeight);};_.formatVal=(val,kind)=>{const __objOut=(obj,ele)=>{let objConstr=obj.constructor.name;let objNam=_.mk("span.expandable","{"+objConstr+"}");objNam.onclick=_.toggleUl;objNam["__object"]=obj;ele.appendChild(objNam);let objDesc;switch(objConstr.toLowerCase())
{case"window":objDesc=obj.location.toString();break;case"location":case"date":objDesc=obj.toString();break;case"array":objDesc="("+obj.length+")";break;};if(obj instanceof Element)
objDesc=/<.+?>/.exec(obj.outerHTML)[0];if(!!objDesc)
ele.appendChild(_.mk("span.objdesc",objDesc));return ele;};let span=_.mk("span");if(val===null)
{span.innerText="null";span.classList.add("internal");}
else
{span.classList.add(typeof val);switch(typeof val)
{case"undefined":case"boolean":span.innerText=val;break;case"string":if(val==="")
val="<empty-string>";else if(kind==="result")
val="\""+val.replaceAll("\"","\\\"")+"\"";span.innerText=val;break;case"number":span.innerText=val;break;case"function":span.innerText="function"+/\(.*?\)/.exec(val.toString())[0].replaceAll(/[\r\n]/g,"");break;case"object":if(val instanceof Error)
{span.classList.remove("object");span.appendChild(_.mk("span.error",val.toString(),_.mk("br")));if(!!val.stack)
span.appendChild(_.mk("span",val.stack));}
else
{__objOut(val,span);};break;default:span.innerText=val;};};span.classList.add("itm");return span;};_.toggleUl=(evt)=>{let obj=evt.target.__object;if(!!obj)
{let ul=evt.target.parentElement.querySelector("ul");if(ul===null)
{ul=_.mk("ul");for(let mbr in obj)
{let li=_.mk("li",_.mk("span",mbr+":\u0020"));try
{li.appendChild(_.formatVal(obj[mbr],"result"));}
catch(ex)
{let e=_.formatVal(obj[mbr],"error");e.style.textDecoration="line-through";li.appendChild(e);};ul.appendChild(li);};evt.target.parentElement.appendChild(ul);};ul.style.display=(ul.style.display!=="initial")?"initial":"none";_.refresh();};};_.refresh=()=>(!!document.body)?document.body.style.marginTop=Math.floor(_.body.getBoundingClientRect().height)+"px":null;console.error=(...vals)=>{_.orgErr.apply(this,vals);_.write("error",vals);};if(_.LOG_LEVEL<=3)
{console.warn=(...vals)=>{_.orgWrn.apply(this,vals);_.write("warn",vals);};if(_.LOG_LEVEL<=2)
{console.log=(...vals)=>{_.orgLog.apply(this,vals);_.write("log",vals);};console.info=(...vals)=>{_.orgInf.apply(this,vals);_.write("info",vals);};if(_.LOG_LEVEL===1)
{console.debug=(...vals)=>{_.orgDbg.apply(this,vals);_.write("debug",vals);};};};};_.execIntCmd=(cmd,arg)=>{let sizeArg=/([\d\.]+)(\w*)?/.exec(arg);let cmds={"c":()=>{while(!!_.output.firstElementChild)
_.output.firstElementChild.remove();},"fs":()=>_.body.style.fontSize=sizeArg[1]+(sizeArg[2]??"rem"),"mh":()=>_.output.style.maxHeight=sizeArg[1]+(sizeArg[2]??"vh"),"x":()=>{console.debug=_.orgDbg;console.log=_.orgLog;console.info=_.orgInf;console.warn=_.orgWrn;console.error=_.orgErr;document.body.removeChild(_.body);},"zi":()=>_.body.style.zIndex=arg};return(!!cmds[cmd])?(cmds[cmd]()??true):false;};window.onerror=(msg,url,lineNo,columnNo,error)=>_.write("error",(error instanceof Error)?[msg]:[msg,url,lineNo,columnNo]);window.addEventListener("load",(event)=>{document.body.appendChild(_.body);let style=_.mk("style");document.head.insertBefore(style,document.head.firstChild);for(let rule in _.CSS)
style.sheet.insertRule("#"+_.ID+" "+rule+" { "+_.CSS[rule]+" }");_.refresh();});if(!!localStorage)
{let c=JSON.parse(localStorage.getItem(_.ID))??{};for(let k in c)
_.execIntCmd(k,c[k]);_.hist=c["history"]??[];_.histPos=_.hist.length;};_.write("log",["Welcome to OnScreenConsole "+_.VERSION+"!"]);_.write("log",["https://github.com/suppenhuhn79/on-screen-console"]);};};