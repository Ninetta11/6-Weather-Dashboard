var cityList = document.getElementById("search-history");
var searchEl = document.getElementById("search");
var searchInput = document.getElementById("search-entry");
var currentForecast = document.getElementById("current");
var futureForecast = document.getElementById("future");

var openWeatherURL = "https://api.openweathermap.org/";
var apiKey = "be7a39895621e97d4b83ace8f5bc938f";
var citiesSearched = [];
var city = "";
var lat = "";
var lon = "";


// pulls saved search history from local storage and displays 
function displaySearchHistory(){
    var searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
    if (searchHistory){
        for (var i = 0; i < searchHistory.length; i++) {
            city = searchHistory[i];
            createList();
        };
    citiesSearched = searchHistory;
    };
};
    

// searching open weather database for input
function search(){
    var queryURL = openWeatherURL + "data/2.5/weather?q=" + city + "&units=metric&appid=" + apiKey;   
    $.ajax({
        url: queryURL,  
        method: "GET",
        // if a valid entry, saving search
        success: function () {
            if (citiesSearched.indexOf(city) === -1){
            saveSearch();      
            };
        },
        // if not valid entry, asking user to resubmit query
        error: function(jqXHR, textStatus, errorThrown) { 
            if(jqXHR.status == 404 || errorThrown == 'Not Found') { 
                errortext = document.createElement("h4");
                errortext.textContent = "We could not find a city matching that name. Please try again.";
                currentForecast.append(errortext);
            }
        }
    // obtaining latitude and longitude for forecast query
    }).then(function(response){
        lat = response.coord.lat;
        lon = response.coord.lon;
        getForecast();
    });
};


// adds city to search history
function saveSearch(){
    citiesSearched.push(city);
    // updates saved search history to local storage
    localStorage.setItem("searchHistory", JSON.stringify(citiesSearched));
    // adds search to search bar aside
    createList();
};


// creates list of searched cities
function createList(){
    var list = document.createElement("div");
    list.setAttribute("class", "cities btn btn-block btn-light");
    list.textContent = city;
    cityList.prepend(list);
};


// displays forecast results 
function getForecast(){
    // searching open weather database with latitude and longitude
    var queryURL = openWeatherURL + "data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=metric&exclude=current,minutely,hourly&appid=" + apiKey;
    $.ajax({
        url: queryURL,  
        method: "GET"
    }).then(function(response){
        // for the six days of forecast
        for (var i = 0; i < 6; i++){
            // creating elements for display
            var cityHeading = document.createElement("h2");
            var displayDate = document.createElement("h5");
            var displayIcon = document.createElement("img");
            var displayTemp = document.createElement("p");
            var displayHumidity = document.createElement("p");
            var displayWindSpeed = document.createElement("p");
            var displayUV = document.createElement("p");
            var uvIndexRating = "";
            var day = document.createElement('li');
            day.setAttribute("class", "list-group-item list-group-item-info ");

            // pulls relevant data from response
            var date = response.daily[i].dt;
            var weatherCondition = response.daily[i].weather[0].icon;
            var tempCelsius = response.daily[i].temp.day;
            var humidity = response.daily[i].humidity;
            var windSpeed = response.daily[i].wind_speed;
            var uvIndex = response.daily[i].uvi;
            var timezone = response.timezone;

            // if it's the current day of forecast
            if (i === 0){
                // setting colour of text based on rating according to UV index returned
                if (uvIndex <= 2){
                    uvIndexRating = "low";
                }
                else if (uvIndex > 2 && uvIndex <= 5){
                    uvIndexRating = "moderate";
                }
                else if (uvIndex > 5 && uvIndex <= 7){
                    uvIndexRating = "high";
                }
                else if (uvIndex > 7 && uvIndex <= 10){
                    uvIndexRating = "very-high";
                }
                else {
                    uvIndexRating = "extreme";
                };
                
                // setting content for display
                cityDisplay = timezone.split("/");
                cityHeading.textContent = city.toUpperCase() + ", " + cityDisplay[0];
                displayIcon.setAttribute("class", "main");
                displayIcon.setAttribute("src", "http://openweathermap.org/img/wn/" + weatherCondition + "@2x.png");
                displayDate.setAttribute("class", "main-date");
                displayDate.textContent = moment.unix(date).format('dddd Do MMMM');
                displayTemp.textContent = "Temperature: " + Math.round(tempCelsius) + "\u00B0C";
                displayHumidity.textContent = "Humidity: " + humidity + "%";
                displayWindSpeed.textContent = "Wind Speed: " + windSpeed + " MPH";
                displayUV.innerHTML = 'UV Index: <span class="' + uvIndexRating + '">' + uvIndex + '</span>';

                // displaying content
                currentForecast.append(cityHeading, displayDate, displayIcon, displayTemp, displayHumidity, displayWindSpeed, displayUV);
            }
            else {
                // for subsequent five days of forecast, setting content for display
                displayDate.textContent = moment.unix(date).format('dddd');
                displayIcon.setAttribute("src", "http://openweathermap.org/img/wn/" + weatherCondition + "@2x.png");
                displayTemp.textContent = "Temp: " + Math.round(tempCelsius) + "\u00B0C";
                displayHumidity.textContent = "Humidity: " + humidity + "%";
                
                // displaying content
                day.append(displayDate, displayIcon, displayTemp, displayHumidity);
                futureForecast.append(day);
            };
        };
    });
};


displaySearchHistory();

// when the user clicks within the search aside 
searchEl.addEventListener('click', function(event){
    // if the user clicked the search button, uses inputted value for search
    if (event.target.matches('button')){
        city = searchInput.value.toUpperCase();
            // clears displayed content
        $(currentForecast).empty();
        $(futureForecast).empty();
        searchInput.value = "";
        search();
    }
    // if the user clicked on a saved search button, uses that value for search
    else if (event.target.matches('.cities')){
        city = event.target.textContent.toUpperCase();
        $(currentForecast).empty();
        $(futureForecast).empty();
        search();
    }
});
