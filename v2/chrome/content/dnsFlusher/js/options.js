(function() {

	coders.ns("coders.dnsFlusher").options = {

		ctx: coders.dnsFlusher.applicationContext,

	    colorChanged: function(){
	        var color = this.ctx.browserUtils.getElement("dF-color-picker").color;
	        var browserWindow = this.ctx.browserUtils.getBrowserWindow();
	        this.ctx.browserUtils.getElement("dnsflusher-label", browserWindow.document).setAttribute("style", "color:" + color + ";");
	    },

	    showHideViewElements: function(element, show){
	        var browserWindow = this.ctx.browserUtils.getBrowserWindow();
	        this.ctx.browserUtils.getElement(element, browserWindow.document).hidden = !show;
	    }
	}
})();
