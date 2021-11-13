const axios = require("axios");
let pollution =
    async function (lat, lon) {
        const directionsUrl = 'http://api.openweathermap.org/data/2.5/air_pollution/history' +
            '?lat=' + lat +
            '&' +
            'lon=' + lon +
            '&start=1606223802&end=1636982199&appid=cd4b0e9b350c30989a8efdb68b703cfa';
        console.log(directionsUrl);
        return await axios.get(directionsUrl).then(res => res.data);
    }

async function checkPollution(lat, long) {
    let coords = await pollution(lat, long)
    let pm2_5 = 0;
    let pm10 = 0;
    let co = 0;
    let s02 = 0;
    let len = coords.list.length
    for (let i = 0; i < len; i++) {
        co+=coords.list[i].components.co
        pm2_5 += coords.list[i].components.pm2_5
        pm10 += coords.list[i].components.pm10
        s02 += coords.list[i].components.so2
    }

    console.log(pm2_5, pm10, s02)
    return co/Math.pow(10,9)
}

module.exports = checkPollution
