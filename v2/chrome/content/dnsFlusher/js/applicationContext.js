(function(){

    coders.ns("coders.dnsFlusher").applicationContext = {
        // Constants
		extensionName: "DNS Flusher",
        branchName: "extensions.dnsFlusher.",
		bundleName: "coders.dnsFlusher.string-bundle",

		optionsWindowName: "extensions:settings",
		optionsWindowURI: "chrome://dnsFlusher/content/options.xul",
	    optionsWindowConfig: "chrome,toolbar,centerscreen",
		logLevelPref: "log-level",

        // Utils
        browserUtils: null,
        fileUtils: null,
        preferenceUtils: null,
		manager: null,

        init: function(){
        		if(coders.browserUtils){
                	this.browserUtils = coders.browserUtils;
        		}

        		if(coders.fileUtils){
                	this.fileUtils = coders.fileUtils;
        		}

        		if(coders.preferenceUtils){
                	this.preferenceUtils = new coders.preferenceUtils(this.branchName, this.bundleName);
        		}

                if(coders.logUtils){
					var logLevel = this.preferenceUtils.getString(this.logLevelPref);
					coders.logUtils.configureLogger("coders.dnsFlusher", logLevel);
                }

                if(coders.dnsFlusher.manager){
                	this.manager = coders.dnsFlusher.manager;
					this.manager.setContext(this);
                }

                if(this.logUtils){
                	this.logger.info('DNS Flusher ApplicationContext configured');
                }
        },

        destroy: function(){
            this.logger.info('DNS Flusher ApplicationContext destroied');
        }
    };
    //Construct as soon as file loads
    coders.dnsFlusher.applicationContext.init();
})();
