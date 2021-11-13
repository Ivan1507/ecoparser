const express = require("express");
const forwardGeocoding = require("../utils/forwardGeocoding");
const router = express.Router();

const WriteFile = require("../utils/writeFile");
const ReadFile = require("../utils/readFile");
const readExcel = require("../utils/readExcel");
const measure = require("../utils/distance");
const pollutionFn = require("../utils/pollution");
// let EGRULData = readExcel("EGRUL.xlsx")ж
// let NBOSData = readExcel("NBOS.xlsx")
// let EmissionData = readExcel("emissions_permits.xlsx")
// WriteFile('EGRULData',JSON.stringify(EGRULData))
// WriteFile('NBOSData',JSON.stringify(NBOSData))
// WriteFile('EmissionData',JSON.stringify(EmissionData))

let EGRULData = ReadFile("EGRULData");
let NBOSData = ReadFile("NBOSData");
let EmissionData = ReadFile("EmissionData");

console.log(EmissionData)

router.get("/test", function (req, res, next) {
    let coords = forwardGeocoding("Россия, Челябинская обл., г.Челябинск, ул. Линейная, д. 98, скл. 8");
     res.status(200).json(coords);
})

router.get("/forwardGeocoding", function (req, res, next) {
    let coords = forwardGeocoding("Россия, Челябинская обл., г.Челябинск, ул. Линейная, д. 98, скл. 8");
    let plants = [];
    let file = {};
    for (let plant of EGRULData) {
        file[plant["Адрес"]] = forwardGeocoding(plant["Адрес"]);
        if (plants.length > 6000) break;
    }
    WriteFile("points", JSON.stringify(file));
    res.status(200).json({message: "Успешно"});
})

router.get("/checkPollution/:lat/:long/:radius/:limit", async function (req, res, next) {
    console.log("Запрос")
    let plants = []; //Книги, газеты, журналы и прочая продукция издательств
    let Factory_TYPES = [
        /металлообработка/,
        /металлообработки/,
        /металлолом/,
        "металла",
        "Металлы",
        "металл",
        "резка",
        "шлифовка",
        "обработка",
        "Лакокрасочные",
        "окраска",
        "поверхностей",
        "сжигание",
        "топлива",
        "газовое",

        "газовая",
        "дрова",
        "уголь",
        "полеты",
        "котельные",
        "сжигание",
        "дров",
        "гриль",
        "пищевое",
        "Пересыпка",
        "Плавка",
        "печь", "отопления"

    ]
    let pollution_plants = []
    let forward_geocoding = ReadFile("points");

    let lat = parseFloat(req.params.lat);
    let long = parseFloat(req.params.long);
    let radius = parseFloat(req.params.radius);
    for (let a of EGRULData) {
        let coords = forward_geocoding[a["Адрес"]];
        let dist = measure(coords[0], coords[1], lat, long);
        if (dist < radius) {
            plants.push(a)
        }

        if (plants.length > parseInt(req.params.limit)-1) break
    }

    for (let plant of plants) {
        // Заполняем значениями по умолчанию
        plant.is_register_NBS = false;
        plant.ocved = null;
        plant.permitted_emission = null;

        for (let nbosData of NBOSData) {
            if (plant['ИНН'] == nbosData['ИНН']) {
                plant.is_register_NBS = true; // Загрязняющее предприятие, зарегистрированное
                plant.ocved = String(nbosData["ОКВЭД"]).split(",");
                plant.category = nbosData["Категория \r\nобъекта НВОС"];
            }
        }

        for (let test_emission of EmissionData) {
            if (plant['ИНН'] == test_emission['Идентификационный номер налогоплательщика']) {
                plant.permitted_emission = test_emission['Разрешенный выброс вредных (загрязняющих) веществ в пределах утвержденных нормативов ПДВ']
                if (test_emission['Номер и дата выдачи разрешения на выброс вредных (загрязняющих) веществ в атмосферный воздух'] == "истек срок действия") {
                    plant = {
                        empty: true
                    };
                }
            }
        }

        for (let test_PDK of NBOSData) {
            plant.PDK_test = false
            if (plant['ИНН'] == test_PDK['ИНН']) {
                let max_PDK = plant.permitted_emission;
                plant.real_PDK = test_PDK["Суммарный выброс, т/год"];
            }
        }

        if ((plant.category === 2 || plant.category === 1) && plant.is_register_NBS === false) {
            plant.WARNING = true;
        }

    }
    for (let plant of plants) {
        console.log("Загрязнение");
        let coords = forward_geocoding[plant["Адрес"]];
        let co = await pollutionFn(coords[0], coords[1]);
        pollution_plants.push({
            sum: co,
            plant: plant["ИНН"]
        })
        // TODO: update
        plant.map_pollution = co
    }
    pollution_plants.sort(function (a, b) {
        return b.sum - a.sum;
    })
    pollution_plants.length = 4;

    for (let plant of plants) {
        if (plant.empty === true) { continue}
        let type_of_activity = plant["Вид деятельности"]
        let test = false;
        for (let type of Factory_TYPES) {
            if (type_of_activity.match(type)) {
                test = true
            }
        }
        if (test) {
            plant.isFactory = true;
        } else {
            plant.isFactory = false;
        }
        plant.coords = forward_geocoding[plant["Адрес"]]
// Если топ-20 и завод, и незарег
        // 100% нарушает
        // Если незарег + незавод + топ20 - 70% нарушает
        // Незар и ничего - все норм
        for (let r of pollution_plants) {
            if (r === undefined) continue
            if (r.plant === plant["ИНН"]) {
                plant.TOP_5 = true
            }
        }
    }

    res.status(200).json(plants);
})


