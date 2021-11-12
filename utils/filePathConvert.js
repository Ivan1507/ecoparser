let path = require("path")
module.exports = function (filename) {
   return path.join(__dirname, `/../excel/${filename}`);
}
