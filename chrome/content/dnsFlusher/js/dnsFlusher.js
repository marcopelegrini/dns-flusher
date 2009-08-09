/**
 * @author marcotulio
 */
window.addEventListener("load", function(){
    dnsFlusher.init();
    dnsFlusher.loadPrefs();
}, false);
window.addEventListener("unload", function(){
    dnsFlusher.destroy();
}, false);

var dnsFlusher = {

    dnsFlusherName: "DNS Flusher",
    branchName: "extensions.dnsFlusher.",
    preferenceWindowType: "dnsFlusher:settings",
    preferenceWindowURI: "chrome://dnsFlusher/content/options.xul",
    preferenceWindowOptions: "chrome,toolbar,centerscreen",
    
    notifyStateDocument: Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT,
    notifyLocation: Components.interfaces.nsIWebProgress.NOTIFY_LOCATION,
    options: null,
    
    init: function(){
        this.reloadByUser = false;
        this.downloadManager = Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager);
        this.utils = new CTechUtils();
        this.prefs = new CTechPrefs(this.branchName, this.preferenceWindowType, this.preferenceWindowURI, this.preferenceWindowOptions);
        this.logger = new CTechLog(this.prefs);
		this.prefs.setLogger(this.logger);
		
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
        
        window.getBrowser().addProgressListener(this.Listener, this.notifyLocation | this.notifyStateDocument);
    },
    
    destroy: function(){
        window.getBrowser().removeProgressListener(this.Listener);
    },
    
    resolveIp: function(host, byUser){
        this.logger.debug("Resolving Host: " + host);
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
                    this.parent.logger.debug("Resolved: " + this.data);
                    this.parent.updateLabel(host, this.data, byUser);
                }
            };
            dataListener.parent = this;
            dataListener.host = host;
            
            this.logger.debug("Getting current thread");
            //Current Thread
            var target = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
            
            //DNS Service            
            var dnsService = Components.classes["@mozilla.org/network/dns-service;1"].getService(Components.interfaces.nsIDNSService);
            try {
                this.logger.debug("Invoking assync resolver...");
                dnsService.asyncResolve(host, 0, dataListener, target);
            } 
            catch (e) {
                //Expected for unknown hosts
                this.logger.debug("Async Resolve error: " + e)
            }
        } 
        catch (e) {
            this.logger.error(e);
        }
    },
    
    // update the statusbar panel
    updatestatus: function(host, byUser){
        this.logger.debug("Updating status for host: " + host + " by user: " + byUser);
        if (!host) {
            this.updateLabel();
            return;
        }
        //Check host
        this.actualHost = host;
        this.resolveIp(host, byUser);
    },
    
    updateLabel: function(host, ips, byUser){
        this.logger.debug("Updating label: " + ips + " byUser: " + byUser);
        var ipLabel = this.utils.getElement('dnsflusher-label');
        this.cleanTooltip();
        //Status bar label
        if (host && ips && ips.length) {
            var j = 0;
            var text = ips[j];
            //Update label
            if ((byUser || this.reloadByUser) && this.prefs.getBool("label-efect")) {
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
        var tooltip = this.utils.getElement('dnsflusher-tooltip');
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
        var tooltip = this.utils.getElement('dnsflusher-tooltip');
        tooltip.appendChild(tooltipTitle);
        tooltip.setAttribute("style", "padding:2px;");
        for (var i = 0; i < ips.length; i++) {
            this.logger.debug("Creating tooltip label for ip: " + ips[i]);
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
            
            if (this.prefs.getBool("reload-page")) {
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
            this.prefs.open();
        }
    },
    
    loadPrefs: function(){
        var color = this.prefs.getString("label-color");
        this.utils.getElement("dnsflusher-label").setAttribute("style", "color:" + color + ";");
    }
};