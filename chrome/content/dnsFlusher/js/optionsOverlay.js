var Options = {
    colorChanged: function(){
        var color = document.getElementById("dF-color-picker").color;
        
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var browserWindow = wm.getMostRecentWindow("navigator:browser");
        
		browserWindow.document.getElementById("dnsflusher_panel").setAttribute("style","color:"+color+";");
    }
}
