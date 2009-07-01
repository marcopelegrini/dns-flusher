/**
 * @author marcotulio
 */
const console = Application.console;
const logPreference = "log";

var Log = {
    debug: function(string){
        if (Prefs.getBool(logPreference)) {
            console.log("[DEBUG] - " + string);
        }
    },
    info: function(string){
        if (Prefs.getBool(logPreference)) {
            console.log("[INFO] - " + string);
        }
    },
    warn: function(string){
        if (Prefs.getBool(logPreference)) {
            console.log("[WARN] - " + string);
        }
    },
    error: function(string){
        if (Prefs.getBool(logPreference)) {
            console.log("[ERROR] - " + string);
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
