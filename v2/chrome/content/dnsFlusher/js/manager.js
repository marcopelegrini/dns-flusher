(function() {

	Components.utils.import("resource://gre/modules/Services.jsm");
	Components.utils.import("resource://gre/modules/Downloads.jsm");

	coders.ns("coders.dnsFlusher").manager = {

		ctx: null,
		logger: Log.repository.getLogger("coders.dnsFlusher.manager"),

		//Firefox Services
		dnsService: Components.classes["@mozilla.org/network/dns-service;1"].getService(Components.interfaces.nsIDNSService),
		networkIoService: Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService),
		threadManager: Components.classes["@mozilla.org/thread-manager;1"].getService(),

		reloadByUser: false,
		listener: null,
		actualHost: null,

		networkBranchName: "network.",

		setContext: function(applicationContext){
			this.ctx = applicationContext;
		},

		start: function(){
			this.listener = {
				onLocationChange: function(aProgress, aRequest, aLocation){
					try {
						if (aLocation && aLocation.host && (aLocation.scheme != 'chrome') && (aLocation.scheme != 'file')) {
							this.parent.logger.debug("Location changed: " + aLocation.host);
							this.parent.updateStatusBar(aLocation.host);
						}
						else {
							this.parent.logger.debug("Updating to clean");
							this.parent.updateStatusBar();
						}
					}
					catch (e) {
						this.parent.logger.trace("Exception caught: " + e);
						this.parent.updateStatusBar();
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
			this.listener.parent = this;

			window.getBrowser().addProgressListener(this.listener);

			this.addDNSFlusherListener();
		},

		// Add a listener so other extensions can call DNS Flusher
		addDNSFlusherListener: function(){
			var mainWindow = this.ctx.browserUtils.getMainWindow();
			mainWindow.document.addEventListener("DNSFlusherEvent", function() {
				coders.dnsFlusher.manager.refreshDNS();
			}, false);
		},

		updateStatusBar: function(host, byUser = false){
			this.logger.debug("Updating status for host: " + host + " by user: " + byUser);
			if (!host) {
				this.updateLabel();
				return;
			}
			//Check host
			this.actualHost = host;
			this.resolveIp(host, byUser);
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
					let flags = this.dnsService.RESOLVE_BYPASS_CACHE | this.dnsService.RESOLVE_CANONICAL_NAME;
					this.dnsService.asyncResolve(host, flags, dataListener, target);
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

		updateLabel: function(host, ips, byUser = false){
			this.logger.debug("Updating label: " + ips + " by user: " + byUser);
			var ipLabel = this.ctx.browserUtils.getElement('dnsflusher-label');
			this.cleanTooltip();
			//Status bar label
			if (host && ips && ips.length) {
				var j = 0;
				var text = ips[j];
				//Update label
				if ((byUser || this.reloadByUser) && this.ctx.preferenceUtils.getBool("label-efect")) {
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
				ipLabel.value = this.ctx.extensionName;
			}
			this.reloadByUser = false;
		},

		cleanTooltip: function(){
			//Remove old tooltips
			var tooltip = this.ctx.browserUtils.getElement('dnsflusher-tooltip');
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
			var tooltip = this.ctx.browserUtils.getElement('dnsflusher-tooltip');
			tooltip.appendChild(tooltipTitle);
			tooltip.setAttribute("style", "padding:2px;");
			for (var i = 0; i < ips.length; i++) {
				this.logger.debug("Creating tooltip label for ip: " + ips[i]);
				var label = document.createElement("label");
				label.setAttribute("value", ips[i]);
				tooltip.appendChild(label);
			}
		},

		refreshDNS: function(){
			//Check for active downloads
			Downloads.getSummary(Downloads.ALL).then(summary => {
				var msg = this.ctx.preferenceUtils.getSBundle().getString("dF.stopDownloads");
				//If all downloads are stoped or user confirm then proceed
				if (summary.allHaveStopped || confirm(msg)) {
					try {
						//Offline mode
						this.networkIoService.offline = true;

						//Clean cache values
						var prefNameEntries = "dnsCacheEntries";
						var prefNameExpiration = "dnsCacheExpiration";
						var prefNameExpirationGrace = "dnsCacheExpirationGracePeriod"
						var vEntries = this.disableNetworkProperty(prefNameEntries);
						var vExp = this.disableNetworkProperty(prefNameExpiration);
						var vGrace = this.disableNetworkProperty(prefNameExpirationGrace);

						//Redefine them
						this.redefineProperty(prefNameEntries, vEntries);
						this.redefineProperty(prefNameExpiration, vExp);
						this.redefineProperty(prefNameExpirationGrace, vGrace);

						//Clear cache
						Services.cache2.clear();
						//Online mode
						this.networkIoService.offline = false;

						if (this.ctx.preferenceUtils.getBool("reload-page")) {
							var browser = this.ctx.browserUtils.getBrowserWindow().getBrowser();
							// browser.reloadWithFlags(browser.webNavigation.LOAD_FLAGS_BYPASS_CACHE);
							browser.reload();
							this.reloadByUser = true;
						}
						else {
							this.updateStatusBar(this.actualHost, true);
						}
					}catch(e){
						this.logger.error("Error flushing DNS: " + e);
					}
				}
			}).catch(exception => {
				this.logger.error(exception);
			})
		},

		disableNetworkProperty: function(propertyName){
			var oldValue = this.ctx.preferenceUtils.getInt(propertyName, this.networkBranchName);
			this.ctx.preferenceUtils.setInt(propertyName, "0", this.networkBranchName);
			return oldValue;
		},

		redefineProperty: function(propertyName, value){
			if (value != null){
				this.ctx.preferenceUtils.setInt(propertyName, value, this.networkBranchName);
			}else{
				this.ctx.preferenceUtils.clear(propertyName, this.networkBranchName);
			}
		}
	}
})();
