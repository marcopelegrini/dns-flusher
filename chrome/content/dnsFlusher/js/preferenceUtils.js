/**
 * @author marcotulio
 */
// Preferences contants
const dFBranchName = "extensions.dnsFlusher.";
const dFPreferenceWindowType = "dnsFlusher:settings";
const dFPreferenceWindowURI = "chrome://dnsFlusher/content/options.xul";
const dFPreferenceWindowOptions = "chrome,toolbar,centerscreen";

//Singleton instance
var prefs = null;

var CTechPrefs = {
    load: function(){
    },
    getPrefs: function(){
        if (prefs == null) {
            var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            prefs = prefService.getBranch(dFBranchName);
        }
        return prefs;
    },
    getBool: function(value){
        return this.getPrefs().getBoolPref(value);
    },
    getString: function(value){
    	return this.getPrefs().getCharPref(value);
    },
    open: function(){
        var wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
        var topWindow = wm.getMostRecentWindow(dFPreferenceWindowType);
        
        if (topWindow) {
            topWindow.focus();
        }
        else {
            topWindow = wm.getMostRecentWindow(null);
            topWindow.openDialog(dFPreferenceWindowURI, "", dFPreferenceWindowOptions);
        }
    },
    reset: function(){
        var prefBranch = Prefs.getPrefs();
        var c = {
            value: 0
        };
        var prefs = prefBranch.getChildList("", c);
        for (var i = 0; i < c.value; ++i) {
            if (prefBranch.prefHasUserValue(prefs[i])) {
                CTechLog.debug("Cleaning... " + prefs[i]);
                prefBranch.clearUserPref(prefs[i]);
            }
            else {
                CTechLog.debug("User doesn't set this value: " + prefs[i]);
            }
        }
    }
}
