/**
 * @author marcotulio
 */
window.addEventListener("load", function(){
    dnsFlusher.init();
    dnsFlusher.loadPrefs();
    dnsFlusher.addListener();
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
    
    init: function(){

        this.reloadByUser = false;
        this.utils = new CTechUtils();
        this.prefs = new CTechPrefs(this.branchName);
        this.logger = new CTechLog(this.prefs);
		this.prefs.setLogger(this.logger);
		//Firefox Services
		Components.utils.import("resource://gre/modules/Downloads.jsm");
		this.dnsService = Components.classes["@mozilla.org/network/dns-service;1"].getService(Components.interfaces.nsIDNSService);		
	    this.networkIoService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
	    this.cacheService = Components.classes["@mozilla.org/network/cache-service;1"].getService(Components.interfaces.nsICacheService);
	    this.threadManager = Components.classes["@mozilla.org/thread-manager;1"].getService();

        this.logger.info("Starting DNS Flusher...");

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
            
        };
        this.Listener.parent = this;
        
        window.getBrowser().addProgressListener(this.Listener);


        var configured = false;
        try{
			configured = this.prefs.getBool("configured");
        }catch(e){
        	this.logger.warn("DNS Flusher appears not to be configured");
        }
		if (!configured) {
			this.installButton();
			this.prefs.setBool("configured", true);
		}
    },

    addListener: function(){
        var mainWindow = this.utils.getMainWindow();
        mainWindow.document.addEventListener("DNSFlusherEvent", function(e) { 
            dnsFlusher.flushListener(e); 
        }, false);
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
            var target = this.threadManager.currentThread;
            
            try {
                this.logger.debug("Invoking assync resolver...");
                this.dnsService.asyncResolve(host, 0, dataListener, target);
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
                    setTimeout(function(value){
                    	document.getElementById('dnsflusher-label').value = value;
                    }, 1000 - x, text);
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
        // var activeDownloads = this.downloadManager.activeDownloadCount;
        // var downloads = Downloads.getList(Downloads.ALL);
        
        // var strMsg = "There are downloads currently in progress.\nIf you flush the DNS now your downloads will be lost!\nDo you want to continue?\n";
        
        // if (activeDownloads > 0 && !confirm(strMsg)) {
        //     return false;
        // }
        try {
		    this.networkIoService.offline = true;

            var prefService = this.prefs.getService();
            var prefNameExpiration = "network.dnsCacheExpiration";
            var prefNameEntries = "network.dnsCacheEntries";
            var vExp = null;
            var vEntries = null;
            if (prefService.prefHasUserValue(prefNameExpiration)){
                vExp = prefService.getIntPref(prefNameExpiration);
            }
            if (prefService.prefHasUserValue(prefNameEntries)){
                vEntries = prefService.getIntPref(prefNameEntries);
            }

            prefService.setIntPref(prefNameExpiration, "0");
            prefService.setIntPref(prefNameEntries, "0");

            if (vExp != null){
                prefService.setIntPref(prefNameExpiration, vExp);
            }else{
                prefService.clearUserPref(prefNameExpiration);
            }

            if (vEntries != null){
                prefService.setIntPref(prefNameEntries, vEntries);
            }else{
                prefService.clearUserPref(prefNameEntries);
            }

		    this.cacheService.evictEntries(Components.interfaces.nsICache.STORE_ANYWHERE);
		    this.networkIoService.offline = false;      

            if (this.prefs.getBool("reload-page")) {
                var mainWindow = this.utils.getMainWindow();
                mainWindow.getBrowser().reload();
                this.reloadByUser = true;
            }
            else {
                this.updatestatus(this.actualHost, true);
            }
        }catch(e){
            this.logger.error("Error flushing DNS: " + e);
        }
    },

    flushListener: function() {
        dnsFlusher.refreshdns();
    },   
    
    eventDispatcher: function(event){
        // Fire on left and middle button
		if (event.button < 2 || event.button == undefined) {
            dnsFlusher.refreshdns();
        }
    },
	
    openPreferences: function(){
        //Use window mediator to open preferences (needed because add-ons manager window)
        var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
        var topWindow = wm.getMostRecentWindow(this.preferenceWindowType);
        if (topWindow) {
            topWindow.focus();
        }
        else {
            topWindow = wm.getMostRecentWindow(null);
            topWindow.openDialog(this.preferenceWindowURI, "", this.preferenceWindowOptions);
        }
    },
    
    loadPrefs: function(){
        var color = this.prefs.getString("label-color");
        this.utils.getElement("dnsflusher-label").setAttribute("style", "color:" + color + ";");

        var showIcon = this.prefs.getBool("show-icon");
        this.utils.getElement("dnsflusher_status_img").hidden = !showIcon;        
    },

	installButton: function() {
		var toolbar = document.getElementById("nav-bar");
        toolbar.insertItem("dnsflusher_toolbar_button");
        toolbar.setAttribute("currentset", toolbar.currentSet);
        document.persist(toolbar.id, "currentset");
	}       
};