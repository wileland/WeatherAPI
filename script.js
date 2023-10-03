const apiKey = '23bbcc647a81c70ec072730a67665f52Y';

// Function to fetch weather data by city name
function getWeather(city) {
    const coordinatesUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    // Fetch coordinates first
    fetch(coordinatesUrl)
        .then(response => response.json())
        .then(coordinatesData => {
            // Extract latitude and longitude
            const lat = coordinatesData.coord.lat;
            const lon = coordinatesData.coord.lon;

            // Fetch current weather data
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            fetch(currentWeatherUrl)
                .then(response => response.json())
                .then(currentWeatherData => {
                    updateDefaultUI(city, currentWeatherData);
                    updateWeatherIcon(currentWeatherData.weather[0].icon);
                })
                .catch(error => {
                    handleApiError("current", error);
                });

            // Fetch 5-day forecast data
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            fetch(forecastUrl)
                .then(response => response.json())
                .then(forecastData => {
                    updateFiveDayForecastUI(city, forecastData);
                })
                .catch(error => {
                    handleApiError("forecast", error);
                });
        })
        .catch(error => {
            handleApiError("coordinates", error);
        });
}

// Function to handle API errors
function handleApiError(type, error) {
    alert(`Error fetching ${type} weather data. Please try again later.`);
    console.error("API Error:", error);
}

// Function to update the current weather icon
function updateWeatherIcon(iconCode) {
    const iconElement = document.getElementById('current-icon');
    const iconUrl = `./images/weatherrrr.png`; // Update the path here

    // Check if the image file exists before updating the icon
    fetch(iconUrl)
        .then(response => {
            if (response.ok) {
                iconElement.src = iconUrl;
            } else {
                // Use a default icon if the image file doesn't exist
                iconElement.src = './images/default-icon.png'; // Update the path to your default icon
            }
        })
        .catch(error => {
            console.error('Error fetching icon:', error);
            // Use a default icon in case of any errors
            iconElement.src = './images/default-icon.png'; // Update the path to your default icon
        });
}

// Function to update UI with weather data
function updateDefaultUI(city, currentWeatherData) {
    const currentDate = new Date().toLocaleDateString();
    document.getElementById('city-name-date').textContent = `${city} (${currentDate})`;
    document.getElementById('current-icon').src = `http://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}.png`;
    document.getElementById('current-temp').textContent = `Temperature: ${currentWeatherData.main.temp.toFixed(2)} °C`;
    document.getElementById('current-humidity').textContent = `Humidity: ${currentWeatherData.main.humidity}%`;
    document.getElementById('current-wind').textContent = `Wind Speed: ${currentWeatherData.wind.speed} MPH`;
}

// Function to update UI with 5-day forecast data
function updateFiveDayForecastUI(city, forecastData) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear the container first

    for (let i = 7; i < forecastData.list.length; i += 8) {
        const forecastItem = forecastData.list[i];
        const forecastDate = new Date(forecastItem.dt_txt).toLocaleDateString();

        const forecastEl = document.createElement('div');
        forecastEl.innerHTML = `
            <p>${forecastDate}</p>
            <img src="http://openweathermap.org/img/wn/${forecastItem.weather[0].icon}.png" alt="Weather icon">
            <p>Temperature: ${forecastItem.main.temp.toFixed(2)} °C</p>
            <p>Wind Speed: ${forecastItem.wind.speed} MPH</p>
            <p>Humidity: ${forecastItem.main.humidity}%</p>
        `;

        forecastContainer.appendChild(forecastEl);
    }
}

// Function to add a city to the search history
function addToHistory(city) {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
        loadHistory();
    }
}

// Function to load search history
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = ''; // Clear the list first

    history.forEach(city => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        listItem.addEventListener('click', function () {
            getWeather(city);
        });

        historyList.appendChild(listItem);
    });
}

// Event listener for search button
document.getElementById('search-btn').addEventListener('click', function () {
    const city = document.getElementById('city-search').value;
    if (city) {
        getWeather(city);
        addToHistory(city);
    } else {
        alert("Please enter a city name.");
    }
});

// Event listener for user typing in the search bar
document.getElementById('city-search').addEventListener('input', function () {
    const city = document.getElementById('city-search').value;
    if (city) {
        // Call the API and display the 5-day forecast for the entered city
        fetchCoordinates(city)
            .then(coordinatesData => {
                const lat = coordinatesData.coord.lat;
                const lon = coordinatesData.coord.lon;

                fetchFiveDayForecast(lat, lon)
                    .then(forecastData => {
                        updateFiveDayForecastUI(city, forecastData);
                    })
                    .catch(error => {
                        handleApiError("forecast", error);
                    });
            })
            .catch(error => {
                handleApiError("coordinates", error);
            });
    }
});

// Load the default weather and history when the page is loaded
getWeather('San Antonio'); // Fetch weather data for the default city
loadHistory();
