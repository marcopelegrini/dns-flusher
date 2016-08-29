(function(coders){
    coders.ns = function(name, separator, container){
		let ns = name.split(separator || '.');
		let	o = container || window;
		let	i;
		let	len;
		for(i = 0, len = ns.length; i < len; i++){
			o = o[ns[i]] = o[ns[i]] || {};
		}
		return o;
	}
})(window.coders = window.coders||{});
