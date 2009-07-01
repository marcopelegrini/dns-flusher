var Options = {
    colorChanged: function(){
        var color = document.getElementById("dF-color-picker").color;
        //var panel = parent.getElementById("dnsflusher_panel");
		//Log.info(document.getElementById("sidebar").contentDocument);
        //Log.info(document);
        //Log.info(parent);
		Log.info(window.parent.document.getAttribute("windowtype"));
        //        panel.addAttribute("style", "color:" + color + ";");
    }
}
