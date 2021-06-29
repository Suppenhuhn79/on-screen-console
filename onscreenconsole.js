/*
OnScreenConsole (https://github.com/suppenhuhn79/on-screen-console)
Copyright 2021 Christoph Zager, licensed under the Apache License, Version 2.0
See the full license text at http://www.apache.org/licenses/LICENSE-2.0
 */
if(/\bconsole=[1-4]\b/i.test(window.location.search))
{let _={VERSION:'v1.5',ID:'on-screen-console',LOG_LEVEL:Number(/\bconsole=(\d)\b/i.exec(window.location.search)[1]),CSS:{'':'background-color:#fafafa;color:#555;position:fixed;bottom:0px;left:0px;width:100vw;margin:0px;padding:0px;z-index:'+Number.MAX_SAFE_INTEGER+';border:none;border-top:0.3rem solid #666;','*':'background-color:inherit;color:inherit;font-family:monospace;font-size:0.8rem;border:none;outline:none;','ul':'list-style:none;margin:0rem;padding:0rem;color:#888;','input':'width:100%;display:block;border-top:1px solid #eee;','.output':'padding:0px;margin:0px;max-height:30vh;overflow-y:scroll;','.ln':'border-top:1px solid #eee;','.ix':'float:left;margin-left:0.3em','.ix~*':'float:clear;margin-left:1.3em;','.itm':'display:inline-block;white-space:pre-line;vertical-align:top;margin-right:0.7em;','.grp':'margin-left:0.5em;border-left:0.1rem solid #66d;padding-left:0.5em;','.group>*':'font-weight:bold;cursor:pointer;','.expandable:hover':'text-decoration:underline;cursor:pointer;','div.warn':'background-color:#fdfdd8;','div.error':'background-color:#fee8e8;','.internal,.boolean,.undefined':'color:#66d;','.string':'color:#555;','.number':'color:#2a2;','.object':'color:#4aa;','.function':'color:#6af;font-weight:bold;','.error':'color:#c44;','.objdesc':'color:#aaa;font-style:italic;'},PREFIXES:{'error':'X','warn':'!','info':'i','input':'>','result':'<','group':'*'}};if(_.LOG_LEVEL>0)
{_.$dbg=console.debug;_.$log=console.log;_.$inf=console.info;_.$wrn=console.warn;_.$err=console.error;_.$clr=console.clear;_.$gb=console.group;_.$gbc=console.groupCollapsed;_.$ge=console.groupEnd;_.h=[];_.hP=0;_.autoHide=true;_.mk=(eDf,...cdn)=>{let ele=document.createElement((/^[^\.\[]+/.exec(eDf)??['div'])[0]),x,m;x=/\[(.+?)="(.+?)"\]/g;while(m=x.exec(eDf))
ele.setAttribute(m[1],m[2]);x=/\.([^.\s]+)/g;while(m=x.exec(eDf))
ele.classList.add(m[1]);for(let c of cdn)
if(['string','number'].includes(typeof c))
ele.innerText=c;else if(c instanceof HTMLElement)
ele.appendChild(c);return ele};_.out=_.mk('.output');_.aO=_.out;_.inpt=_.mk('input[spellcheck="false"][autocorrect="off"][autocapitalize="none"][placeholder=">>"]');_.inpt.onkeydown=(e)=>{switch(e.keyCode)
{case 33:_.out.scrollBy(0,0-(_.out.clientHeight-10));break;case 34:_.out.scrollBy(0,(_.out.clientHeight-10));break;case 38:if(_.hP>0)
{_.hP-=1;_.inpt.value=_.h[_.hP];setTimeout(()=>_.inpt.selectionStart=_.inpt.selectionEnd=_.inpt.value.length,1)};break;case 40:if(_.hP<_.h.length)
{_.hP+=1;_.inpt.value=(_.hP===_.h.length)?'':_.h[_.hP]};break}};_.inpt.onkeypress=(e)=>{if(e.keyCode===13)
{e.stopPropagation();let cmd=e.target.value.trim();if(cmd!=='')
{let intCmd=/^\.(\w+)(?:\s+(.+))?/.exec(cmd);_.hP=(_.h[_.h.length-1]!==cmd)?_.h.push(cmd):_.h.length;_.write('input',cmd);if(intCmd)
{if(_.execIntCmd(intCmd[1],intCmd[2]))
_.store(intCmd[1],intCmd[2]);else
_.write('error',['Unrecognized internal command '+intCmd[1]])}
else
{_.store('history',_.h);try
{let res=eval(cmd);if(!cmd.startsWith('console.'))
_.write('result',res)}
catch(e)
{console.error(e)}}};_.inpt.value='';_.inpt.focus()}};_.body=_.mk('',_.out,_.inpt);_.body.id=_.ID;_.store=(key,dat)=>{if(localStorage)
{let c=JSON.parse(localStorage.getItem(_.ID))??{};c[key]=dat;localStorage.setItem(_.ID,JSON.stringify(c))}};_.write=(kind,...vals)=>{let content=_.mk('');switch(kind)
{case'input':content.innerText=vals[0];break;case'result':content.appendChild(_.formatVal(vals[0],kind));break;default:for(let v of vals[0])
content.appendChild(_.formatVal(v,kind))};let l=_.mk('.ln.'+kind,_.mk('.ix',(_.PREFIXES[kind]??' ')),content);_.aO.appendChild(l);_.out.scrollTo(0,_.out.scrollHeight);return l};_.formatVal=(val,kind)=>{const __objOut=(obj,ele)=>{let objConstr=obj.constructor.name;let objNam=_.mk('span.expandable','{'+objConstr+'}');objNam.onclick=_.toggleUl;objNam.__object=obj;ele.appendChild(objNam);let objDesc;switch(objConstr.toLowerCase())
{case'window':objDesc=obj.location.toString();break;case'location':case'date':objDesc=obj.toString();break;case'array':objDesc='('+obj.length+')';break};if(obj instanceof Element)
{objDesc='<'+obj.tagName;for(let a of obj.attributes)
objDesc+=' '+a.name+'="'+a.value+'"';objDesc+=(obj.childElementCount>0)?'>':'/>'}
if(objDesc)
ele.appendChild(_.mk('span.objdesc',objDesc));return ele};let span=_.mk('span');if(val===null)
{span.innerText='null';span.classList.add('internal')}
else
{span.classList.add(typeof val);switch(typeof val)
{case'function':span.innerText='function'+/\(.*?\)/.exec(val.toString())[0].replaceAll(/[\r\n]/g,'');break;case'object':if(val instanceof Error)
{span.classList.remove('object');span.appendChild(_.mk('span.error',val.toString(),_.mk('br')));if(val.stack)
span.appendChild(_.mk('span',val.stack))}
else
__objOut(val,span);break;case'string':val=(kind==='result')?'"'+val.replaceAll('"','\\\"')+'\"':val;if(val==='')
{val='<empty-string>';span.classList.add('internal')};case'undefined':case'boolean':case'number':default:span.innerText=val}};span.classList.add('itm');return span};_.toggleUl=(e)=>{e.stopPropagation();_.inpt.focus(e);let obj=e.target.__object;if(obj)
{let ul=e.target.parentElement.querySelector('ul');if(ul===null)
{ul=_.mk('ul');for(let mbr in obj)
{let li=_.mk('li',_.mk('span',mbr+': '));try
{li.appendChild(_.formatVal(obj[mbr],'result'))}
catch(e)
{let y=_.formatVal(obj[mbr],'error');y.style.textDecoration='line-through';li.appendChild(y)};ul.appendChild(li)};e.target.parentElement.appendChild(ul)};ul.style.display=(ul.style.display!=='initial')?'initial':'none'}};_.execIntCmd=(cmd,arg)=>{let sizeArg=/([\d\.]+)(\w*)?/.exec(arg);let cmds={'ah':()=>{_.autoHide=(arg==='1')},'c':()=>{while(_.out.firstElementChild)
_.out.firstElementChild.remove()},'fs':()=>_.body.style.fontSize=sizeArg[1]+(sizeArg[2]??'rem'),'mh':()=>_.out.style.maxHeight=sizeArg[1]+(sizeArg[2]??'vh'),'x':()=>{console.debug=_.$dbg;console.log=_.$log;console.info=_.$inf;console.warn=_.$wrn;console.error=_.$err;console.clear=_.$clr;console.group=_.$gb;console.groupCollapsed=_.$gbc;console.groupEnd=_.$ge;document.body.removeChild(_.body)},'zi':()=>_.body.style.zIndex=arg};return(cmds[cmd])?(cmds[cmd]()??true):false};console.clear=()=>{_.execIntCmd('c');_.$clr();_.write('log',['Console was cleared'])};console.group=console.groupCollapsed=(...vals)=>{_.$gb.apply(this,vals);_.write('group',vals).onclick=(e)=>{let c=e.target.closest('.group').nextSibling.style;c.display=(c.display!=='none')?'none':null};let grp=_.mk('.grp');_.aO.appendChild(grp);_.aO=grp};console.groupEnd=()=>{_.$ge();if(_.aO!==_.out)
_.aO=_.aO.parentElement};console.error=(...vals)=>{_.$err.apply(this,vals);_.write('error',vals)};if(_.LOG_LEVEL<=3)
{console.warn=(...vals)=>{_.$wrn.apply(this,vals);_.write('warn',vals)};if(_.LOG_LEVEL<=2)
{console.log=(...vals)=>{_.$log.apply(this,vals);_.write('log',vals)};console.info=(...vals)=>{_.$inf.apply(this,vals);_.write('info',vals)};if(_.LOG_LEVEL===1)
{console.debug=(...vals)=>{_.$dbg.apply(this,vals);_.write('debug',vals)}}}};window.onerror=(msg,url,lN,cN,e)=>_.write('error',(e instanceof Error)?[msg]:[msg,url,lN,cN]);window.addEventListener('load',(e)=>{let s=_.mk('style');document.head.insertBefore(s,document.head.firstChild);for(let rS in _.CSS)
for(let rV of rS.split(','))
s.sheet.insertRule('#'+_.ID+' '+rV+' {'+_.CSS[rS]+'}');document.body.appendChild(_.body)});window.addEventListener('click',(e)=>_.out.style.display=(e.target.closest('#'+_.ID))?'block':((_.autoHide)?'none':'block'));if(localStorage)
{let c=JSON.parse(localStorage.getItem(_.ID))??{};for(let k in c)
_.execIntCmd(k,c[k]);_.h=c['history']??[];_.hP=_.h.length};_.write('log',['Welcome to OnScreenConsole '+_.VERSION+'!']);_.write('log',['https://github.com/suppenhuhn79/on-screen-console'])}};