var DNSFlusherOptions = {
    colorChanged: function(){
        var color = CTechUtils.getElement("dF-color-picker").color;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var browserWindow = wm.getMostRecentWindow("navigator:browser");
        
		CTechUtils.getElement("dnsflusher-label", browserWindow.document).setAttribute("style","color:"+color+";");
    }
}
