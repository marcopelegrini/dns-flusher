(function(coders){
    coders.browserUtils = {

        getOperationSystem: function(){
            var sysInfo = Components.classes['@mozilla.org/system-info;1'].getService(Components.interfaces.nsIPropertyBag2);
            var plataform = sysInfo.getProperty('name');
            return plataform;
        },

        isWindows: function(){
            return this.getOperationSystem().indexOf("Windows") != -1;
        },

        isMacOS: function(){
            return this.getOperationSystem().indexOf("Darwin") != -1;
        },

        getElement: function(id, aDocument){
            if (aDocument) {
                return aDocument.getElementById(id);
            }
            return document.getElementById(id);
        },

        getBrowserWindow: function(){
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
            return wm.getMostRecentWindow("navigator:browser");
        },

		getMainWindow: function(){
	        return window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	                        .getInterface(Components.interfaces.nsIWebNavigation)
	                        .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
	                        .rootTreeItem
	                        .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
	                        .getInterface(Components.interfaces.nsIDOMWindow);
	    },

        getWindowByType: function(windowType){
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
            return wm.getMostRecentWindow(windowType);
        },

        isBlank: function(string){
            if (string && string != null && string != undefined) {
                if (string.trim().length > 0) {
                    return false;
                }
            }
            return true;
        },

        equalsIgnoreCase: function(string1, string2){
            return string1.toUpperCase().trim() === string2.toUpperCase().trim();
        },

        endsWith: function (string, find) {
            return string.length >= find.length && string.substr(string.length - find.length) == find;
        },

        showNotification: function(title, text){
            var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
            alertsService.showAlertNotification(null, title, text, false, '', null);
        },

        showAlert: function(title, text){
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
            prompts.alert(null, title, text);
        },

        showPrompt: function(title, text, buttonLabel){
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

            // default the checkbox to false
			var checkboxTitle = null;
            var check = {value: false};

            var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                        prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL;

            return prompts.confirmEx(null, title, text, flags, buttonLabel, null, null, null, check);
        }
    }
})(window.coders = window.coders||{});
