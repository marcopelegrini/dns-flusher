/**
 * @author marcotulio
 */
var dnsFlusherOptions = {
	
	utils: new CTechUtils(),
	
    colorChanged: function(){
        var color = this.utils.getElement("dF-color-picker").color;
        var browserWindow = this.utils.getBrowserWindow();
        this.utils.getElement("dnsflusher-label", browserWindow.document).setAttribute("style", "color:" + color + ";");
    },

    showHideViewElements: function(element, show){
        var browserWindow = this.utils.getBrowserWindow();
        this.utils.getElement(element, browserWindow.document).hidden = !show;
    }
}
