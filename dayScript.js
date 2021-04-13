document.addEventListener('DOMContentLoaded', function(){

    ShowDayWeather();
}, false);
//---------------

ShowDayWeather = function (){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const day = urlParams.get('Day')
    const city = urlParams.get('City')
    let content = document.getElementById("dayContent");

    let status = function (response)
    {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    let json = function (response) {
        return response.json()
    }

    let getDayData = function (data){
        let tempString = "<div class=\"row\">" ;
        let PicName = data.weather_state_abbr;
        tempString +=
            "<img src='https://www.metaweather.com/static/img/weather/" + PicName + ".svg' width=\"50\" height=\"50\">" +
            data.weather_state_name + "<br>" +
            "<b>Max:</b>"  +parseInt(data.max_temp) + "°C" + "<br>" +
            "<b>Min:</b>" +parseInt(data.min_temp) + "°C" +"<br>" +
            parseInt(data.wind_speed) + "mph" +"<br>" +"<br>" +
            "<b>Humidity</b> <br>" +data.humidity + "%<br>" +
            "<b>Visibility</b> <br>" +(data.visibility).toFixed(2) + " miles<br>" +
            "<b>Pressure</b><br>" +data.air_pressure + "mb<br>" +
            "<b>Confidence</b> <br>" +data.predictability + "%<br>" +
            "<br>" ;
        return tempString;
    }

    let getSourcesData = function (data){
        let tempString = "";

        for(let i in data.sources){
            tempString += "<a href=" + data.sources[i].url + " + target='_blank' +>" + data.sources[i].title +"</a>";
            tempString += "<br>";
        }
        tempString += "</div>" ;
        return tempString;
    }

    fetch('https://www.metaweather.com/api/location/' +  city)
        .then(status)
        .then(json)
        .then(function (data)
        {
            content.innerHTML =
                "<h2><b>" + data.title + "</b></h2><br>" +
                getDayData(data.consolidated_weather[day]) + getSourcesData(data);
        })

        .catch(function (err) {
            alert("weather forecast service is not available right now, please try again later");
        });

}