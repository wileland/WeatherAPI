const apiKey = '23bbcc647a81c70ec072730a67665f52';

function getWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    $.get(url, function(data) {
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        
        $.get(forecastURL, function(weatherData) {
            updateUI(city, weatherData);
        });

    }).fail(function(error) {
        alert("Error fetching data. Please check the city name or try again later.");
        console.error("API Error:", error.responseText);
    });
}
const $searchBtn = $('#search-btn');
$('#search-btn').on('click', function() {
    // ...
});

function updateUI(city, weatherData) {
    const currentDate = new Date().toLocaleDateString();
    $('#city-name-date').text(`${city} (${currentDate})`);
    $('#current-icon').attr('src', `http://openweathermap.org/img/wn/${weatherData.list[0].weather[0].icon}.png`);
    $('#current-temp').text(`Temperature: ${weatherData.list[0].main.temp.toFixed(2)} °C`);
    $('#current-humidity').text(`Humidity: ${weatherData.list[0].main.humidity}%`);
    $('#current-wind').text(`Wind Speed: ${weatherData.list[0].wind.speed} MPH`);

    $('#forecast-container').empty();
    
    for (let i = 7; i < weatherData.list.length; i+=8) {
        const forecastData = weatherData.list[i];
        const forecastDate = new Date(forecastData.dt_txt).toLocaleDateString();
        const $forecastEl = $('<div>').html(`
            <p>${forecastDate}</p>
            <img src="http://openweathermap.org/img/wn/${forecastData.weather[0].icon}.png" alt="Weather icon">
            <p>Temperature: ${forecastData.main.temp.toFixed(2)} °C</p>
            <p>Wind Speed: ${forecastData.wind.speed} MPH</p>
            <p>Humidity: ${forecastData.main.humidity}%</p>
        `);
        $('#forecast-container').append($forecastEl);
    }
}

$('#search-btn').on('click', function() {
    const city = $('#city-search').val();
    if(city) {
        getWeather(city);
        addToHistory(city);
    } else {
        alert("Please enter a city name.");
    }
});

function addToHistory(city) {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
        loadHistory();
    }
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
    $('#history-list').empty();
    history.forEach(city => {
        const $listItem = $('<li>').text(city).on('click', function() {
            getWeather(city);
        });
        $('#history-list').append($listItem);
    });
}

// Load the history when the page is loaded
loadHistory();
