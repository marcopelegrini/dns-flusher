/**
 * @author marcotulio
 */
const dFConsole = Application.console;
const dFLogPreference = "log";

var CTechLog = {
    debug: function(string){
        if (CTechPrefs.getBool(dFLogPreference)) {
            dFConsole.log("[DEBUG] - " + string);
        }
    },
    info: function(string){
        if (CTechPrefs.getBool(dFLogPreference)) {
            dFConsole.log("[INFO] - " + string);
        }
    },
    warn: function(string){
        if (CTechPrefs.getBool(dFLogPreference)) {
            dFConsole.log("[WARN] - " + string);
        }
    },
    error: function(string){
        if (CTechPrefs.getBool(dFLogPreference)) {
            dFConsole.log("[ERROR] - " + string);
        }
    }
}

var CTechUtils = {
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
    
    getElement: function(id, aDocument){
        if (aDocument) {
            return aDocument.getElementById(id);
        }
        return document.getElementById(id);
    }
}
