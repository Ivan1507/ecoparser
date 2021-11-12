const express = require('express');
const forwardGeocoding = require("../utils/forwardGeocoding");
const router = express.Router();

const WriteFile = require("../utils/writeFile")
const ReadFile = require("../utils/readFile")


let readExcel = require("../utils/readExcel");

let EGRULData = readExcel("EGRUL")
let NBOSData = readExcel("NBOS")
let OTX2Data = readExcel("OTX2")
WriteFile('EGRUL',EGRULData)
WriteFile('NBOS',NBOSData)
WriteFile('OTX2',OTX2Data)


router.get("/test", function (req, res, next) {
    let coords = forwardGeocoding("Россия, Челябинская обл., г.Челябинск, ул. Линейная, д. 98, скл. 8")

    res.status(200).json(coords);
})

/* GET home page. */
router.get('/', function (req, res, next) {
    let plants = [];
    for (let a of EGRULData) {
        let coords = forwardGeocoding(a["Адрес"])
        if (((coords[0] - req.body.lat) ^ 2 + (coords[1] - req.body.long) ^ 2) < req.body.radius) {
            plants.push(a)
        }
        if (plants.length > 15) break
    }


    for (let plant of plants) {

    }

    res.status(200).json(testPlants);
});

//структура данных
// ПРЕДПРИЯТИЕ:
// -координаты
// -виды деятельности
// -зарегестррованно в НВОС?
//категория
function company(cord) {
    this.cord = cord;
    this.activites = [];
    this.is_NBOC = false;
    this.category = 0;
}


//заполняем все предпрития (превращаем адреса в коордмнаты)
function companies_init() {

}

//получение списка предприятий, в квадрате  из коородинат


module.exports = router;
