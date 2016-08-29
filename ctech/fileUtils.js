Components.utils.import("resource://gre/modules/osfile.jsm");
Components.utils.import("resource://gre/modules/Task.jsm");

(function(coders){
    coders.fileUtils = {

        /**
         * Get a file instance from filePath
         *
         * @param {Object} filePath
         */
        getFile: function(filePath){
            if (!filePath || filePath.trim() == "") {
                return;
            }
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(filePath);
            return file;
        },

        /**
         * Get FilePicker Interface
         */
        getFilePicker: function(){
            var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
            return fp;
        },

        /**
         * Save a content to a file. If the file does not exists, create one
         *
         * @param {Object} filePath
         */
        save: function(filePath, output){
            try {
                var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                file.initWithPath(filePath);
                if (!file.exists()) {
                    file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
                }
                this.saveFile(file, output);
            }catch(ex){
                throw Error("Error saving " + filePath + ". Check file permission." + ex.message);
            }
        },

        delete: function(filePath, recursive){
            try{
                var file = this.getFile(filePath);
                file.remove(recursive);
            }catch(ex){
                throw "Error deleting " + filePath + ". Check file permission." + ex;
            }
        },

        saveFile: function(file, output){
            try {
                if(file){
                    var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    /* Open flags
                     #define PR_RDONLY       0x01
                     #define PR_WRONLY       0x02
                     #define PR_RDWR         0x04
                     #define PR_CREATE_FILE  0x08
                     #define PR_APPEND       0x10
                     #define PR_TRUNCATE     0x20
                     #define PR_SYNC         0x40
                     #define PR_EXCL         0x80
                     */
                    /*
                     ** File modes ....
                     **
                     ** CAVEAT: 'mode' is currently only applicable on UNIX platforms.
                     ** The 'mode' argument may be ignored by PR_Open on other platforms.
                     **
                     **   00400   Read by owner.
                     **   00200   Write by owner.
                     **   00100   Execute (search if a directory) by owner.
                     **   00040   Read by group.
                     **   00020   Write by group.
                     **   00010   Execute by group.
                     **   00004   Read by others.
                     **   00002   Write by others
                     **   00001   Execute by others.
                     */
                    //outputStream.init(file, 0x04 | 0x08 | 0x20, 420, 0);
                    outputStream.init(file, -1, -1, 0);
                    var result = outputStream.write(output, output.length);
                    outputStream.close();
                }else{
                    throw new Error("File not defined.");
                }
            }
            catch (ex) {
                throw ex;
            }
        },

        /**
         * Read a text file from filePath
         *
         * @param {Object} filePath
         * @return {String} content
         */
        read: function(filePath){
            var decoder = new TextDecoder();

            return Task.spawn(function*() {
              var exists = yield OS.File.exists(filePath);
              if (exists){
                var file = yield OS.File.read(filePath);
                return decoder.decode(file);
              }else{
                throw new Error("File does not exist.");
              }
            })
        },

        decodeFile: function(array){
            try {
                console.log("C:" + array);
                let decoder = new TextDecoder();
                var text = decoder.decode(value);
                console.log("E"+text);
                return Promise.resolve(text);
            } catch(ex){
                return Promise.reject(ex);
            }
        },

        /**
         * Execute a file from filePath
         *
         * @param {Object} filePath
         */
        execute: function(filePath, sudo){
	            var file = null;
	            var params = [];

	            if (sudo != undefined && sudo == true){
	                file = this.getFile("/usr/bin/sudo");
	                params = [filePath];
	            } else {
	                file = this.getFile(filePath);
	                if (file.exists()) {
	                    if (!file.isFile()) {
	                        throw filePath + "is not a file";
	                    }
	                }
	                else {
	                    throw "File '" + filePath + "' does not exists.";
	                }
	            }

				try {
            		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		            process.init(file);
		            // Run the process.
		            // If first param is true, calling thread will be blocked until called process terminates.
		            // Second and third params are used to pass command-line arguments to the process.
		            process.runw(true, params, params.length);
				}catch(ex){
					console.log(ex);
					throw new Error("Error executing " + filePath + ex)
				}
        },

        getFileSeparator: function(){
            return coders.browserUtils.isWindows() ? "\\" : "/";
        }
    }
})(window.coders = window.coders||{});
