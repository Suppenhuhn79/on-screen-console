/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */
if(/\bconsole=[1-4]\b/i.test(window.location.search))
{let _={VERSION:"v1.5",ID:"on-screen-console",LOG_LEVEL:Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),CSS:{"":"background-color:#fafafa;color:#555;position:fixed;bottom:0px;left:0px;width:100vw;margin:0px;padding:0px;z-index:"+Number.MAX_SAFE_INTEGER+";border:none;border-top:0.3rem solid #666;","*":"background-color:inherit;color:inherit;font-family:monospace;font-size:0.8rem;border:none;outline:none;","ul":"list-style:none;margin:0rem;padding:0rem;color:#888;","input":"width:100%;display:block;border-top:1px solid #eee;",".output":"padding:0px;margin:0px;max-height:30vh;overflow-y:scroll;",".ln":"border-top:1px solid #eee;",".ix":"float:left;margin-left:0.3em",".ix~*":"float:clear;margin-left:1.3em;",".itm":"display:inline-block;white-space:pre-line;vertical-align:top;margin-right:0.7em;",".grp":"margin-left:0.5em;border-left:0.1rem solid #66d;padding-left:0.5em;",".group>*":"font-weight:bold;cursor:pointer;",".expandable:hover":"text-decoration:underline;cursor:pointer;","div.warn":"background-color:#fdfdd8;","div.error":"background-color:#fee8e8;",".internal,.boolean,.undefined":"color:#66d;",".string":"color:#555;",".number":"color:#2a2;",".object":"color:#4aa;",".function":"color:#6af;font-weight:bold;",".error":"color:#c44;",".objdesc":"color:#aaa;font-style:italic;"},PREFIXES:{"error":"X","warn":"!","info":"i","input":">","result":"<","group":"*"}};if(_.LOG_LEVEL>0)
{_.$dbg=console.debug;_.$log=console.log;_.$inf=console.info;_.$wrn=console.warn;_.$err=console.error;_.$clr=console.clear;_.$gb=console.group;_.$gbc=console.groupCollapsed;_.$ge=console.groupEnd;_.hist=[];_.histPos=0;_.autoHide=true;_.mk=(eleDef,...vals)=>{let ele=document.createElement((/^[^\.\[]+/.exec(eleDef)??["div"])[0]);let attrRx=/\[(.+?)='(.+?)'\]/g,attrRm;while(attrRm=attrRx.exec(eleDef))
ele.setAttribute(attrRm[1],attrRm[2]);let classRex=/\.([^.\s]+)/g,classRm;while(classRm=classRex.exec(eleDef))
ele.classList.add(classRm[1]);for(let val of vals)
if(["string","number"].includes(typeof val))
ele.innerText=val;else if(val instanceof HTMLElement)
ele.appendChild(val);return ele;};_.output=_.mk(".output");_.aout=_.output;_.prompt=_.mk("input[spellcheck='false'][autocorrect='off'][autocapitalize='none'][placeholder='>>']");_.prompt.onkeydown=(e)=>{switch(e.keyCode)
{case 33:_.output.scrollBy(0,0-(_.output.clientHeight-10));break;case 34:_.output.scrollBy(0,(_.output.clientHeight-10));break;case 38:if(_.histPos>0)
{_.histPos-=1;_.prompt.value=_.hist[_.histPos];setTimeout(()=>_.prompt.selectionStart=_.prompt.selectionEnd=_.prompt.value.length,1);};break;case 40:if(_.histPos<_.hist.length)
{_.histPos+=1;if(_.histPos===_.hist.length)
_.prompt.value="";else
_.prompt.value=_.hist[_.histPos];};break;};};_.prompt.onkeypress=(e)=>{if(e.keyCode===13)
{e.stopPropagation();let cmd=e.target.value.trim();if(cmd!=="")
{let intCmd=/^\.(\w+)(?:\s+(.+))?/.exec(cmd);_.histPos=(_.hist[_.hist.length-1]!==cmd)?_.hist.push(cmd):_.hist.length;_.write("input",cmd);if(intCmd!==null)
{if(_.execIntCmd(intCmd[1],intCmd[2])===false)
_.write("error",["Unrecognized internal command "+intCmd[1]]);else
_.store(intCmd[1],intCmd[2]);}
else
{_.store("history",_.hist);try
{let res=eval(cmd);if(cmd.startsWith("console.")===false)
_.write("result",res);}
catch(ex)
{console.error(ex);};};};_.prompt.value="";_.prompt.focus();};};_.body=_.mk("",_.output,_.prompt);_.body.id=_.ID;_.store=(key,dat)=>{if(localStorage)
{let c=JSON.parse(localStorage.getItem(_.ID))??{};c[key]=dat;localStorage.setItem(_.ID,JSON.stringify(c));};};_.write=(kind,...vals)=>{let content=_.mk("");switch(kind)
{case"input":content.innerText=vals[0];break;case"result":content.appendChild(_.formatVal(vals[0],kind));break;default:for(let v of vals[0])
content.appendChild(_.formatVal(v,kind));};let l=_.mk(".ln."+kind,_.mk(".ix",(_.PREFIXES[kind]??"\u0020")),content);_.aout.appendChild(l);_.output.scrollTo(0,_.output.scrollHeight);return l;};_.formatVal=(val,kind)=>{const __objOut=(obj,ele)=>{let objConstr=obj.constructor.name;let objNam=_.mk("span.expandable","{"+objConstr+"}");objNam.onclick=_.toggleUl;objNam["__object"]=obj;ele.appendChild(objNam);let objDesc;switch(objConstr.toLowerCase())
{case"window":objDesc=obj.location.toString();break;case"location":case"date":objDesc=obj.toString();break;case"array":objDesc="("+obj.length+")";break;};if(obj instanceof Element)
{objDesc="<"+obj.tagName;for(let a of obj.attributes)
objDesc+="\u0020"+a.name+"=\""+a.value+"\"";objDesc+=(obj.childElementCount>0)?">":"/>";}
if(objDesc)
ele.appendChild(_.mk("span.objdesc",objDesc));return ele;};let span=_.mk("span");if(val===null)
{span.innerText="null";span.classList.add("internal");}
else
{span.classList.add(typeof val);switch(typeof val)
{case"function":span.innerText="function"+/\(.*?\)/.exec(val.toString())[0].replaceAll(/[\r\n]/g,"");break;case"object":if(val instanceof Error)
{span.classList.remove("object");span.appendChild(_.mk("span.error",val.toString(),_.mk("br")));if(val.stack)
span.appendChild(_.mk("span",val.stack));}
else
__objOut(val,span);break;case"string":val=(kind==="result")?"\""+val.replaceAll("\"","\\\"")+"\"":val;if(val==="")
{val="<empty-string>";span.classList.add("internal");};case"undefined":case"boolean":case"number":default:span.innerText=val;};};span.classList.add("itm");return span;};_.toggleUl=(e)=>{e.stopPropagation();let obj=e.target.__object;if(obj)
{let ul=e.target.parentElement.querySelector("ul");if(ul===null)
{ul=_.mk("ul");for(let mbr in obj)
{let li=_.mk("li",_.mk("span",mbr+":\u0020"));try
{li.appendChild(_.formatVal(obj[mbr],"result"));}
catch(ex)
{let e=_.formatVal(obj[mbr],"error");e.style.textDecoration="line-through";li.appendChild(e);};ul.appendChild(li);};e.target.parentElement.appendChild(ul);};ul.style.display=(ul.style.display!=="initial")?"initial":"none";};};_.execIntCmd=(cmd,arg)=>{let sizeArg=/([\d\.]+)(\w*)?/.exec(arg);let cmds={"ah":()=>{_.autoHide=(arg==="1")},"c":()=>{while(_.output.firstElementChild)
_.output.firstElementChild.remove();},"fs":()=>_.body.style.fontSize=sizeArg[1]+(sizeArg[2]??"rem"),"mh":()=>_.output.style.maxHeight=sizeArg[1]+(sizeArg[2]??"vh"),"x":()=>{console.debug=_.$dbg;console.log=_.$log;console.info=_.$inf;console.warn=_.$wrn;console.error=_.$err;console.group=_.$gb;console.groupCollapsed=_.$gbc;console.groupEnd=_.$ge;document.body.removeChild(_.body);},"zi":()=>_.body.style.zIndex=arg};return(cmds[cmd])?(cmds[cmd]()??true):false;};console.clear=()=>{_.execIntCmd("c");_.$clr();_.write("log",["Console was cleared"]);};console.group=console.groupCollapsed=(...vals)=>{_.$gb.apply(this,vals);_.write("group",vals).onclick=(e)=>{let c=e.target.closest(".group").nextSibling.style;c.display=(c.display!=="none")?"none":null;};let grp=_.mk(".grp");_.aout.appendChild(grp);_.aout=grp;};console.groupEnd=()=>{_.$ge();if(_.aout!==_.output)
_.aout=_.aout.parentElement;};console.error=(...vals)=>{_.$err.apply(this,vals);_.write("error",vals);};if(_.LOG_LEVEL<=3)
{console.warn=(...vals)=>{_.$wrn.apply(this,vals);_.write("warn",vals);};if(_.LOG_LEVEL<=2)
{console.log=(...vals)=>{_.$log.apply(this,vals);_.write("log",vals);};console.info=(...vals)=>{_.$inf.apply(this,vals);_.write("info",vals);};if(_.LOG_LEVEL===1)
{console.debug=(...vals)=>{_.$dbg.apply(this,vals);_.write("debug",vals);};};};};window.onerror=(msg,url,lineNo,columnNo,error)=>_.write("error",(error instanceof Error)?[msg]:[msg,url,lineNo,columnNo]);window.addEventListener("load",(e)=>{let style=_.mk("style");document.head.insertBefore(style,document.head.firstChild);for(let rS in _.CSS)
for(let rV of rS.split(","))
style.sheet.insertRule("#"+_.ID+" "+rV+" {"+_.CSS[rS]+"}");document.body.appendChild(_.body);});window.addEventListener("click",(e)=>_.output.style.display=(e.target.closest("#"+_.ID))?"block":((_.autoHide)?"none":"block"));if(localStorage)
{let c=JSON.parse(localStorage.getItem(_.ID))??{};for(let k in c)
_.execIntCmd(k,c[k]);_.hist=c["history"]??[];_.histPos=_.hist.length;};_.write("log",["Welcome to OnScreenConsole "+_.VERSION+"!"]);_.write("log",["https://github.com/suppenhuhn79/on-screen-console"]);};};