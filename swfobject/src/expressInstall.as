/*	=============================
	SWFFix <http://www.swffix.org>
	Copyright (c) 2007 Geoff Stearns, Michael Williams, and Bobby van der Sluis
	This software is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
	=============================
	Express Install
	Copyright © 2005-2007 Adobe Systems Incorporated and its licensors. All Rights Reserved.
	=============================
	AS1 version
	=============================
*/

System.security.allowDomain("fpdownload.macromedia.com");

var cacheBuster	= Math.random();
var updateSWF	= "http://fpdownload.macromedia.com/pub/flashplayer/update/current/swf/autoUpdater.swf?"+cacheBuster;
var bytes		= loaderClip.getBytesTotal();
loaderClip.loadMovie(updateSWF);

var time		= 0;
var timeOut		= 5;	// expressed in seconds
var delay		= 10;	// expressed in milliseconds
var id			= setInterval(checkLoaded, delay);

function checkLoaded(){
	if(loaderClip.startUpdate.toString() == "[type Function]"){
		// updater has loaded successfully
		clearInterval(id);
		loadComplete();
		return;
	}
	else if(time > timeOut){
		// updater did not load in time, abort load and force alternative content
		clearInterval(id);
		loaderClip.unloadMovie();
		loadTimeOut();
		return;
	}
	time += delay/1000;
}

function loadComplete(){
	loaderClip.redirectURL	= _root.MMredirectURL;
	loaderClip.MMplayerType	= _root.MMplayerType;
	loaderClip.MMdoctitle	= _root.MMdoctitle;
	loaderClip.startUpdate();
}

function loadTimeOut(){
	callbackSWFFix();
}

function installStatus(statusValue){
	switch(statusValue){
		case "Download.Complete":
			// Installation is complete.
			// In most cases the browser window that this SWF is hosted in will be closed by the installer or 
			// otherwise it has to be closed manually by the end user.
			// The Adobe Flash installer will reopen the browser window and reload the page containing the SWF. 
		break;
		case "Download.Cancelled":
			// The end user chose "NO" when prompted to install the new player.
			// By default the SWFFix callback function is called to force alternative content.
			callbackSWFFix();
		break;
		case "Download.Failed":
			// The end user failed to download the installer due to a network failure.
			// By default the SWFFix callback function is called to force alternative content.
			callbackSWFFix();
		break;
	}
}

function callbackSWFFix(){
	getURL("javascript:SWFFix.expressInstallCallback();");
}