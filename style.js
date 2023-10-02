// Variables
const searchBtn = document.getElementById('search-btn');
const citySearch = document.getElementById('city-search');
const cityNameDate = document.getElementById('city-name-date');
const currentIcon = document.getElementById('current-icon');
const currentTemp = document.getElementById('current-temp');
const currentHumidity = document.getElementById('current-humidity');
const currentWind = document.getElementById('current-wind');
const forecastContainer = document.getElementById('forecast-container');
const historyList = document.getElementById('history-list');

const apiKey = 'YO23bbcc647a81c70ec072730a67665f52';

// Functions
function getWeather(city) {
    // First, we fetch the latitude and longitude for the city
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            const cityDisplayName = data.name;

            // Fetch the full weather details using the latitude and longitude
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(weatherData => {
            // Update the UI
            const currentDate = new Date().toLocaleDateString();
            cityNameDate.textContent = `${city} (${currentDate})`;
            currentIcon.src = `http://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}.png`;
            currentTemp.textContent = `Temperature: ${(weatherData.list[0].main.temp - 273.15).toFixed(2)} °C`; // Convert Kelvin to Celsius
            currentHumidity.textContent = `Humidity: ${weatherData.list[0].main.humidity}%`;
            currentWind.textContent = `Wind Speed: ${weatherData.list[0].wind.speed} MPH`;

            forecastContainer.innerHTML = ''; // Clear previous forecasts
            for (let i = 1; i <= 5; i++) {
                const forecastData = weatherData.list[i];
                const forecastDate = new Date(forecastData.dt_txt).toLocaleDateString();
                const forecastEl = document.createElement('div');
                forecastEl.innerHTML = `
                    <p>${forecastDate}</p>
                    <img src="http://openweathermap.org/img/wn/${forecastData.weather[0].icon}.png" alt="Weather icon">
                    <p>Temperature: ${(forecastData.main.temp - 273.15).toFixed(2)} °C</p>
                    <p>Wind Speed: ${forecastData.wind.speed} MPH</p>
                    <p>Humidity: ${forecastData.main.humidity}%</p>
                `;
                forecastContainer.appendChild(forecastEl);
            }
        });
}

// Event Listener
searchBtn.addEventListener('click', function() {
    const city = citySearch.value;
    getWeather(city);
    addToHistory(city);
});

function addToHistory(city) {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (history.indexOf(city) === -1) { // Avoid duplicates
        history.push(city);
    }
    localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    historyList.innerHTML = '';
    history.forEach(city => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        listItem.addEventListener('click', function() {
            getWeather(city);
        });
        historyList.appendChild(listItem);
    });
}

// Call on load
loadHistory();
