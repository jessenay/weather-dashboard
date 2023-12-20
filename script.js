document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.search').addEventListener('click', function() {
        getWeather();
    });
});

function convertToCelsius(kelvin) {
    return kelvin - 273.15;
}

function convertToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function displayCurrentWeather(cityName, data) {
    var temperatureCelsius = convertToCelsius(data.main.temp);
    var temperatureFahrenheit = convertToFahrenheit(temperatureCelsius);
    var windSpeed = data.wind.speed;
    var humidity = data.main.humidity;
    var currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var weatherIcon = data.weather[0].icon;

    var weatherInfo =
        '<div>Temperature: ' + temperatureFahrenheit.toFixed(2) + '°F</div>' +
        '<div>Wind Speed: ' + windSpeed + ' MPH</div>' +
        '<div>Humidity: ' + humidity + '%</div>' +
        '<img src="https://openweathermap.org/img/w/' + weatherIcon + '.png" alt="Weather Icon" class="weather-icon">';

    var cityNameElement = document.getElementById('cityName');
    if (cityNameElement.innerText.trim() === '') {
        cityNameElement.textContent = cityName;
    }

    var currentDateElement = document.getElementById('currentDate');
    if (currentDateElement.innerText.trim() === '') {
        currentDateElement.textContent = currentDate;
    }

    document.getElementById('currentWeather').innerHTML = weatherInfo;
}

function displayForecast(uniqueForecastDays) {
    var forecastInfo = uniqueForecastDays.map(function(day) {
        var date = new Date(day.dt * 1000);
        var dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        var temperatureCelsius = convertToCelsius(day.main.temp);
        var temperatureFahrenheit = convertToFahrenheit(temperatureCelsius);
        var windSpeed = day.wind.speed;
        var humidity = day.main.humidity;
        var weatherIcon = day.weather[0].icon;

        return '<div class="day">' +
            '<h3>' + dayOfWeek + '</h3>' +
            '<h4>' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</h4>' +
            '<div>Temperature: ' + temperatureFahrenheit.toFixed(2) + '°F</div>' +
            '<div>Wind Speed: ' + windSpeed + ' MPH</div>' +
            '<div>Humidity: ' + humidity + '%</div>' +
            '<img src="https://openweathermap.org/img/w/' + weatherIcon + '.png" alt="Weather Icon" class="weather-icon">' +
            '</div>';
    }).join('');

    document.querySelector('.forecast .days').innerHTML = forecastInfo;
}

function getWeather() {
    var userInput = document.getElementById('citySearch').value;
    var apiKey = 'c0887e661a919ea66432788152cb9375';

    var currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + userInput + '&appid=' + apiKey;

    fetch(currentWeatherURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            displayCurrentWeather(userInput, data);
            saveToLocalStorage(userInput, data);
        })
        .catch(function(error) {
            console.error('Error fetching current weather:', error);
        });

    var forecastURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + userInput + '&appid=' + apiKey;

    fetch(forecastURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var forecastDays = data.list;

            var uniqueForecastDays = forecastDays.filter(function(day, index, self) {
                var date = new Date(day.dt * 1000);
                var currentDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                var nextDate = index === self.length - 1 ? null : new Date(self[index + 1].dt * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                return currentDate !== nextDate;
            });

            displayForecast(uniqueForecastDays);
        })
        .catch(function(error) {
            console.error('Error fetching 5-day forecast:', error);
        });
}
function saveToLocalStorage(cityName, data) {
    let previousCities = JSON.parse(localStorage.getItem('previousCities')) || [];
    previousCities.push({ cityName, weatherData: data });
    localStorage.setItem('previousCities', JSON.stringify(previousCities));

    displayPreviousCities();
}
function displayPreviousCities() {
    let previousCities = JSON.parse(localStorage.getItem('previousCities')) || [];

    let previousCitiesList = document.getElementById('previousCitiesList');
    previousCitiesList.innerHTML = '';

    previousCities.forEach(function (cityData, index) {
        let cityInfo = document.createElement('div');
        cityInfo.innerHTML = `
            <h3>City ${index + 1}:</h3>
            <p>Name: ${cityData.cityName}</p>
        `;
        previousCitiesList.appendChild(cityInfo);
    });
}



