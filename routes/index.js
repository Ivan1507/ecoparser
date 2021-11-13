const express = require('express');
const forwardGeocoding = require("../utils/forwardGeocoding");
const router = express.Router();
let axios=require('axios')
const WriteFile = require("../utils/writeFile")
const ReadFile = require("../utils/readFile")


let readExcel = require("../utils/readExcel");

// let EGRULData = readExcel("EGRUL.xlsx")
// let NBOSData = readExcel("NBOS.xlsx")
// let EmissionData = readExcel("emissions_permits.xlsx")
// WriteFile('EGRULData',JSON.stringify(EGRULData))
// WriteFile('NBOSData',JSON.stringify(NBOSData))
// WriteFile('EmissionData',JSON.stringify(EmissionData))


let EGRULData = ReadFile("EGRULData")
let NBOSData = ReadFile("NBOSData")
let EmissionData = ReadFile("EmissionData")




console.log(EmissionData)

async function airpollition (address) {

    // var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
    //     + encodeURIComponent(address) + '.json?access_token='
    //     + ACCESS_TOKEN + '&limit=1';
    //
    // request({ url: url, json: true }, function (error, response) {
    //     if (error) {
    //         callback('Unable to connect to Geocode API', undefined);
    //     } else if (response.body.features.length === 0) {
    //         callback('Unable to find location. Try to '
    //             + 'search another location.');
    //     } else {
    //
    //         var longitude = response.body.features[0].center[0]
    //         var latitude = response.body.features[0].center[1]
    //         var location = response.body.features[0].place_name
    //         console.log("Test :", response.body);
    //         console.log("Latitude :", latitude);
    //         console.log("Longitude :", longitude);
    //         console.log("Location :", location);
    //     }
    // })

    let lat=55.17;
    let lon=61.53;
    const directionsUrl = 'http://api.openweathermap.org/data/2.5/air_pollution/history' +
        '?lat=' +lat+
        '&' +
        'lon=' +lon+
        '&start=1606223802&end=1636982199&appid=cd4b0e9b350c30989a8efdb68b703cfa';
    console.log(directionsUrl);
    return await axios.get(directionsUrl).then(res => res.data);
}


router.get("/test", async function (req, res, next) {
    let coords = forwardGeocoding("Россия, Челябинская обл., г.Челябинск, ул. Линейная, д. 98, скл. 8")

    res.status(200).json(coords);
})
router.get("/test1", async function (req, res, next) {
    let coords = await airpollition("Россия, Челябинская обл., г.Челябинск, ул. Линейная, д. 98, скл. 8")
    res.status(200).json(coords);
})


/* GET home page. */
router.get('/', function (req, res, next) {
    let plants = [];
    for (let a of EGRULData) {
        let coords = forwardGeocoding(a["Адрес"])
       // if (((coords[0] - req.body.lat) ^ 2 + (coords[1] - req.body.long) ^ 2) < req.body.radius) {
            plants.push(a)
       // }
                  if (plants.length > 6000) break
    }


    for (let plant of plants) {
        plant.is_register_NBS = false
        plant.ocved = null
        plant.permitted_emission = null;
        // ОКВЭД и регистрация
        // TODO: CATEGORY

        for(let nbosData of NBOSData){
            if (plant['ИНН'] ===nbosData['ИНН'])  {
                console.log(nbosData)
                plant.is_register_NBS = true // Загрязняющее предприятие, зарегистрированное
                plant.ocved = String(nbosData["ОКВЭД"]).split(",")
                plant.category = nbosData["Категория \r\nобъекта НВОС"]




            }
        }

        for (let test_emission of EmissionData){
            if (plant['ИНН'] ===test_emission['Идентификационный номер налогоплательщика'])  {
                plant.permitted_emission = test_emission[ 'Разрешенный выброс вредных (загрязняющих) веществ в пределах утвержденных нормативов ПДВ']
                if (test_emission['Номер и дата выдачи разрешения на выброс вредных (загрязняющих) веществ в атмосферный воздух']=="истек срок действия"){
                    plant = {
                        "Истекла лицензия": true
                    }
                    plant.deprecated = true
                }
            }
        }

        for(let test_PDK of NBOSData){
            plant.PDK_test = false
            if (plant['ИНН'] == test_PDK['ИНН'])  {
                let max_PDK =  plant.permitted_emission
                plant.real_PDK = test_PDK["Суммарный выброс, т/год"]
                if (max_PDK < test_PDK["Суммарный выброс, т/год"]){
                    plant.PDK_test = true
                }
            }

        }

        if( (plant.category === 2 || plant.category === 1) && plant.is_register_NBS === false){
            plant.WARNING = true;
        }

    }
    //plants = plants.filter( p=>p.is_register_NBS===true);
    console.log(plants)
    res.status(200).json(plants);
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
