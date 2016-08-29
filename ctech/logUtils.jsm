var EXPORTED_SYMBOLS = ["configureLogger"];

Components.utils.import("resource://gre/modules/Log.jsm");

var initialized = false;

function configureLogger(rootPackage, logLevel){
	if (!initialized){
		let logger = Log.repository.getLogger(rootPackage);
		logger.addAppender(new Log.ConsoleAppender());
		logger.level = this.getLevelFromString(logLevel);
		initialized = true;
		logger.info("Logger initialized for package: " + rootPackage)
	}
}

function getLevelFromString(string){
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
