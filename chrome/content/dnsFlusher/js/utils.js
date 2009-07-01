/**
 * @author marcotulio
 */
const dFConsole = Application.console;
const dFLogPreference = "log";

var Log = {
    debug: function(string){
        if (Prefs.getBool(dFLogPreference)) {
            dFConsole.log("[DEBUG] - " + string);
        }
    },
    info: function(string){
        if (Prefs.getBool(dFLogPreference)) {
            dFConsole.log("[INFO] - " + string);
        }
    },
    warn: function(string){
        if (Prefs.getBool(dFLogPreference)) {
            dFConsole.log("[WARN] - " + string);
        }
    },
    error: function(string){
        if (Prefs.getBool(dFLogPreference)) {
            dFConsole.log("[ERROR] - " + string);
        }
    }
}

var Utils = {
    getOperationSystem: function(){
        const Cc = Components.classes;
        const Ci = Components.interfaces;
        var sysInfo = Cc['@mozilla.org/system-info;1'].getService(Ci.nsIPropertyBag2);
        var plataform = sysInfo.getProperty('name');
        return plataform;
    },
    
    trim: function(string){
        if (string != null && string != undefined) {
            return string.replace(/^\s*/, "").replace(/\s*$/, "");
        }
        return string;
    },
	
    getElement: function(id){
        return document.getElementById(id);
    }
}
