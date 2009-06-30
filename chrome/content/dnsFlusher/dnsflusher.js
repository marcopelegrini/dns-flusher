const FLUSHER_NOTIFY_STATE_DOCUMENT = Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const FLUSHER_NOTIFY_LOCATION = Components.interfaces.nsIWebProgress.NOTIFY_LOCATION;
//TODO - IPV6 is not supported yet
//const IPV6_STATE_IS_DOCUMENT = Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT;
//const IPV6_STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;

const dnsFlusherName = dnsFlusherName;

window.addEventListener("load", function(){
    dnsFluher.init();
}, false);
window.addEventListener("unload", function(){
    dnsFluher.destroy();
}, false);


var dnsFluher = {

    init: function(){
        this.flusherdnscache = new Array();
        this.flusherrdnscache = new Array();
        this.localip = null;
        this.flusherdnscache['none'] = new Array();
        
        // shamelessly taken from flagfox extension 
        this.Listener = {
            onLocationChange: function(aProgress, aRequest, aLocation){
                try {
                    if (aLocation && aLocation.host && (aLocation.scheme != 'chrome') && (aLocation.scheme != 'file')) {
                        this.parent.updatestatus(aLocation.host);
                    }
                    else {
                        this.parent.updatestatus(dnsFlusherName);
                    }
                } 
                catch (e) {
                    this.parent.updatestatus(dnsFlusherName);
                }
            },
            
            onStateChange: function(a, b, c, d){
            },
            
            onProgressChange: function(a, b, c, d, e, f){
            },
            
            onStatusChange: function(a, b, c, d){
            },
            
            onSecurityChange: function(a, b, c){
            },
            
            onLinkIconAvailable: function(a){
            }
            
        }; // this.Listener
        this.Listener.parent = this;
        
        window.getBrowser().addProgressListener(this.Listener, FLUSHER_NOTIFY_LOCATION | FLUSHER_NOTIFY_STATE_DOCUMENT);
    },
    
    destroy: function(){
        window.getBrowser().removeProgressListener(this.Listener);
    },
    
    // return the ip of host
    resolveIp: function(host){
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
        } 
        catch (e) {
        }
        this.flusherdnscache[host] = new Array(); // empty array for no ips
        this.flusherrdnscache[host] = host;
        return new Array();
    },
    
    // convert num to base 'radix'
    dec2radix: function(num, radix, pad){
        var a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
        var s = '';
        while (num > 0) {
            s = a[num % radix] + s;
            num = Math.floor(num / radix);
        }
        while ((pad - s.length) > 0) {
            s = '0' + s;
        }
        return s;
    },
    
    // update the statusbar panel
    updatestatus: function(host, byUser){
        if (!host) {
            return;
        }
        //Status bar label
        var ipLabel = document.getElementById('dnsflusher_panel');
        //Check host
        this.actualHost = host;
        var ips = this.resolveIp(host);
        if (ips.length) {
            var j = 0;
            var text = ips[j];
            if (byUser) {
                text = "Flushed: " + text;
            }
            //Update label
            ipLabel.label = text;
            if (byUser) {
                var x = 0;
                for (var i = 0; i < 10; i++) {
                    setTimeout("document.getElementById('dnsflusher_panel').label = '" + text + "'", 1000 - x);
                    var text = text.substring(1);
                    x -= 150;
                }
            }
        }
        else {
            ipLabel.label = dnsFlusherName;
        }
    },
    
    refreshdns: function(){
        //Service IO
        var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        var backToOnline = false;
        try {
        
            //Set offline
            ioService.offline = true;
            
            //Get Cache Service
            var cacheService = Components.classes["@mozilla.org/network/cache-service;1"].getService(Components.interfaces.nsICacheService);
            
            cacheService.evictEntries(Components.interfaces.nsICache.STORE_ANYWHERE);
            
            //Set online
            ioService.offline = false;
            backToOnline = true;
            
            this.flusherdnscache = new Array();
            this.flusherrdnscache = new Array();
            
            this.updatestatus(this.actualHost, true);
        }
        finally {
            if (!backToOnline) {
                if (ioService) {
                    ioService.offline = false;
                }
            }
        }
    }
};
