/*	SWFObject v2.0 rc1 <http://code.google.com/p/swfobject/>
	Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
	This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

var swfobject = function() {
	
	var domLoadFnArr = [];
	var regObjArr = [];
	var timer = null;
	var storedAltContent = null;
	var isDomLoaded = false;
	var isExpressInstallActive = false;
	
	/* Centralized function for browser feature detection
		- Proprietary feature detection (conditional compiling) is used to detect Internet Explorer's features
		- User agent string detection is only used when no alternative is possible
		- Is executed directly for optimal performance
	*/	
	var ua = function() {
		var w3cdom = typeof document.getElementById != "undefined" 	&& typeof document.getElementsByTagName != "undefined" && typeof document.createElement != "undefined" && typeof document.appendChild != "undefined" && typeof document.replaceChild != "undefined" && typeof document.removeChild != "undefined" && typeof document.cloneNode != "undefined";
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
					a.AllowScriptAccess = "always";  // Introduced in fp6.0.47
				}
				catch(e) {
					if (playerVersion[0] == 6) {
						fp6Crash = true;
					}
				}
				if (!fp6Crash) {
					try {
						a = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
					}
					catch(e) {}
				}
			}
			if (!fp6Crash && typeof a == "object") { // When ActiveX is disbled in IE, then "typeof a" returns "object", however it is "null" in reality, so something like "typeof a.GetVariable" will crash the script
				try {
					d = a.GetVariable("$version");  // Will crash fp6.0.21/23/29
					if (d) {
						d = d.split(" ")[1].split(",");
						playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
				catch(e) {}
			}
		}
		var u = navigator.userAgent.toLowerCase();
		var p = navigator.platform.toLowerCase();
		var webkit = /webkit/.test(u);
		var webkitVersion = webkit ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : 0;
		var ie = false;
		var win = p ? /win/.test(p) : /win/.test(u);
		var mac = p ? /mac/.test(p) : /mac/.test(u);
		/*@cc_on
			ie = true;
			@if (@_win32)
				win = true;
			@elif (@_mac)
				mac = true;
			@end
		@*/
		return { w3cdom:w3cdom, playerVersion:playerVersion, webkit:webkit, webkitVersion:webkitVersion, ie:ie, win:win, mac:mac };
	}();
		
	/* Cross-browser onDomLoad
		- Based on Dean Edwards' solution: http://dean.edwards.name/weblog/2006/06/again/
		- Will fire an event as soon as the DOM of a page is loaded (supported by Gecko based browsers - like Firefox -, IE, Opera9+, Safari)
	*/ 
	var onDomLoad = function() {
		if (!ua.w3cdom) {
			return;
		}
		addDomLoadEvent(main);
		if (ua.ie && ua.win) {
			try {  // Avoid a possible Operation Aborted error
				document.write("<script id=__ie_ondomload defer=true src=//:></script>");
				var s = document.getElementById("__ie_ondomload");
				if (s) {
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
		if (ua.ie && ua.win) { // Test if we can really add elements to the DOM; we don't want to fire it too early
			var s = document.createElement("span");
			try { // Avoid a possible Operation Aborted error
				var t = document.getElementsByTagName("body")[0].appendChild(s);
				t.parentNode.removeChild(t);
			}
			catch (e) {
				return;
			}
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
		if (isDomLoaded) {
			fn();
		}
		else { 
			domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
		}
	}
	
	/* Cross-browser onload
		- Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
		- Will fire an event as soon as a web page including all of its assets are loaded 
	 */
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
	
	/* Main function
		- Will preferably execute onDomLoad, otherwise onload (as a fallback)
	*/
	function main() { // Static publishing only
		var rl = regObjArr.length;
		for (var i = 0; i < rl; i++) { // For each registered object element
			var id = regObjArr[i].id;
			if (ua.playerVersion[0] > 0) { // If no fp is installed, we let the object element do its job (show alternative content)
				var obj = document.getElementById(id);
				if (obj) {
					if (hasPlayerVersion(regObjArr[i].swfVersion)) { // Flash plug-in version >= Flash content version: Houston, we have a match!
						if (ua.webkit && ua.webkitVersion < 312) { // Older webkit engines ignore the object element's nested param elements
							fixParams(obj);
						}
					}
					else if (regObjArr[i].expressInstall && !isExpressInstallActive && hasPlayerVersion([6,0,65]) && (ua.win || ua.mac)) { // Show the Adobe Express Install dialog if set by the web page author and if supported (fp6.0.65+ on Win/Mac OS only) 
						showExpressInstall(regObjArr[i]);
					}
					else { // Flash plug-in and Flash content version mismatch: display alternative content instead of Flash content
						displayAltContent(obj);
					}
				}
			}
			createCSS("#" + id, "visibility:visible");
		}
	}
	
	/* Fix nested param elements, which are ignored by older webkit engines
		- This includes Safari up to and including version 1.2.2 on Mac OS 10.3
		- Fall back to the proprietary embed element
	*/
	function fixParams(obj) {
		var nestedObj = obj.getElementsByTagName("object")[0];
		if (nestedObj) {
			var e = document.createElement("embed");	
			var a = nestedObj.attributes;
			if (a) {
				var al = a.length;
				for (var i = 0; i < al; i++) {
					if (a[i].nodeName.toLowerCase() == "data") {
						e.setAttribute("src", a[i].nodeValue);
					}
					else {
						e.setAttribute(a[i].nodeName, a[i].nodeValue);
					}
				}
			}
			var c = nestedObj.childNodes;
			if (c) {
				var cl = c.length;
				for (var j = 0; j < cl; j++) {
					if (c[j].nodeType == 1 && c[j].nodeName.toLowerCase() == "param") {
						e.setAttribute(c[j].getAttribute("name"), c[j].getAttribute("value"));
					}
				}
			}
			obj.parentNode.replaceChild(e, obj);
		}
	}
	
	/* Fix hanging audio/video threads
		- Occurs when unloading a web page in IE using fp8+ and innerHTML/outerHTML
		- Dynamic publishing only
	*/
	function fixObjectLeaks() {
		if (ua.ie && ua.win && hasPlayerVersion([8,0,0])) {
			window.attachEvent("onunload", function () {
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
			});
		}
	}
	
	/* Show the Adobe Express Install dialog
		- Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
	*/
	function showExpressInstall(regObj) {
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
			var w = regObj.width ? regObj.width : (obj.getAttribute("width") ? obj.getAttribute("width") : 0);
			if (parseInt(w, 10) < 310) {
				w = "310";
			}
			var h = regObj.height ? regObj.height : (obj.getAttribute("height") ? obj.getAttribute("height") : 0);
			if (parseInt(h, 10) < 137) {
				h = "137";
			}
			var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn";
			document.title = document.title.slice(0, 47) + " - Flash Player Installation";
			var dt = document.title;
			var fv = "MMredirectURL=" + window.location + "&MMplayerType=" + pt + "&MMdoctitle=" + dt;
			var el = obj;
			// For IE when a SWF is loading (AND: not available in cache) wait for the onload event to fire to remove the original object element
			// In IE you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			if (ua.ie && ua.win && obj.readyState != 4) {
				el = document.createElement("div");
				obj.parentNode.insertBefore(el, obj); // Insert placeholder div that will be replaced by the object element that loads expressinstall.swf
				obj.style.display = "none";
				window.attachEvent("onload", function() { obj.parentNode.removeChild(obj); });
			}
			createSWF({ data:regObj.expressInstall, id:"SWFObjectExprInst", width:w, height:h }, { flashvars:fv }, el);
		}
	}
	
	/* Functions to abstract and display alternative content
	*/
	function displayAltContent(obj) {
		if (ua.ie && ua.win && obj.readyState != 4) {
			// For IE when a SWF is loading (AND: not available in cache) wait for the onload event to fire to remove the original object element
			// In IE you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
			var el = document.createElement("div");
			obj.parentNode.insertBefore(el, obj); // Insert placeholder div that will be replaced by the alternative content
			el.parentNode.replaceChild(abstractAltContent(obj), el);
			obj.style.display = "none";
			window.attachEvent("onload", function() { obj.parentNode.removeChild(obj); });
		}
		else {
			obj.parentNode.replaceChild(abstractAltContent(obj), obj);
		}
	}	

	function abstractAltContent(obj) {
		var ac = document.createElement("div");
		if (ua.win && ua.ie) {
			ac.innerHTML = obj.innerHTML;
		}
		else {
			var nestedObj = obj.getElementsByTagName("object")[0];
			if (nestedObj) {
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
	
	/* Cross-browser dynamic SWF creation
	*/
	function createSWF(attObj, parObj, el) {
		if (ua.ie && ua.win) { // IE, the object element and W3C DOM methods do not combine: fall back to outerHTML
			var att = "";
			for (var i in attObj) {
				if (typeof attObj[i] == "string") { // Filter out prototype additions from other potential libraries, like Object.prototype.toJSONString = function() {}
					if (i == "data") {
						parObj.movie = attObj[i];
					}
					else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
						att += ' class="' + attObj[i] + '"';
					}
					else if (i != "classid") {
						att += ' ' + i + '="' + attObj[i] + '"';
					}
				}
			}
			var par = "";
			for (var j in parObj) {
				if (typeof parObj[j] == "string") { // Filter out prototype additions from other potential libraries
					par += '<param name="' + j + '" value="' + parObj[j] + '" />';
				}
			}
			el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
			fixObjectLeaks(); // This bug affects dynamic publishing only	
		}
		else if (ua.webkit && ua.webkitVersion < 312) { // Older webkit engines ignore the object element's nested param elements: fall back to the proprietary embed method
			var e = document.createElement("embed");
			e.setAttribute("type", "application/x-shockwave-flash");
			for (var k in attObj) {
				if (typeof attObj[k] == "string") {  // Filter out prototype additions from other potential libraries
					if (k == "data") {
						e.setAttribute("src", attObj[k]);
					}
					else if (k.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
						e.setAttribute("class", attObj[k]);
					}
					else if (k != "classid") { // Filter out IE specific attribute
						e.setAttribute(k, attObj[k]);
					}
				}
			}
			for (var l in parObj) {
				if (typeof parObj[l] == "string") { // Filter out prototype additions from other potential libraries
					if (l != "movie") { // Filter out IE specific param element
						e.setAttribute(l, parObj[l]);
					}
				}
			}
			el.parentNode.replaceChild(e, el);
		}
		else { // Well-behaving browsers
			var o = document.createElement("object");
			o.setAttribute("type", "application/x-shockwave-flash");
			for (var m in attObj) {
				if (typeof attObj[m] == "string") {  // Filter out prototype additions from other potential libraries
					if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
						o.setAttribute("class", attObj[m]);
					}
					else if (m != "classid") { // Filter out IE specific attribute
						o.setAttribute(m, attObj[m]);
					}
				}
			}
			for (var n in parObj) {
				if (typeof parObj[n] == "string" && n != "movie") { // Filter out prototype additions from other potential libraries and IE specific param element
					createObjParam(o, n, parObj[n]);
				}
			}
			el.parentNode.replaceChild(o, el);
		}
	}

	function createObjParam(el, pName, pValue) {
		var p = document.createElement("param");
		p.setAttribute("name", pName);	
		p.setAttribute("value", pValue);
		el.appendChild(p);
	}
	
	function hasPlayerVersion(rv) {
		return (ua.playerVersion[0] > rv[0] || (ua.playerVersion[0] == rv[0] && ua.playerVersion[1] > rv[1]) || (ua.playerVersion[0] == rv[0] && ua.playerVersion[1] == rv[1] && ua.playerVersion[2] >= rv[2])) ? true : false;
	}
	
	/* Cross-browser dynamic CSS creation
		- Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
	*/	
	function createCSS(sel, decl) {
		if (ua.ie && ua.mac) {
			return;
		}
		var h = document.getElementsByTagName("head")[0]; 
		var s = document.createElement("style");
		s.setAttribute("type", "text/css");
		s.setAttribute("media", "screen");
		if (!(ua.ie && ua.win) && typeof document.createTextNode != "undefined") {
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
	
	return {
		/* Public API
			- Reference: http://code.google.com/p/swfobject/wiki/SWFObject_2_0_documentation
		*/ 
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
		
		getObjectById: function(objectIdStr) {
			var r = null;
			if (ua.w3cdom && isDomLoaded) {
				var o = document.getElementById(objectIdStr);
				if (o) {
					var n = o.getElementsByTagName("object")[0];
					if (!n || (n && typeof o.SetVariable != "undefined")) {
				    	r = o;
					}
					else if (typeof n.SetVariable != "undefined") {
						r = n;
					}
				}
			}
			return r;
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
						if (typeof flashvarsObj[i] == "string") { // Filter out prototype additions from other potential libraries
							if (typeof par.flashvars != "undefined") {
								par.flashvars += "&" + i + "=" + flashvarsObj[i];
							}
							else {
								par.flashvars = i + "=" + flashvarsObj[i];
							}
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
					showExpressInstall(regObj);
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
		
		createSWF: function(attObj, parObj, el) {
			if (ua.w3cdom && isDomLoaded) {
				createSWF(attObj, parObj, el);
			}
		},
		
		createCSS: function(sel, decl) {
			if (ua.w3cdom) {
				createCSS(sel, decl);
			}
		},
		
		addDomLoadEvent:addDomLoadEvent,
		
		addLoadEvent:addLoadEvent,
		
		getQueryParamValue: function(param) {
			var q = document.location.search || document.location.hash;
			if (param == null) {
				return q;
			}
		 	if(q) {
				var pairs = q.substring(1).split("&");
				for (var i = 0; i < pairs.length; i++) {
					if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
						return pairs[i].substring((pairs[i].indexOf("=") + 1));
					}
				}
			}
			return "";
		},
		
		// For internal usage only
		expressInstallCallback: function() {
			if (isExpressInstallActive && storedAltContent) {
				var obj = document.getElementById("SWFObjectExprInst");
				if (obj) {
					obj.parentNode.replaceChild(storedAltContent, obj);
					storedAltContent = null;
					isExpressInstallActive = false;
				}
			} 
		}
		
	};

}();
