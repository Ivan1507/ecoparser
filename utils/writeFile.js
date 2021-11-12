const fs = require("fs");
function WriteFile(filename = 'weather', jsonBody) {
    let filePath = path.join(__dirname, `/../${filename}.json`);
    if (!ExistsFile(filename)) {

        fs.writeFileSync(filePath, jsonBody, {}, (err) => {
            if (err) console.log('error!')
        });
    } else {
        fs.writeFile(filePath, jsonBody, {}, (err) => {
            if (err) console.log('error!')
        });
    }
}
module.exports = WriteFile
