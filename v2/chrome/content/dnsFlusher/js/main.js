(function(namespace) {

	coders.ns("coders.dnsFlusher").main = {

		ctx: coders.dnsFlusher.applicationContext,
		currentVersion: 2,
		logger: Log.repository.getLogger("coders.dnsFlusher.main"),

		init: function() {
			this.logger.info("Starting DNS Flusher...");
		},

		configure: function() {
			this.logger.info("Configured?: " + this.ctx.preferenceUtils.getBool("configured"));
			if (!this.ctx.preferenceUtils.getBool("configured")) {
				this.logger.info("DNS Flusher first execution. Configuring...");
				// Configured
				this.ctx.preferenceUtils.setBool("configured", true);
				this.ctx.preferenceUtils.setInt("version", this.currentVersion);

				this.installButton();

				this.logger.info("DNS Flusher configured.");
			} else {
				this.handleUpgrade();
			}
		},

		handleUpgrade: function() {
			var oldVersion = this.ctx.preferenceUtils.getInt("version");
			if (oldVersion == null) {
				this.logger.info("Upgrading from version 1 to version " + this.currentVersion);
				this.ctx.preferenceUtils.setInt("version", this.currentVersion);
			}
		},

		dispatchStatusClick: function(anchor, event) {
			if (event.button == undefined || event.button < 2) {
				this.refreshDNS();
			}
		},

		refreshDNS: function(){
			this.ctx.manager.refreshDNS();
		},

		openPreferences: function() {
			//Use window mediator to open preferences (needed because add-ons manager window)
			var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
			var topWindow = wm.getMostRecentWindow(this.ctx.optionsWindowName);
			if (topWindow) {
				topWindow.focus();
			} else {
				topWindow = wm.getMostRecentWindow(null);
				topWindow.openDialog(this.ctx.optionsWindowURI, "", this.ctx.optionsWindowConfig);
			}
		},

		setup: function() {
			var color = this.ctx.preferenceUtils.getString("label-color");
	        this.ctx.browserUtils.getElement("dnsflusher-label").setAttribute("style", "color:" + color + ";");

	        var showIcon = this.ctx.preferenceUtils.getBool("show-icon");
	        this.ctx.browserUtils.getElement("dnsflusher_status_img").hidden = !showIcon;
		},

		installButton: function() {
			var toolbar = this.ctx.browserUtils.getElement("nav-bar");
	        toolbar.insertItem("dnsflusher_toolbar_button");
	        toolbar.setAttribute("currentset", toolbar.currentSet);
	        document.persist(toolbar.id, "currentset");
		}
	};

	window.addEventListener("load", function() {
		//Contruct
		coders.dnsFlusher.main.init();

		//Configure if its necessary
		coders.dnsFlusher.main.configure();
		coders.dnsFlusher.main.setup();
		coders.dnsFlusher.manager.start();
	}, false);
})();
