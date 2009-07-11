/**
 * @author marcotulio
 */
var dnsFlusherOptions = {
	
	utils: new CTechUtils(),
	
    colorChanged: function(){
        var color = this.utils.getElement("dF-color-picker").color;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var browserWindow = wm.getMostRecentWindow("navigator:browser");
        
        this.utils.getElement("dnsflusher-label", browserWindow.document).setAttribute("style", "color:" + color + ";");
    }
}
