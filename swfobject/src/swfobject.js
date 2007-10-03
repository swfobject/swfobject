/*	SWFObject v2.0 beta2 <http://code.google.com/p/swfobject/>
	Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
	This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

var swfobject = function() {
	
	var domLoadFnArr = [];
	var regObjArr = [];
	var timer = null;
	var storedAltContent = null;
	var isDomLoaded = false;
	var isFixed = false;
	var isExpressInstallActive = false;
		
	var ua = function() {
		var w3cdom = typeof document.getElementById != "undefined" && typeof document.getElementsByTagName != "undefined" && typeof document.createElement != "undefined" && typeof document.createTextNode != "undefined" && typeof document.appendChild != "undefined" && typeof document.replaceChild != "undefined" && typeof document.removeChild != "undefined" && typeof document.cloneNode != "undefined" && typeof document.parentNode != "undefined" && typeof document.nodeType != "undefined" && typeof document.nodeName != "undefined" && typeof document.nodeValue != "undefined";
		var playerVersion = [0,0,0];
		var d = null;
		if (typeof navigator.plugins != "undefined" && typeof navigator.plugins["Shockwave Flash"] == "object") {
			d = navigator.plugins["Shockwave Flash"].description;
			if (d) {
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
				playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
				playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
				playerVersion[2] = /r/.test(d) ? parseInt(d.replace(/^.*r(.*)$/, "$1"), 10) : 0;
			}
		}
		else if (typeof window.ActiveXObject != "undefined") {
			var a = null;
			var fp6Crash = false;
			try {
				a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			}
			catch(e) {
				try { 
					a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
					playerVersion = [6,0,21];
					a.AllowScriptAccess = "always";
				}
				catch(er) {
					if (playerVersion[0] == 6) {
						fp6Crash = true;
					}
				}
				if (!fp6Crash) {
					try {
						a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
					}
					catch(err) {}
				}
			}
			if (!fp6Crash && typeof a == "object") {
				d = a.GetVariable("$version");
				if (d) {
					d = d.split(" ")[1].split(",");
					playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
				}
			}
		}
		var opera = typeof window.opera != "undefined";
		var	operaVersion = opera && typeof window.opera.version != "undefined" ? parseFloat(window.opera.version()) : 0;
		var u = navigator.userAgent.toLowerCase();
		var p = navigator.platform.toLowerCase();
		var	webkit = /webkit/.test(u);
		var	webkitVersion = webkit ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : 0;
		var	ie = false;
		var ie6AndUp = false;
		var	win = p ? /win/.test(p) : /win/.test(u);
		var	mac = p ? /mac/.test(p) : /mac/.test(u);
		/*@cc_on
			ie = true;
			@if (@_jscript_version >= 5.6)
				ie6AndUp = true;
			@end
			@if (@_win32)
				win = true;
			@elif (@_mac)
				mac = true;
			@end
		@*/
		return { w3cdom:w3cdom, playerVersion:playerVersion, opera:opera, operaVersion:operaVersion, webkit:webkit, webkitVersion:webkitVersion, ie:ie, ie6AndUp:ie6AndUp, win:win, mac:mac };
	}();
		
	var onDomLoad = function() {
		if (!ua.w3cdom) {
			return;
		}
		addDomLoadEvent(main);
		if (ua.ie && ua.win) {
			try {
				document.write("<script id=__ie_ondomload defer=true src=//:></script>");
				var s = document.getElementById("__ie_ondomload");
				if (s && typeof s.onreadystatechange != "undefined" && typeof s.readyState != "undefined") {
					s.onreadystatechange = function() {
						if (this.readyState == "complete") {
							this.parentNode.removeChild(this);
							callDomLoadFunctions();
						}
					};
				}
			}
			catch(e) {}
		}
		if (ua.webkit && typeof document.readyState != "undefined") {
			timer = setInterval(function() { if (/loaded|complete/.test(document.readyState)) { callDomLoadFunctions(); }}, 10);
		}
		if (typeof document.addEventListener != "undefined") {
			document.addEventListener("DOMContentLoaded", callDomLoadFunctions, null);
		}
		addLoadEvent(callDomLoadFunctions);
	}();
	
	function callDomLoadFunctions() {
		if (isDomLoaded) {
			return;
		}
		isDomLoaded = true;
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		var dl = domLoadFnArr.length;
		for (var i = 0; i < dl; i++) {
			domLoadFnArr[i]();
		}
	}
	
	function addDomLoadEvent(fn) {
		domLoadFnArr[domLoadFnArr.length] = fn;
	}
	
	function addLoadEvent(fn) {
		if (typeof window.addEventListener != "undefined") {
			window.addEventListener("load", fn, false);
		}
		else if (typeof document.addEventListener != "undefined") {
			document.addEventListener("load", fn, false);
		}
		else if (typeof window.attachEvent != "undefined") {
			window.attachEvent("onload", fn);
		}
		else if (typeof window.onload == "function") {
			var fnOld = window.onload;
			window.onload = function() {
				fnOld();
				fn();
			};
		}
		else {
			window.onload = fn;
		}
	}
	
	function main() {
		var rl = regObjArr.length;
		for (var i = 0; i < rl; i++) {
			var id = regObjArr[i].id;
			var obj = document.getElementById(id);
			if (obj) {
				if (hasPlayerVersion(regObjArr[i].swfVersion)) {
					if (ua.ie && ua.win) {
						if (!isFixed && typeof window.attachEvent != "undefined") {
							isFixed = true;
							if (ua.ie6AndUp) {
								if (typeof document.readyState != "undefined" && document.readyState == "complete") {
									fixActiveContent();
								}
								else {
									window.attachEvent("onload", fixActiveContent);
								}
							}
							if (hasPlayerVersion([9,0,0])) {
								window.attachEvent("onbeforeunload", fixOutOfMemoryError);
							}
							if (hasPlayerVersion([8,0,0])) {
								window.attachEvent("onunload", fixObjectLeaks);
							}
						}
					}
					else if (ua.opera) {
						if (!isFixed && ua.operaVersion >= 9) {
							isFixed = true;
							addLoadEvent(fixActiveContent);
						}
					}
					else if (ua.webkit) {
						if (ua.webkitVersion < 312) {
							fixParams(obj);
						}
					}
				}
				else if (regObjArr[i].expressInstall && !isExpressInstallActive && hasPlayerVersion([6,0,65]) && (ua.win || ua.mac)) {
					displayExpressInstallDialog(regObjArr[i]);
				}
				else {
					displayAltContent(obj);
				}
			}
			createCSS("#" + id, "visibility:visible");
		}
	}

	function fixActiveContent() {
		var o = document.getElementsByTagName("object");
		if (o) {
			var ol = o.length;
			for (var i = 0; i < ol; i++) {
				if (ua.ie && ua.win) {
					if (typeof o[i].childNodes != "undefined" && typeof o[i].outerHTML != "undefined" && typeof o[i].innerHTML != "undefined") {
						var c = o[i].childNodes;
						if (c) {
							var cl = c.length;
							var paramHTML = "";
							for (var j = 0; j < cl; j++) {
								if (c[j].nodeType == 1 && c[j].nodeName.toLowerCase() == "param") {
									paramHTML += c[j].outerHTML;
								}	       
							}
							o[i].outerHTML = o[i].outerHTML.split(">")[0] + ">" + paramHTML + o[i].innerHTML + "</object>";
						}
					}
				}
				else {
					if (typeof o[i].getAttribute != "undefined" && o[i].getAttribute("type") == "application/x-shockwave-flash") {
						var cn = o[i].cloneNode(true);
						o[i].parentNode.replaceChild(cn, o[i]);
					}
				}	
			}
		}
	}
	
	function fixOutOfMemoryError() {
		__flash_unloadHandler = function() {};
		__flash_savedUnloadHandler = function() {};
	}
	
	function fixObjectLeaks() {
		var o = document.getElementsByTagName("object");
		if (o) {
			var ol = o.length;
			for (var i = 0; i < ol; i++) {
				o[i].style.display = "none";
				for (var x in o[i]) {
					if (typeof o[i][x] == "function") {
						o[i][x] = function() {};
					}
				}
			}
		}
	}
	
	function fixParams(obj) {
		var nestedObj = obj.getElementsByTagName("object")[0];
		if (nestedObj) {
			var e = document.createElement("embed");
			if (typeof nestedObj.attributes != "undefined") {
				var a = nestedObj.attributes;
				if (a) {
					var al = a.length;
					for (var i = 0; i < al; i++) {
						if (typeof e.setAttribute != "undefined") {
							if (a[i].nodeName.toLowerCase() == "data") {
								e.setAttribute("src", a[i].nodeValue);
							}
							else {
								e.setAttribute(a[i].nodeName, a[i].nodeValue);
							}
						}
					}
				}
			}
			if (typeof nestedObj.childNodes != "undefined") {
				var c = nestedObj.childNodes;
				if (c) {
					var cl = c.length;
					for (var j = 0; j < cl; j++) {
						if (c[j].nodeType == 1 && c[j].nodeName.toLowerCase() == "param" && typeof e.setAttribute != "undefined" && typeof c[j].getAttribute != "undefined") {
							e.setAttribute(c[j].getAttribute("name"), c[j].getAttribute("value"));
						}
					}
				}
			}
			obj.parentNode.replaceChild(e, obj);
		}
	}
	
	function displayExpressInstallDialog(regObj) {
		isExpressInstallActive = true;
		var obj = document.getElementById(regObj.id);
		if (obj) {
			if (regObj.altContentId) {
				var ac = document.getElementById(regObj.altContentId);
				if (ac) {
					storedAltContent = ac;
				}
			}
			else {
				storedAltContent = abstractAltContent(obj);
			}
			var w = regObj.width ? regObj.width : (typeof obj.getAttribute != "undefined" && obj.getAttribute("width") ? obj.getAttribute("width") : 0);
			if (parseInt(w, 10) < 310) {
				w = "310";
			}
			var h = regObj.height ? regObj.height : (typeof obj.getAttribute != "undefined" && obj.getAttribute("height") ? obj.getAttribute("height") : 0);
			if (parseInt(h, 10) < 137) {
				h = "137";
			}
			var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn";
			document.title = document.title.slice(0, 47) + " - Flash Player Installation";
			var dt = document.title;
			var fv = "MMredirectURL=" + window.location + "&MMplayerType=" + pt + "&MMdoctitle=" + dt;
			var el = obj;
			if (ua.ie && ua.win && typeof obj.readyState != "undefined" && obj.readyState != 4 && typeof window.attachEvent != "undefined") {
				el = document.createElement("div");
				obj.parentNode.insertBefore(el, obj);
				obj.style.display = "none";
				window.attachEvent("onload", function() { obj.parentNode.removeChild(obj); });
			}
			createSWF({ data:regObj.expressInstall, id:"swfobjectxi", width:w, height:h }, { flashvars:fv }, el);
		}
	}

	function displayAltContent(obj) {
		obj.parentNode.replaceChild(abstractAltContent(obj), obj);
	}	

	function abstractAltContent(obj) {
		var ac = document.createElement("div");
		if (ua.win && ua.ie) {
			if (typeof ac.innerHTML != "undefined") {
				ac.innerHTML = obj.innerHTML;
			}
		}
		else {
			var nestedObj = obj.getElementsByTagName("object")[0];
			if (nestedObj && typeof nestedObj.childNodes != "undefined") {
				var c = nestedObj.childNodes;
				if (c) {
					var cl = c.length;
					for (var i = 0; i < cl; i++) {
						if (!(c[i].nodeType == 1 && c[i].nodeName.toLowerCase() == "param") && !(c[i].nodeType == 8)) {
							ac.appendChild(c[i].cloneNode(true));
						}
					}
				}
			}
		}
		return ac;
	}
	
	function createSWF(attObj, parObj, el) {
		if (ua.ie && ua.win) {
			var att = "";
			for (var i in attObj) { 
				if (i == "data") {
					parObj.movie = attObj[i];
				}
				else if (i != "classid") {
					att += ' ' + i + '="' + attObj[i] + '"';
				} 
			}
			var par = "";
			for (var j in parObj) {
				par += '<param name="' + j + '" value="' + parObj[j] + '" />';
			}
			if (typeof el.outerHTML != "undefined") {
				el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
			}	
		}
		else if (ua.webkit && ua.webkitVersion < 312) {
			var e = document.createElement("embed");
			if (typeof e.setAttribute != "undefined") {
				e.setAttribute("type", "application/x-shockwave-flash");
				for (var k in attObj) {
					if (k == "data") {
						e.setAttribute("src", attObj[k]);
					}
					else if (k != "classid") {
						e.setAttribute(k, attObj[k]);
					}
				}
				for (var l in parObj) {
					if (l != "movie") {
						e.setAttribute(l, parObj[l]);
					}
				}
				el.parentNode.replaceChild(e, el);
			}
		}
		else {
			var o = document.createElement("object");
			if (typeof o.setAttribute != "undefined") {
				o.setAttribute("type", "application/x-shockwave-flash");
				for (var m in attObj) {
					if (m != "classid") {
						o.setAttribute(m, attObj[m]);
					}
				}
				for (var n in parObj) {
					if (n != "movie") {
						createObjParam(o, n, parObj[n]);
					}
				}
				el.parentNode.replaceChild(o, el);
			}
		}
	}

	function createObjParam(el, pName, pValue) {
		var p = document.createElement("param");
		if (typeof p.setAttribute != "undefined") {
			p.setAttribute("name", pName);	
			p.setAttribute("value", pValue);
			el.appendChild(p);
		}
	}
	
	function hasPlayerVersion(rv) {
		return (ua.playerVersion[0] > rv[0] || (ua.playerVersion[0] == rv[0] && ua.playerVersion[1] > rv[1]) || (ua.playerVersion[0] == rv[0] && ua.playerVersion[1] == rv[1] && ua.playerVersion[2] >= rv[2])) ? true : false;
	}
		
	function createCSS(sel, decl) {
		if (ua.ie && ua.mac) {
			return;
		}
		var h = document.getElementsByTagName("head")[0]; 
		var s = document.createElement("style");
		if (typeof s.setAttribute != "undefined") {
			s.setAttribute("type", "text/css");
			s.setAttribute("media", "screen");
			if (!(ua.ie && ua.win)) {
				s.appendChild(document.createTextNode(sel + " {" + decl + "}"));
			}
			h.appendChild(s);
			if (ua.ie && ua.win && typeof document.styleSheets != "undefined" && document.styleSheets.length > 0) {
				var ls = document.styleSheets[document.styleSheets.length - 1];
				if (typeof ls.addRule == "object") {
					ls.addRule(sel, decl);
				}
			}
		}
	}
	
	return {
		// public API
		registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr) {
			if (!ua.w3cdom || !objectIdStr || !swfVersionStr) {
				return;
			}
			var regObj = {};
			regObj.id = objectIdStr;
			var v = swfVersionStr.split(".");
			regObj.swfVersion = [parseInt(v[0], 10), parseInt(v[1], 10), parseInt(v[2], 10)];
			regObj.expressInstall = xiSwfUrlStr ? xiSwfUrlStr : false;
			regObjArr[regObjArr.length] = regObj;
			createCSS("#" + objectIdStr, "visibility:hidden");
		},
		
		embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj) {
			if (!ua.w3cdom || !swfUrlStr || !replaceElemIdStr || !widthStr || !heightStr || !swfVersionStr) {
				return;
			}
			if (hasPlayerVersion(swfVersionStr.split("."))) {
				createCSS("#" + replaceElemIdStr, "visibility:hidden");
				var att = (typeof attObj == "object") ? attObj : {};
				att.data = swfUrlStr;
				att.width = widthStr;
				att.height = heightStr;
				var par = (typeof parObj == "object") ? parObj : {};
				if (typeof flashvarsObj == "object") {
					for (var i in flashvarsObj) {
						if (typeof par.flashvars != "undefined") {
							par.flashvars += "&" + i + "=" + flashvarsObj[i];
						}
						else {
							par.flashvars = i + "=" + flashvarsObj[i];
						}
					}
				}
				addDomLoadEvent(function() {
					createSWF(att, par, document.getElementById(replaceElemIdStr));
					createCSS("#" + replaceElemIdStr, "visibility:visible");
				});
			}
			else if (xiSwfUrlStr && !isExpressInstallActive && hasPlayerVersion([6,0,65]) && (ua.win || ua.mac)) {
				createCSS("#" + replaceElemIdStr, "visibility:hidden");
				addDomLoadEvent(function() {
					var regObj = {};
					regObj.id = regObj.altContentId = replaceElemIdStr;
					regObj.width = widthStr;
					regObj.height = heightStr;
					regObj.expressInstall = xiSwfUrlStr;
					displayExpressInstallDialog(regObj);
					createCSS("#" + replaceElemIdStr, "visibility:visible");
				});
			}
		},
		
		getFlashPlayerVersion: function() {
			return { major:ua.playerVersion[0], minor:ua.playerVersion[1], release:ua.playerVersion[2] };
		},
		
		hasFlashPlayerVersion: function(versionStr) {
			return hasPlayerVersion(versionStr.split("."));
		},
		
		expressInstallCallback: function() {
			if (isExpressInstallActive && storedAltContent) {
				var obj = document.getElementById("swfobjectxi");
				if (obj) {
					obj.parentNode.replaceChild(storedAltContent, obj);
					storedAltContent = null;
					isExpressInstallActive = false;
				}
			} 
		}	
	};
	
}();
