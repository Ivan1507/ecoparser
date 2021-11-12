let path = require("path");

let fileConverter = require("../utils/filePathConvert")
const xlsx = require("xlsx");

module.exports = function (excelName) {
    let file = fileConverter(`${excelName}.xlsx`)
    const excelFile = xlsx.readFile(file);
    let sheetNames = excelFile.SheetNames;
    return xlsx.utils.sheet_to_json(excelFile.Sheets[sheetNames[0]]);
}
