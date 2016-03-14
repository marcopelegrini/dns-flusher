Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function DNSFlusher() {
	this.wrappedJSObject = this;
}

DNSFlusher.prototype = {
	classID: Components.ID("{7d575baa-b543-11dc-8314-0800200c9a67}"),
	QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDNSFlusher, Components.interfaces.nsIObserver])
};

const NSGetFactory = XPCOMUtils.generateNSGetFactory([DNSFlusher]);