const FLUSHER_NOTIFY_STATE_DOCUMENT = Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const FLUSHER_NOTIFY_LOCATION = Components.interfaces.nsIWebProgress.NOTIFY_LOCATION;
//const IPV6_STATE_IS_DOCUMENT = Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT;
//const IPV6_STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;

window.addEventListener("load", function() { dnsFluher.init(); }, false);
window.addEventListener("unload", function() { dnsFluher.destroy(); }, false);


var dnsFluher = {

init: function()  {
	this.flusherdnscache = new Array();
	this.flusherrdnscache = new Array();
	this.localip = null;
	this.flusherdnscache['none'] = new Array();
	this.downloadManager = Components.classes["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
	
	// shamelessly taken from flagfox extension 
	this.Listener = {

		onLocationChange:function(aProgress,aRequest,aLocation){
			try {
				if (aLocation && aLocation.host && (aLocation.scheme != 'chrome') && (aLocation.scheme != 'file') )
					 this.parent.updatestatus(aLocation.host);
				else
					this.parent.updatestatus("none");
			} catch(e) { 
				this.parent.updatestatus("none");
			}
		},

		onStateChange:function(a,b,c,d) {},

		onProgressChange:function(a,b,c,d,e,f){},

		onStatusChange:function(a,b,c,d){},

		onSecurityChange:function(a,b,c){},

		onLinkIconAvailable:function(a){}

	}; // this.Listener

	this.Listener.parent = this;

	window.getBrowser().addProgressListener(this.Listener, FLUSHER_NOTIFY_LOCATION | FLUSHER_NOTIFY_STATE_DOCUMENT);

//	alert("Initiated");
},

destroy: function()  {
//	this.PrefObserver.unregister();
	window.getBrowser().removeProgressListener(this.Listener);
},

	
// return the ip of host
resolveIp: function(host) {
	if (this.flusherdnscache[host])
		return this.flusherdnscache[host];
	try {       
		// register dns class 
		var cls = Components.classes['@mozilla.org/network/dns-service;1'];
		var iface = Components.interfaces.nsIDNSService;
		var dns = cls.getService(iface);

		var nsrecord = dns.resolve(host, false);
		var ip = new Array();
		while (nsrecord && nsrecord.hasMore()) {
			var myip = nsrecord.getNextAddrAsString();

			ip.push(myip);
			this.flusherrdnscache[myip] = host;
		}
		this.flusherdnscache[host] = ip;
		return ip;
	} catch(e) { }
	this.flusherdnscache[host] = new Array();  // empty array for no ips
	this.flusherrdnscache[host] = host;
	return new Array();

},

// convert num to base 'radix'
dec2radix: function(num, radix, pad) {
	var a = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
	var s = '';
	while(num > 0) {
		s = a[num % radix] + s;
		num = Math.floor(num / radix);
	}
	while((pad - s.length) > 0) {
		s = '0' + s;
	}
	return s;
},

// update the statusbar panel
updatestatus: function(host) {
	if (!host){
		return;
	}

	this.actualHost = host;
	var text = "Please wait";
	var ips = this.resolveIp(host);
	if (ips.length) {
		var j = 0;
		text = ips[j];
	}
//	alert(text);
	setTimeout("document.getElementById('dnsflusher_panel').label = '" + text + "'",1500);
//	document.getElementById('dnsflusher_panel').label = text;
},

refreshdns: function() {

	var activeDownloads = this.downloadManager.activeDownloadCount;
	var strMsg = "There are downloads currently in progress.\nIf you flush the DNS now your downloads will be lost!\nDo you want to continue?\n";
	
	if(activeDownloads > 0 && !confirm(strMsg)) { return false; }

	//Service IO
	var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);

	//Set offline
	ioService.offline = true;

	//Get Cache Service
	var cacheService = Components.classes["@mozilla.org/network/cache-service;1"].getService(Components.interfaces.nsICacheService);

	cacheService.evictEntries(Components.interfaces.nsICache.STORE_ANYWHERE);

	//Set online
	ioService.offline = false;

	//Flushed
	document.getElementById('dnsflusher_panel').label = "Flushing...";

//	setTimeout("document.getElementById('dnsflusher_panel').label = 'Flushed!'",2000);

	this.flusherdnscache = new Array();
	this.flusherrdnscache = new Array();

	this.updatestatus(this.actualHost);

//	alert(this.actualHost);
}

};