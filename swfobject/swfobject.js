/*!    SWFObject v2.3.20130521 <http://github.com/swfobject/swfobject>
    is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){function e(){if(!H&&document.getElementsByTagName("body")[0]){try{var e,t=m("span")
t.style.display="none",e=$.getElementsByTagName("body")[0].appendChild(t),e.parentNode.removeChild(e),e=null,t=null}catch(e){return}H=!0
for(var n=P.length,a=0;a<n;a++)P[a]()}}function t(e){H?e():P[P.length]=e}function n(e){if(typeof x.addEventListener!==L)x.addEventListener("load",e,!1)
else if(typeof $.addEventListener!==L)$.addEventListener("load",e,!1)
else if(typeof x.attachEvent!==L)w(x,"onload",e)
else if("function"==typeof x.onload){var t=x.onload
x.onload=function(){t(),e()}}else x.onload=e}function a(){var e=$.getElementsByTagName("body")[0],t=m(O)
t.setAttribute("style","visibility: hidden;"),t.setAttribute("type",F)
var n=e.appendChild(t)
if(n){var a=0
!function r(){if(typeof n.GetVariable!==L)try{var o=n.GetVariable("$version")
o&&(o=o.split(" ")[1].split(","),X.pv=[g(o[0]),g(o[1]),g(o[2])])}catch(e){X.pv=[8,0,0]}else if(a<10)return a++,void setTimeout(r,10)
e.removeChild(t),n=null,i()}()}else i()}function i(){var e=R.length
if(e>0)for(var t=0;t<e;t++){var n=R[t].id,a=R[t].callbackFn,i={success:!1,id:n}
if(X.pv[0]>0){var d=h(n)
if(d)if(!b(R[t].swfVersion)||X.wk&&X.wk<312)if(R[t].expressInstall&&o()){var c={}
c.data=R[t].expressInstall,c.width=d.getAttribute("width")||"0",c.height=d.getAttribute("height")||"0",d.getAttribute("class")&&(c.styleclass=d.getAttribute("class")),d.getAttribute("align")&&(c.align=d.getAttribute("align"))
for(var f={},u=d.getElementsByTagName("param"),p=u.length,v=0;v<p;v++)"movie"!==u[v].getAttribute("name").toLowerCase()&&(f[u[v].getAttribute("name")]=u[v].getAttribute("value"))
l(c,f,n,a)}else s(d),a&&a(i)
else C(n,!0),a&&(i.success=!0,i.ref=r(n),i.id=n,a(i))}else if(C(n,!0),a){var y=r(n)
y&&typeof y.SetVariable!==L&&(i.success=!0,i.ref=y,i.id=y.id),a(i)}}}function r(e){var t=null,n=h(e)
return n&&"OBJECT"===n.nodeName.toUpperCase()&&(t=typeof n.SetVariable!==L?n:n.getElementsByTagName(O)[0]||n),t}function o(){return!W&&b("6.0.65")&&(X.win||X.mac)&&!(X.wk&&X.wk<312)}function l(e,t,n,a){var i=h(n)
if(n=y(n),W=!0,N=a||null,k={success:!1,id:n},i){"OBJECT"===i.nodeName.toUpperCase()?(A=d(i),T=null):(A=i,T=n),e.id=j,(typeof e.width===L||!/%$/.test(e.width)&&g(e.width)<310)&&(e.width="310"),(typeof e.height===L||!/%$/.test(e.height)&&g(e.height)<137)&&(e.height="137")
var r=X.ie?"ActiveX":"PlugIn",o="MMredirectURL="+encodeURIComponent(x.location.toString().replace(/&/g,"%26"))+"&MMplayerType="+r+"&MMdoctitle="+encodeURIComponent($.title.slice(0,47)+" - Flash Player Installation")
if(typeof t.flashvars!==L?t.flashvars+="&"+o:t.flashvars=o,X.ie&&4!=i.readyState){var l=m("div")
n+="SWFObjectNew",l.setAttribute("id",n),i.parentNode.insertBefore(l,i),i.style.display="none",p(i)}f(e,t,n)}}function s(e){if(X.ie&&4!=e.readyState){e.style.display="none"
var t=m("div")
e.parentNode.insertBefore(t,e),t.parentNode.replaceChild(d(e),t),p(e)}else e.parentNode.replaceChild(d(e),e)}function d(e){var t=m("div")
if(X.win&&X.ie)t.innerHTML=e.innerHTML
else{var n=e.getElementsByTagName(O)[0]
if(n){var a=n.childNodes
if(a)for(var i=a.length,r=0;r<i;r++)1==a[r].nodeType&&"PARAM"===a[r].nodeName||8==a[r].nodeType||t.appendChild(a[r].cloneNode(!0))}}return t}function c(e,t){var n=m("div")
return n.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+e+"'>"+t+"</object>",n.firstChild}function f(e,t,n){var a,i=h(n)
if(n=y(n),X.wk&&X.wk<312)return a
if(i){var r,o,l,s=m(X.ie?"div":O)
typeof e.id===L&&(e.id=n)
for(l in t)t.hasOwnProperty(l)&&"movie"!==l.toLowerCase()&&u(s,l,t[l])
X.ie&&(s=c(e.data,s.innerHTML))
for(r in e)e.hasOwnProperty(r)&&(o=r.toLowerCase(),"styleclass"===o?s.setAttribute("class",e[r]):"classid"!==o&&"data"!==o&&s.setAttribute(r,e[r]))
X.ie?V[V.length]=e.id:(s.setAttribute("type",F),s.setAttribute("data",e.data)),i.parentNode.replaceChild(s,i),a=s}return a}function u(e,t,n){var a=m("param")
a.setAttribute("name",t),a.setAttribute("value",n),e.appendChild(a)}function p(e){var t=h(e)
t&&"OBJECT"===t.nodeName.toUpperCase()&&(X.ie?(t.style.display="none",function e(){if(4==t.readyState){for(var n in t)"function"==typeof t[n]&&(t[n]=null)
t.parentNode.removeChild(t)}else setTimeout(e,10)}()):t.parentNode.removeChild(t))}function v(e){return e&&e.nodeType&&1===e.nodeType}function y(e){return v(e)?e.id:e}function h(e){if(v(e))return e
var t=null
try{t=$.getElementById(e)}catch(e){}return t}function m(e){return $.createElement(e)}function g(e){return parseInt(e,10)}function w(e,t,n){e.attachEvent(t,n),D[D.length]=[e,t,n]}function b(e){e+=""
var t=X.pv,n=e.split(".")
return n[0]=g(n[0]),n[1]=g(n[1])||0,n[2]=g(n[2])||0,t[0]>n[0]||t[0]==n[0]&&t[1]>n[1]||t[0]==n[0]&&t[1]==n[1]&&t[2]>=n[2]}function E(e,t,n,a){var i=$.getElementsByTagName("head")[0]
if(i){var r="string"==typeof n?n:"screen"
if(a&&(B=null,I=null),!B||I!=r){var o=m("style")
o.setAttribute("type","text/css"),o.setAttribute("media",r),B=i.appendChild(o),X.ie&&typeof $.styleSheets!==L&&$.styleSheets.length>0&&(B=$.styleSheets[$.styleSheets.length-1]),I=r}B&&(typeof B.addRule!==L?B.addRule(e,t):typeof $.createTextNode!==L&&B.appendChild($.createTextNode(e+" {"+t+"}")))}}function C(e,t){if(G){var n=t?"visible":"hidden",a=h(e)
H&&a?a.style.visibility=n:"string"==typeof e&&E("#"+e,"visibility:"+n)}}function S(e){return null!==/[\\\"<>\.;]/.exec(e)&&typeof encodeURIComponent!==L?encodeURIComponent(e):e}var A,T,N,k,B,I,L="undefined",O="object",F="application/x-shockwave-flash",j="SWFObjectExprInst",x=window,$=document,M=navigator,U=!1,P=[],R=[],V=[],D=[],H=!1,W=!1,G=!0,J=!1,X=function(){var e=typeof $.getElementById!==L&&typeof $.getElementsByTagName!==L&&typeof $.createElement!==L,t=M.userAgent.toLowerCase(),n=M.platform.toLowerCase(),a=/win/.test(n?n:t),i=/mac/.test(n?n:t),r=!!/webkit/.test(t)&&parseFloat(t.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")),o="Microsoft Internet Explorer"===M.appName,l=[0,0,0],s=null
if(typeof M.plugins!==L&&typeof M.plugins["Shockwave Flash"]===O)(s=M.plugins["Shockwave Flash"].description)&&typeof M.mimeTypes!==L&&M.mimeTypes[F]&&M.mimeTypes[F].enabledPlugin&&(U=!0,o=!1,s=s.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),l[0]=g(s.replace(/^(.*)\..*$/,"$1")),l[1]=g(s.replace(/^.*\.(.*)\s.*$/,"$1")),l[2]=/[a-zA-Z]/.test(s)?g(s.replace(/^.*[a-zA-Z]+(.*)$/,"$1")):0)
else if(typeof x.ActiveXObject!==L)try{var d=new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
d&&(s=d.GetVariable("$version"))&&(o=!0,s=s.split(" ")[1].split(","),l=[g(s[0]),g(s[1]),g(s[2])])}catch(e){}return{w3:e,pv:l,wk:r,ie:o,win:a,mac:i}}()
!function(){X.w3&&((typeof $.readyState!==L&&("complete"===$.readyState||"interactive"===$.readyState)||typeof $.readyState===L&&($.getElementsByTagName("body")[0]||$.body))&&e(),H||(typeof $.addEventListener!==L&&$.addEventListener("DOMContentLoaded",e,!1),X.ie&&($.attachEvent("onreadystatechange",function t(){"complete"===$.readyState&&($.detachEvent("onreadystatechange",t),e())}),x==top&&function t(){if(!H){try{$.documentElement.doScroll("left")}catch(e){return void setTimeout(t,0)}e()}}()),X.wk&&function t(){if(!H)return/loaded|complete/.test($.readyState)?void e():void setTimeout(t,0)}()))}()
P[0]=function(){U?a():i()}
!function(){X.ie&&window.attachEvent("onunload",function(){for(var e=D.length,t=0;t<e;t++)D[t][0].detachEvent(D[t][1],D[t][2])
for(var n=V.length,a=0;a<n;a++)p(V[a])
for(var i in X)X[i]=null
X=null
for(var r in swfobject)swfobject[r]=null
swfobject=null})}()
return{registerObject:function(e,t,n,a){if(X.w3&&e&&t){var i={}
i.id=e,i.swfVersion=t,i.expressInstall=n,i.callbackFn=a,R[R.length]=i,C(e,!1)}else a&&a({success:!1,id:e})},getObjectById:function(e){if(X.w3)return r(e)},embedSWF:function(e,n,a,i,r,o,l,s,d,c){var u=y(n),p={success:!1,id:u}
X.w3&&!(X.wk&&X.wk<312)&&e&&n&&a&&i&&r?(C(u,!1),t(function(){a+="",i+=""
var t={}
if(d&&typeof d===O)for(var r in d)t[r]=d[r]
t.data=e,t.width=a,t.height=i
var o={}
if(s&&typeof s===O)for(var v in s)o[v]=s[v]
if(l&&typeof l===O)for(var y in l)if(l.hasOwnProperty(y)){var h=J?encodeURIComponent(y):y,m=J?encodeURIComponent(l[y]):l[y]
typeof o.flashvars!==L?o.flashvars+="&"+h+"="+m:o.flashvars=h+"="+m}try{var g=f(t,o,n)
t.id==u&&C(u,!0),p.success=!0,p.ref=g,p.id=g.id}catch(e){C(u,!0)}c&&c(p)})):c&&c(p)},switchOffAutoHideShow:function(){G=!1},enableUriEncoding:function(e){J=typeof e===L||e},ua:X,getFlashPlayerVersion:function(){return{major:X.pv[0],minor:X.pv[1],release:X.pv[2]}},hasFlashPlayerVersion:b,createSWF:function(e,t,n){return X.w3?f(e,t,n):void 0},showExpressInstall:function(e,t,n,a){X.w3&&o()&&l(e,t,n,a)},removeSWF:function(e){X.w3&&p(e)},createCSS:function(e,t,n,a){X.w3&&E(e,t,n,a)},addDomLoadEvent:t,addLoadEvent:n,getQueryParamValue:function(e){var t=$.location.search||$.location.hash
if(t){if(/\?/.test(t)&&(t=t.split("?")[1]),!e)return S(t)
for(var n=t.split("&"),a=0;a<n.length;a++)if(n[a].substring(0,n[a].indexOf("="))==e)return S(n[a].substring(n[a].indexOf("=")+1))}return""},expressInstallCallback:function(){if(W){var e=h(j)
e&&A&&(e.parentNode.replaceChild(A,e),T&&(C(T,!0),X.ie&&(A.style.display="block")),N&&N(k)),W=!1}},version:"2.3"}}()
