var cityList = document.getElementById("search-history");
var searchEl = document.getElementById("search");
var searchInput = document.getElementById("search-entry");
var currentForecast = document.getElementById("current");
var futureForecast = document.getElementById('future');

var cityHeading, weeklyForecastHeading = document.createElement("h2");
var displayDate = document.createElement("h3");
var displayIcon = document.createElement("img");
var displayTemp, displayHumidity, displayWindSpeed, displayUV = document.createElement("p");

var openWeatherURL = "https://api.openweathermap.org/";
var apiKey = "be7a39895621e97d4b83ace8f5bc938f";
var searchHistory = [];
var city = "";

// pulls saved search history from local storage and displays 
function displaySearchHistory(){
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (searchHistory){
        for (var i = 0; i < searchHistory.length; i++) {
            city = searchHistory[i];
            createList();
        };
    };
};
    

function search(){
    //clear previous searches???
    getCurrentForecast();
    //need to put check in here if its a valid entry and for if search has aready been executed//
    saveSearch();
};


// adds city to search history
function saveSearch(){
    var citiesSearched = searchHistory;
    citiesSearched.push(city);
    // updates saved search history to local storage
    localStorage.setItem("searchHistory", JSON.stringify(citiesSearched));
    createList();
};


// creates list of searched cities
function createList(){
    var list = document.createElement("div");
    list.setAttribute("class", "cities btn btn-block btn-light");
    list.textContent = city;
    cityList.prepend(list);
};


function getCurrentForecast(){
    var queryURL = openWeatherURL + "data/2.5/weather?q=" + city + "&units=metric&appid=" + apiKey;   
    console.log(queryURL);
    $.ajax({
        url: queryURL,  
        method: "GET"
    }).then(function(response){
        console.log(response);
    
        var weatherCondition = response.weather.icon;
        var tempCelsius = response.main.temp;
        var humidity = response.main.humidity;
        var windSpeed = response.wind.speed;
        var lat = response.coord.lat;
        var lon = respsonse.coord.lon;

        
        var uvIndex = getUVIndex(lat,lon);
        if (uvIndex <= 2){
            displayUV.setAttribute("class", "low");
        }
        else if (uvIndex > 2 && uvIndex <= 5){
            displayUV.setAttribute("class", "moderate");
        }
        else if (uvIndex > 5 && uvIndex <= 7){
            displayUV.setAttribute("class", "high");
        }
        else if (uvIndex > 7 && uvIndex <= 10){
            displayUV.setAttribute("class", "veryHigh");
        }
        else if (uvIndex > 10) {
            displayUV.setAttribute("class", "extreme");
        };
        displayUV.textContent = "UV Index: " + uvIndex;

        cityHeading.textContent = city;
        displayIcon.setAttribute("src", selectIcon(weatherCondition));
        displayTemp.textContent = "Temperature: " + tempCelsius.Math.round() + " C";
        displayHumidity.textContent = "Humidity: " + humidity + "%";
        displayWindSpeed.textContent = "Wind Speed: " + windSpeed + " MPH";
        currentForecast.append(cityHeading, displayDate, displayIcon, displayTemp, displayHumidity, displayWindSpeed, displayUV);

        getWeeklyForecast(lat,lon);
    })
}
    

function getWeeklyForecast(lat,lon){
    weeklyForecastHeading = "5-Day Forecast";   
    var date = moment().unix();
    for (var i = 0; i < 6; i++){
        date = date - 86400;
        var queryURL = openWeatherURL + "data/2.5/onecall/timemachine?lat=" + lat + "&lon=" + lon + "&dt=" + date + "&units=metric&appid=" + apiKey;
        $.ajax({
            url: queryURL,  
            method: "GET"
        }).then(function(response){
            console.log(response);

            var weatherCondition = response.current.weather.icon;
            var tempCelsius = response.current.temp;
            var humidity = response.current.humidity;
            
            displayDate.textContent = moment().unix(date).format('Do MM YYYY');
            displayIcon.setAttribute("src", selectIcon(weatherCondition));
            displayTemp.textContent = "Temperature: " + tempCelsius.Math.round() + " C";
            displayHumidity.textContent = "Humidity: " + humidity + "%";
            futureForecast.append(weeklyForecastHeading, displayDate, displayIcon, displayTemp, displayHumidity);
        })
    };
};

// gets related icon for weather conditions
function selectIcon(x){
    var icon = x;
    var queryURL = openWeatherURL + "img/wn/" + icon + "@2x.png";
        console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        return response;
    })
};

function getUVIndex(lat,lon){
    var queryURL = openWeatherURL + "data/2.5/uvi?appid=" + apikey + "&lat=" + lat + "&lon=" + lon;
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response){
        var uvIndex = response.value;
        return uvIndex;
    })
};


displaySearchHistory();

searchEl.addEventListener('click', function(event){
    if (event.target.matches('button')){
        city = searchInput.value;
        search();
    }
    else if (event.target.matches('.cities')){
        city = event.target.textContent;
        search();
    }
});




