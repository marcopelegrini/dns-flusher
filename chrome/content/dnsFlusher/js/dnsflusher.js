const FLUSHER_NOTIFY_STATE_DOCUMENT = Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT;
const FLUSHER_NOTIFY_LOCATION = Components.interfaces.nsIWebProgress.NOTIFY_LOCATION;
//TODO - IPV6 is not supported yet
//const IPV6_STATE_IS_DOCUMENT = Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT;
//const IPV6_STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;

window.addEventListener("load", function(){
    dnsFlusher.init();
    dnsFlusher.loadPrefs();
}, false);
window.addEventListener("unload", function(){
    dnsFlusher.destroy();
}, false);

var dnsFlusher = {

    init: function(){
        this.dnsFlusherName = "DNS Flusher";
        this.reloadByUser = false;
        this.flusherdnscache = new Array();
        this.downloadManager = Components.classes["@mozilla.org/download-manager;1"].getService(Ci.nsIDownloadManager);
        
        // shamelessly taken from flagfox extension 
        this.Listener = {
            onLocationChange: function(aProgress, aRequest, aLocation){
                try {
                    if (aLocation && aLocation.host && (aLocation.scheme != 'chrome') && (aLocation.scheme != 'file')) {
                        this.parent.updatestatus(aLocation.host);
                    }
                    else {
                        this.parent.updatestatus();
                    }
                } 
                catch (e) {
                    this.parent.updatestatus();
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
    
    resolveIp: function(host, byUser){
        CTechLog.debug("Resolving Host: " + host);
        if (this.flusherdnscache[host]) {
            CTechLog.debug("Host is already on cache: " + this.flusherdnscache[host])
            this.updateLabel(host, this.flusherdnscache[host], byUser);
            return;
        }
        try {
            //DNS Data Listener
            var dataListener = {
                data: [],
                QueryInterface: function(aIID){
                    if (aIID.equals(Components.interfaces.nsIDNSListener) ||
                    aIID.equals(Components.interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_NOINTERFACE;
                },
                onLookupComplete: function(aRequest, aRecord, aStatus){
                    while (aRecord && aRecord.hasMore()) {
                        this.data.push(aRecord.getNextAddrAsString());
                    }
                    CTechLog.debug("Resolved: " + this.data);
                    this.parent.updateLabel(host, this.data, byUser);
                    this.parent.flusherdnscache[this.host] = this.data;
                }
            };
            dataListener.parent = this;
            dataListener.host = host;
            
            CTechLog.debug("Getting current thread");
            //Current Thread
            var target = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
            
            //DNS Service            
            var dnsService = Components.classes["@mozilla.org/network/dns-service;1"].getService(Components.interfaces.nsIDNSService);
            try {
                CTechLog.debug("Invoking assync resolver...");
                dnsService.asyncResolve(host, 0, dataListener, target);
            } 
            catch (e) {
                //Expected for unknown hosts
                CTechLog.debug("Async Resolve error: " + e)
            }
        } 
        catch (e) {
            CTechLog.error(e);
        }
    },
    
    // update the statusbar panel
    updatestatus: function(host, byUser){
        CTechLog.debug("Updating status for host: " + host + " by user: " + byUser);
        if (!host) {
            this.updateLabel();
            return;
        }
        //Check host
        this.actualHost = host;
        this.resolveIp(host, byUser);
    },
    
    updateLabel: function(host, ips, byUser){
        CTechLog.debug("Updating label: " + ips + " byUser: " + byUser);
        var ipLabel = CTechUtils.getElement('dnsflusher-label');
        this.cleanTooltip();
        //Status bar label
        if (host && ips && ips.length) {
            var j = 0;
            var text = ips[j];
            //Update label
            if ((byUser || this.reloadByUser) && CTechPrefs.getBool("label-efect")) {
                text = "Flushed: " + text;
                ipLabel.value = text;
                var x = 0;
                for (var i = 0; i < 10; i++) {
                    setTimeout("document.getElementById('dnsflusher-label').value = '" + text + "'", 1000 - x);
                    var text = text.substring(1);
                    x -= 150;
                }
            }
            else {
                ipLabel.value = text;
            }
            this.updateTooltip(host, ips);
        }
        else {
            ipLabel.value = this.dnsFlusherName;
        }
        this.reloadByUser = false;
    },
    
    cleanTooltip: function(){
        //Remove old tooltips
        var tooltip = CTechUtils.getElement('dnsflusher-tooltip');
        while (tooltip.childElementCount) {
            tooltip.removeChild(tooltip.children[0]);
        }
        tooltip.setAttribute("style", "display:none;");
    },
    
    updateTooltip: function(host, ips){
        //Tooltip title    
        var tooltipTitle = document.createElement("label");
        tooltipTitle.setAttribute("value", "IP(s) for host: " + host);
        tooltipTitle.setAttribute("style", "font-weight:bold;");
        //Children
        var tooltip = CTechUtils.getElement('dnsflusher-tooltip');
        tooltip.appendChild(tooltipTitle);
        tooltip.setAttribute("style", "padding:2px;");
        for (i = 0; i < ips.length; i++) {
            CTechLog.debug("Creating tooltip label for ip: " + ips[i]);
            var label = document.createElement("label");
            label.setAttribute("value", ips[i]);
            tooltip.appendChild(label);
        }
    },
    
    refreshdns: function(){
        //Check for active downloads
        var activeDownloads = this.downloadManager.activeDownloadCount;
        var strMsg = "There are downloads currently in progress.\nIf you flush the DNS now your downloads will be lost!\nDo you want to continue?\n";
        
        if (activeDownloads > 0 && !confirm(strMsg)) {
            return false;
        }
        
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
            
            if (CTechPrefs.getBool("reload-page")) {
                var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIWebNavigation).QueryInterface(Components.interfaces.nsIDocShellTreeItem).rootTreeItem.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(Components.interfaces.nsIDOMWindow);
                mainWindow.getBrowser().reload();
                this.reloadByUser = true;
            }
            else {
                this.updatestatus(this.actualHost, true);
            }
        }
        finally {
            if (!backToOnline) {
                if (ioService) {
                    ioService.offline = false;
                }
            }
        }
    },
    
    eventDispatcher: function(event){
        if (event.button < 2) {
            dnsFlusher.refreshdns();
        }
        else {
            CTechPrefs.open();
        }
    },
    
    loadPrefs: function(){
        var color = CTechPrefs.getString("label-color");
        CTechUtils.getElement("dnsflusher-label").setAttribute("style", "color:" + color + ";");
    }
};
