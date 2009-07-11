/**
 * @author marcotulio
 */
function CTechPrefs(branchName, windowType, windowURI, windowOptions){

    // Preferences contants
    this.branchName = branchName;
    this.windowType = windowType;
    this.windowURI = windowURI;
    this.windowOptions = windowOptions;
    
    //Singleton instance
    this.prefs = null;
	this.logger
    
    //Get preferences branch
    this.getPrefs = function(){
		//Lazy loading
        if (!this.prefs) {
            var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            this.prefs = prefService.getBranch(this.branchName);
        }
        return this.prefs;
    }
    
    this.getBool = function(value){
        return this.getPrefs().getBoolPref(value);
    }
    
    this.getString = function(value){
        return this.getPrefs().getCharPref(value);
    }
    
	this.setLogger = function(logger){
		this.logger = logger;
	}
	
    //Use window mediator to open preferences (needed because add-ons manager window)
    this.open = function(){
        var wm = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
        var topWindow = wm.getMostRecentWindow(this.windowType);
        
        if (topWindow) {
            topWindow.focus();
        }
        else {
            topWindow = wm.getMostRecentWindow(null);
            topWindow.openDialog(this.windowURI, "", this.windowOptions);
        }
    }
    
    this.reset = function(){
        var prefBranch = this.getPrefs();
        var c = {
            value: 0
        };
        var chindren = prefBranch.getChildList("", c);
        for (var i = 0; i < c.value; ++i) {
            if (prefBranch.prefHasUserValue(chindren[i])) {
                this.logger.debug("Cleaning... " + chindren[i]);
                prefBranch.clearUserPref(chindren[i]);
            }
            else {
                this.logger.debug("User doesn't set this value: " + chindren[i]);
            }
        }
    }
}
