/**
 * @author marcotulio
 */
function DNSFlusherOptions(utils){
	
	this.utils = utils;
	
    this.colorChanged = function(){
        var color = CTechUtils.getElement("dF-color-picker").color;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var browserWindow = wm.getMostRecentWindow("navigator:browser");
        
        this.utils.getElement("dnsflusher-label", browserWindow.document).setAttribute("style", "color:" + color + ";");
    }
}
