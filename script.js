const key = "c5e8db397d59b71c7384e8c0c5194688";
const url = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const inp = document.getElementById("search");
const btn = document.querySelector("button");
const loading = document.getElementById("loading");
let weatherChart = null;

// Weather code to icon mapping
const weatherIcons = {
    '01d': 'clear.png',
    '01n': 'clear.png',
    '02d': 'clouds.png',
    '02n': 'clouds.png',
    '03d': 'clouds.png',
    '03n': 'clouds.png',
    '04d': 'clouds.png',
    '04n': 'clouds.png',
    '09d': 'rain.png',
    '09n': 'rain.png',
    '10d': 'rain.png',
    '10n': 'rain.png',
    '11d': 'thunderstorm.png',
    '11n': 'thunderstorm.png',
    '13d': 'snow.png',
    '13n': 'snow.png',
    '50d': 'mist.png',
    '50n': 'mist.png'
};

async function checkweather(city) {
    try {
        showLoading();
        
        // Fetch current weather
        const currentRes = await fetch(`${url}${city}&appid=${key}`);
        if (!currentRes.ok) throw new Error("City not found");
        const currentData = await currentRes.json();

        // Update current weather UI
        updateCurrentWeather(currentData);

        // Fetch historical data
        const historyRes = await fetchHistoricalData(currentData.coord);
        if (!historyRes.daily) throw new Error("Historical data unavailable");
        
        // Update chart
        updateForecastChart(historyRes.daily);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

async function fetchHistoricalData(coords) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 5);
    
    const params = new URLSearchParams({
        latitude: coords.lat,
        longitude: coords.lon,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        daily: 'temperature_2m_max,temperature_2m_min,weather_code',
        temperature_unit: 'celsius',
        timezone: 'auto'
    });

    const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`);
    return await response.json();
}

function updateCurrentWeather(data) {
    document.getElementById("name").textContent = data.name;
    document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("wind").textContent = `${Math.round(data.wind.speed)} km/h`;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    
    const weatherIcon = weatherIcons[data.weather[0].icon] || 'clear.png';
    document.getElementById("suraj").src = `./images/${weatherIcon}`;
}

function updateForecastChart(dailyData) {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    
    // Destroy previous chart instance
    if (weatherChart) weatherChart.destroy();

    // Process historical data
    const labels = dailyData.time.slice(-5).map(date => 
        new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
    );

    weatherChart = new Chart(ctx, { 
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Max Temperature',
                data: dailyData.temperature_2m_max.slice(-5),
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                tension: 0.6,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'Min Temperature',
                data: dailyData.temperature_2m_min.slice(-5),
                borderColor: '#4DABF7',
                backgroundColor: 'rgba(77, 171, 247, 0.2)',
                tension: 0.6,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: 'rgb(217, 53, 12)' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    ticks: { color: 'rgb(5, 146, 164)' }
                }
            }
        }
    });
}


// Helper functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    alert(`Error: ${message}`);
}

checkweather("bhopal");
// Event Listeners
btn.addEventListener('click', () => checkweather(inp.value));
inp.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkweather(inp.value);
});