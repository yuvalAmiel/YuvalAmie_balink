document.addEventListener('DOMContentLoaded', function(){
        weather.AddCities();

        document.getElementById("cityList").addEventListener
        ("click", weather.handleWeatherShowing.show);
}, false);

//---------------


//using an anonymous function
let weather = (function(){
    let myPublicData = {};
    let arrOfCities = [];
    let currentIndex = 0;

    myPublicData.AddCities = function (){

        //I created a dictionary with all cities and their woeid.
        let CityNames = {
            "New York": 2459115,
            "Los Angeles":2442047,
            "Marseille":610264,
            "Barcelona":753692,
            "Rome": 721943,
            "Philadelphia": 2471217,
            "Rio de Janeiro":455825,
            "Liverpool" : 26734};

        myPublicData.cityToList(CityNames)
    }

    
    //here i'll add each city dynamically to the HTML
    myPublicData.cityToList = function(CityNames){
        let counter = 1;
        let listOfCities = document.getElementById("cityList");
        for(let key in CityNames){
            let option = document.createElement("option");
            option.innerHTML = key;
            option.value = counter.toString();
            listOfCities.appendChild(option);
            counter++;
            myPublicData.addToArr(key, CityNames[key]);
        }
    }

    //adding each city(name, woeid) to an array(so i'll be able to retrieve the selectedIndex and the woeid)
    myPublicData.addToArr = function (cityName, cityID){
        let form = {Name:cityName, ID:cityID};
        arrOfCities.push(form);
    }

    //return the selectedIndex in the element that was given
    myPublicData.wantedIndex = function(element){
        return element.selectedIndex;
    }


    myPublicData.handleWeatherShowing = (function(){
        let myFunctions = {};

        //getting the response status. it it's not betwwen 200-300, i'll throw a Promise
        myFunctions.status = function (response)
        {
            if (response.status >= 200 && response.status < 300) {
                return Promise.resolve(response)
            } else {
                return Promise.reject(new Error(response.statusText))
            }
        }

        myFunctions.json = function (response) {
            return response.json()
        }

        //Creating each segment on page
        myFunctions.buildWeatherInfo = function (data, WeatherNameData, weather)
        {
            myFunctions.buildWeatherAreaName(data, WeatherNameData);
            myFunctions.buildAreaTimes(data);
            myFunctions.buildWeatherForecast(data, weather);
        }

        //Create the city name + state
        myFunctions.buildWeatherAreaName = function (data, WeatherNameData){
            WeatherNameData.innerHTML = "<h1><b>" + data.title + " , " + data.parent.title + "</b></h1>";
        }

        /*here i'll create the 5-days weather forecast.
          I'll go threw all days(from the JSON), and for each day
          i'll create a button to the next page(the value would be the date of that day).
          next, i'll get the data of that day from getDayData function
          At last, i'll put the dataHTML in the innerHTML.
        */
        myFunctions.buildWeatherForecast = function (data, weather){
            let dataHTML = "<div class=\"row\">";
            let day = 0;
            for(let i in data.consolidated_weather){
                dataHTML += "<div class=\"col-md-2\">" +
                    "<form action=\"DayPage.html\">\n" +
                    "  <input name=\"Day\" type=\"hidden\" value="+day +" '' >\n" +
                    "  <input name=\"City\" type=\"hidden\" value="+data.woeid +" '' >\n" +
                    "  <input type=\"submit\" value=" + data.consolidated_weather[i].applicable_date + ">\n" +
                    "</form>" +
                    "<br>";
                dataHTML += myFunctions.getDayData(data.consolidated_weather[i]);
                day++;
            }
            dataHTML += "</div>";
            weather.innerHTML = dataHTML;
        }

        /* This func would create all needed data for each day.
        First, i'll get the pic code, and create an img element with the needed pic.
        After that, i'll add all necessary values and return tempString.
         */
        myFunctions.getDayData = function (data){
            let tempString = "";
            const PicName = data.weather_state_abbr;
            tempString +=
            "<img src='https://www.metaweather.com/static/img/weather/" + PicName + ".svg' width=\"50\" height=\"50\">" +
                data.weather_state_name + "<br>" +
            "<b>Max:</b>" +parseInt(data.max_temp) + "°C" + "<br>" +
            "<b>Min:</b>" +parseInt(data.min_temp) + "°C" +"<br>" +
            parseInt(data.wind_speed) + "mph" +"<br>" +"<br>" +
            "<dt>Humidity</dt> <dd>" +data.humidity + "%</dd>" +
            "<dt>Visibility</dt> <dd>" +(data.visibility).toFixed(2) + " miles</dd>" +
            "<dt>Pressure</dt> <dd>" +data.air_pressure + "mb</dd>" +
            "<dt>Confidence</dt> <dd>" +data.predictability + "%</dd>" +
            "<br>" + "</div>";
            return tempString;
        }

        /* Here i'll get the times(sunrise, sunset, etc) from the JSON,
            and display them in the innerHTML.
            (the endIndex would be (+5) to get the time in this format: HH:MM)
         */
        myFunctions.buildAreaTimes = function (data){
            const CurrTime = document.getElementById("time");
            const WeatherSunRise = document.getElementById("sunRiseTime");
            const WeatherSunSet = document.getElementById("sunSetTime");
            const startIndex = data.time.indexOf('T') + 1;
            const endIndex = startIndex + 5;

            CurrTime.innerHTML = " : " +data.time.substring(startIndex, endIndex);
            WeatherSunRise.innerHTML = " : " +data.sun_rise.substring(startIndex, endIndex);
            WeatherSunSet.innerHTML = " : " +data.sun_set.substring(startIndex, endIndex);
        }


        myFunctions.retrieveData = 
        function(loadingGif, WeatherNameData, weather, cityID){
                
            async function myFetch() {
                let response = await fetch
                ('https://www.metaweather.com/api/location/' +  cityID);
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response();
              
              }
              myFetch().then(() => {
                loadingGif.hidden = true;
                myFunctions.buildWeatherInfo(data, WeatherNameData, weather);
              }).catch(e => console.log(e));
        
        }

        /*
            Here i'll get the selected city from the selection.
            Then, get the ID(woeid) of that city, and fetch to retrieve the JSON.
         */
        myFunctions.show = function (){

            let weather = document.getElementById("weatherContent");
            const listOfCities = document.getElementById("cityList");
            const desiredCityIndex = myPublicData.wantedIndex(listOfCities);

            if(desiredCityIndex === 0 || currentIndex === desiredCityIndex){
                return;
            }
            weather.innerHTML = "";
            const cityID = arrOfCities[desiredCityIndex - 1].ID;
            const loadingGif = document.getElementById("loadingGif");
            let WeatherNameData = document.getElementById("DisplayCity");

            loadingGif.hidden = false;
            currentIndex = desiredCityIndex;
            
            myFunctions.retrieveData(loadingGif, WeatherNameData, weather, cityID);
        }
        return myFunctions;
    })();
    return myPublicData;
})();
