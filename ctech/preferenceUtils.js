(function(coders) {

	coders.preferenceUtils = function(branchName, bundleName) {

		this.prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		this.branchName = branchName;
		this.bundleName = bundleName;
		this.prefsBranch = null;

		//Get preferences branch
		this.getPrefs = function(branchName) {
			//Lazy loading
			if (branchName){
				return this.prefService.getBranch(branchName);
			}else{
				if (!this.prefsBranch) {
					this.prefsBranch = this.prefService.getBranch(this.branchName);
				}
				return this.prefsBranch;
			}
		}

		this.getBool = function(name, branchName) {
			try {
				return this.getPrefs(branchName).getBoolPref(name);
			} catch (e) {
				return null;
			}
		}

		this.setBool = function(name, value, branchName) {
			try {
				this.getPrefs(branchName).setBoolPref(name, value);
			} catch (e) {
				throw "Could not set preference " + name + " to value " + value;
			}
		}

		this.getString = function(name, branchName) {
			try {
				return this.getPrefs(branchName).getCharPref(name);
			} catch (e) {
				return null;
			}
		}

		this.setString = function(name, value, branchName) {
			try {
				this.getPrefs(branchName).setCharPref(name, value);
			} catch (e) {
				throw "Could not set preference " + name + " to value " + value;
			}
		}

		this.getInt = function(name, branchName) {
			try {
				return this.getPrefs(branchName).getIntPref(name);
			} catch (e) {
				return null;
			}
		}

		this.setInt = function(name, value, branchName) {
			try {
				this.getPrefs(branchName).setIntPref(name, value);
			} catch (e) {
				throw "Could not set preference " + name + " to value " + value;
			}
		}

		this.clear = function(name, branchName) {
			try {
				this.getPrefs(branchName).clearUserPref(name);
			} catch (e) {
				throw "Could not reset preference " + name;
			}
		}

		this.getStringList = function(name) {
			try {
				var list = this.getString(name);
				if (list && list != null) {
					return list.split(',');
				} else {
					return null;
				}
			} catch (e) {
				return null;
			}
		}

		this.addToStringList = function(name, value) {
			var list = this.getString(name);
			if (list && list != null) {
				this.setString(name, list += ',' + value);
			} else {
				this.setString(name, value);
			}
		}

		this.removeFromStringList = function(name, value) {
			var array = this.getStringList(name);
			if (array != null && array.length > 0) {
				for (var i = 0; i < array.length; i++) {
					if (array[i] == value) {
						array.splice(i, 1);
						this.setString(name, array.toString());
						return true;
					}
				};
			}
			return false;
		}

		this.resetUserPreferences = function() {
			var prefBranch = this.getPrefs();
			var c = {
				value: 0
			};
			var chindren = prefBranch.getChildList("", c);
			for (var i = 0; i < c.value; ++i) {
				if (prefBranch.prefHasUserValue(chindren[i])) {
					prefBranch.clearUserPref(chindren[i]);
				}
			}
		}

		this.getSBundle = function() {
			return document.getElementById(this.bundleName);
		}
	}
})(window.coders = window.coders||{});