/* GET home page. */
router.get('/', function (req, res, next) {
    let plants = [];
    for (let a of EGRULData) {
        let coords = forwardGeocoding(a["Адрес"])
        plants.push(a)
        // if (plants.length > 6000) break
    }

    for (let plant of plants) {
        plant.is_register_NBS = false
        plant.ocved = null
        plant.permitted_emission = null;
        // ОКВЭД и регистрация
        // TODO: CATEGORY

        for (let nbosData of NBOSData) {
            if (plant['ИНН'] == nbosData['ИНН']) {
                //     console.log(nbosData)
                plant.is_register_NBS = true // Загрязняющее предприятие, зарегистрированное
                plant.ocved = String(nbosData["ОКВЭД"]).split(",")
                plant.category = nbosData["Категория \r\nобъекта НВОС"]
            }
        }

        for (let test_emission of EmissionData) {
            if (plant['ИНН'] == test_emission['Идентификационный номер налогоплательщика']) {
                plant.permitted_emission = test_emission['Разрешенный выброс вредных (загрязняющих) веществ в пределах утвержденных нормативов ПДВ']
                if (test_emission['Номер и дата выдачи разрешения на выброс вредных (загрязняющих) веществ в атмосферный воздух'] == "истек срок действия") {
                    plant = {
                        "Истекла лицензия": true
                    }
                    plant.deprecated = true
                }
            }
        }
        for (let test_PDK of NBOSData) {
            plant.PDK_test = false
            if (plant['ИНН'] == test_PDK['ИНН']) {
                let max_PDK = plant.permitted_emission
                plant.real_PDK = test_PDK["Суммарный выброс, т/год"]
                if (max_PDK < test_PDK["Суммарный выброс, т/год"]) {
                    plant.PDK_test = true
                }
            }
        }
        if ((plant.category === 2 || plant.category === 1) && plant.is_register_NBS === false) {
            plant.WARNING = true;
        }
    }

    plants = plants.filter(p => p.is_register_NBS === true);
    plants.length = 10;
    res.status(200).json(plants);
});

//структура данных
// ПРЕДПРИЯТИЕ:
// -координаты
// -виды деятельности
// -зарегестррованно в НВОС?
//категория

module.exports = router;
