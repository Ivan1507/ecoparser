let accessToken = 'pk.eyJ1IjoiYW50b256dXoiLCJhIjoiY2t2MmszNnlzMDEybjMwcHA1c3ZhcmQwYyJ9.0YoIoBX5rwFe18ix7TJKHw';
 function ForwardGeocoding(){
    let text = "г. Челябинск, п. Мелькомбинат 2 участок 1, д. 37.json";

    let url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
        encodeURIComponent(text) +
        "?access_token=pk.eyJ1IjoiYW50b256dXoiLCJhIjoiY2t2MmszNnlzMDEybjMwcHA1c3ZhcmQwYyJ9.0YoIoBX5rwFe18ix7TJKHw";

    console.log(url)
}

const request = require('request');
var ACCESS_TOKEN = accessToken//'YOUR_API_KEY';
function rand(max){
    return Math.random()*max*2 - max
}
const forwardGeocoding = function (address) {

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
    return [55.17+rand(1), 61.53+rand(1)]
}

module.exports = forwardGeocoding