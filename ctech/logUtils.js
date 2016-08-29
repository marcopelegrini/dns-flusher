Components.utils.import("resource://gre/modules/Log.jsm");

(function(coders){

	coders.logUtils = {

		initialized: [],

		configureLogger: function(rootPackage, logLevel){
			if (!this.initialized[rootPackage]){
				console.log(">>>" + rootPackage);
				console.log(this.initialized);
				let logger = Log.repository.getLogger(rootPackage);
				let appender = new Log.ConsoleAppender();
				logger.removeAppender(appender);
				logger.addAppender(appender);
				logger.level = this.getLevelFromString(logLevel);
				this.initialized[rootPackage] = true;
			}
		},

		getLevelFromString: function(string){
			switch (string)
			{
				case 'ERROR':
				case 'error':
				return Log.Level.Error;
				case 'WARN':
				case 'warn':
				return Log.Level.Warn;
				case 'INFO':
				case 'info':
				default:
				return Log.Level.Info;
				case 'DEBUG':
				case 'debug':
				return Log.Level.Debug;
				case 'TRACE':
				case 'trace':
				return Log.Level.Trace;
			}
		}
	}
})(window.coders = window.coders||{});
