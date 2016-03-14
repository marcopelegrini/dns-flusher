var self = require("sdk/self");
var tabs = require("sdk/tabs");
var buttons = require('sdk/ui/button/action');

var filepicker = require("./lib/filepicker.js");
var md5 = require("./lib/md5.js");

var button = buttons.ActionButton({
  id: "mozilla-link",
  label: "Visit Mozilla",
  icon: {
    "16": "./new-icon16.png",
    "32": "./new-icon32.png",
    "64": "./new-icon64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  // tabs.open("http://www.mozilla.org/");
  console.log(md5.hashFile(filepicker.promptForFile()));
}
