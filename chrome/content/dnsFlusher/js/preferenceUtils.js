/**
 * @author marcotulio
 */
// Preferences contants
const branchName = "extensions.dnsFlusher.";
const preferenceWindowType = "dnsFlusher:settings";
const preferenceWindowURI = "chrome://dnsFlusher/content/options.xul";
const preferenceWindowOptions = "chrome,toolbar,centerscreen";

var prefs = null;

var Prefs = {
    load: function(){
    },
    getPrefs: function(){
        if (prefs == null) {
            var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
            prefs = prefService.getBranch(branchName);
        }
        return prefs;
    },
    getBool: function(value){
        return this.getPrefs().getBoolPref(value);
    },
    open: function(){
        var wm = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
        var topWindow = wm.getMostRecentWindow(preferenceWindowType);
        
        if (topWindow) {
            topWindow.focus();
        }
        else {
            topWindow = wm.getMostRecentWindow(null);
            topWindow.openDialog(preferenceWindowURI, "", preferenceWindowOptions);
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
                Log.debug("Cleaning... " + prefs[i]);
                prefBranch.clearUserPref(prefs[i]);
            }
            else {
                Log.debug("User doesn't set this value: " + prefs[i]);
            }
        }
    }
}
