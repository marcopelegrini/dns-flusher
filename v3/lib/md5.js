var {Cc, Ci} = require("chrome");

// return the two-digit hexadecimal code for a byte
function toHexString(charCode) {
  return ("0" + charCode.toString(16)).slice(-2);
}

function md5File(path) {
  var f = Cc["@mozilla.org/file/local;1"]
          .createInstance(Ci.nsILocalFile);
  f.initWithPath(path);
  var istream = Cc["@mozilla.org/network/file-input-stream;1"]
                .createInstance(Ci.nsIFileInputStream);
  // open for reading
  istream.init(f, 0x01, 0444, 0);
  var ch = Cc["@mozilla.org/security/hash;1"]
           .createInstance(Ci.nsICryptoHash);
  // we want to use the MD5 algorithm
  ch.init(ch.MD5);
  // this tells updateFromStream to read the entire file
  const PR_UINT32_MAX = 0xffffffff;
  ch.updateFromStream(istream, PR_UINT32_MAX);
  // pass false here to get binary data back
  var hash = ch.finish(false);

  // convert the binary hash data to a hex string.
  var s = Array.from(hash, (c, i) => toHexString(hash.charCodeAt(i))).join("");
  return s;
}

exports.hashFile = md5File;
