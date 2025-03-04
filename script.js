const apiKey = "5d5a4774d05fa8a1c35da02be1ebdf40";
const apiUrl = "https://api.openweathermap.org/data/2.5/";

// Fetch weather data by city name
async function fetchWeather(city) {
  try {
    const response = await fetch(
      `${apiUrl}weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    updateWeather(data);
    fetchForecast(city);
    fetchHourlyForecast(city);
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Fetch forecast data
async function fetchForecast(city) {
  try {
    const response = await fetch(
      `${apiUrl}forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    updateForecast(data);
  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
}

// Fetch hourly forecast data
async function fetchHourlyForecast(city) {
  try {
    const response = await fetch(
      `${apiUrl}forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    updateHourlyForecast(data);
  } catch (error) {
    console.error("Error fetching hourly forecast data:", error);
  }
}

// Fetch weather data by geolocation
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(
          `${apiUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        updateWeather(data);
        fetchForecast(data.name);
        fetchHourlyForecast(data.name);
      } catch (error) {
        console.error("Error fetching location weather:", error);
      }
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Update weather data on UI
function updateWeather(data) {
  if (data.cod !== 200) {
    alert("City not found");
    return;
  }
  
  document.querySelector(".city").innerText = `${data.name}, ${data.sys.country}`;
  document.querySelector(".temperature").innerText = `${Math.round(data.main.temp)}°C`;
  document.querySelector(".Realfeels").innerText = `Feels like ${Math.round(data.main.feels_like)}°C`;
  document.querySelector("#Hvalue").innerText = `${data.main.humidity}%`;
  document.querySelector("#Wvalue").innerText = `${data.wind.speed} m/s`;
  document.querySelector("#Cvalue").innerText = `${data.clouds.all}%`;
  document.querySelector("#Pvalue").innerText = `${data.main.pressure} hPa`;
  document.querySelector("#visibilityValue").innerText = `${data.visibility / 1000} km`;
  // Calculate and update Dew Point
  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const dewPoint = calculateDewPoint(temp, humidity);
  document.querySelector("#dewpointvalue").innerText = `${dewPoint.toFixed(1)}°C`; // Displaying 1 decimal place

  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  document.querySelector("#sunrise-time").innerText = `Sunrise: ${sunrise}`;
  document.querySelector("#sunset-time").innerText = `Sunset: ${sunset}`;

  // Update Weather Icon
  const iconCode = data.weather[0].icon;
  document.querySelector("#weatherIcon").innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon" />`;
  document.querySelector(".weather-status").innerText = data.weather[0].description;

  
   // Call the function to update the background
   changeBackground(data.weather[0].main.toLowerCase());
    // Update date and time
    updateDateTime();
}

// Calculate Dew Point using Magnus formula
function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    return (b * alpha) / (a - alpha);
  }
  
  // Update Date and Time dynamically
  function updateDateTime() {
    setInterval(() => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    document.querySelector(".date").innerText = formattedDate;
      document.querySelector(".time").innerText = now.toLocaleTimeString();
    }, 1000);
  }

// Update forecast data on UI with bar-style layout
function updateForecast(data) {
  const forecastContainer = document.getElementById("WeekForecast");
  forecastContainer.innerHTML = "";
  forecastContainer.style.display = "flex";
  forecastContainer.style.overflowX = "auto";

  const dailyData = {};
  
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  });
  
  Object.values(dailyData).forEach((day) => {
    const temp = Math.round(day.main.temp);
    const iconCode = day.weather[0].icon;
    const description = day.weather[0].description;

    const formattedDate = new Date(day.dt * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    const forecastItem = `
      <div class="forecast-item" >
        <h3 style="font-size: 14px;">${formattedDate}</h3>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon"  />
        <p style="font-size: 16px; font-weight: bold;">${temp}°C</p>
        <p style="font-size: 12px;">${description}</p>
      </div>
    `;
    forecastContainer.innerHTML += forecastItem;
  });
}

// Update hourly forecast data on UI with bar-style layout
function updateHourlyForecast(data) {
  const hourlyContainer = document.getElementById("HourlyForecast");
  hourlyContainer.innerHTML = "";
  hourlyContainer.style.display = "flex";
  hourlyContainer.style.overflowX = "auto";

  data.list.slice(0, 6).forEach((hour) => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const temp = Math.round(hour.main.temp);
    const iconCode = hour.weather[0].icon;
    
    const hourlyItem = `
      <div class="hourly-item" style="display: flex; flex-direction: column; align-items: center; margin: 10px; padding: 10px; border-radius: 10px; background: rgba(255, 255, 255, 0.2); min-width: 100px; text-align: center;">
        <h4 style="font-size: 14px;">${time}</h4>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="Weather Icon"  />
        <p style="font-size: 16px; font-weight: bold;">${temp}°C</p>
      </div>
    `;
    hourlyContainer.innerHTML += hourlyItem;
  });
}
//function for converting temperature
function convertTemperature() {
    const converter = document.getElementById("converter").value;
    const tempElement = document.querySelector(".temperature");
    const feelsLikeElement = document.querySelector(".Realfeels");
  
    if (!tempElement || !feelsLikeElement) return;
  
    let temp = parseFloat(tempElement.innerText);
    let feelsLike = parseFloat(feelsLikeElement.innerText.replace("Feels like ", "").replace("°C", "").replace("°F", ""));
  
    if (isNaN(temp) || isNaN(feelsLike)) return;
  
    if (converter === "F") {
      temp = (temp * 9/5) + 32;
      feelsLike = (feelsLike * 9/5) + 32;
      tempElement.innerText = `${Math.round(temp)}°F`;
      feelsLikeElement.innerText = `Feels like ${Math.round(feelsLike)}°F`;
    } else {
      temp = (temp - 32) * 5/9;
      feelsLike = (feelsLike - 32) * 5/9;
      tempElement.innerText = `${Math.round(temp)}°C`;
      feelsLikeElement.innerText = `Feels like ${Math.round(feelsLike)}°C`;
    }
  
    // Convert temperatures in the daily forecast section
    document.querySelectorAll(".forecast-item p:first-of-type").forEach((element) => {
      let tempValue = parseFloat(element.innerText.replace("°C", "").replace("°F", ""));
      if (!isNaN(tempValue)) {
        if (converter === "F") {
          tempValue = (tempValue * 9/5) + 32;
          element.innerText = `${Math.round(tempValue)}°F`;
        } else {
          tempValue = (tempValue - 32) * 5/9;
          element.innerText = `${Math.round(tempValue)}°C`;
        }
      }
    });
  
    // Convert temperatures in the hourly forecast section
    document.querySelectorAll(".hourly-item p:first-of-type").forEach((element) => {
      let tempValue = parseFloat(element.innerText.replace("°C", "").replace("°F", ""));
      if (!isNaN(tempValue)) {
        if (converter === "F") {
          tempValue = (tempValue * 9/5) + 32;
          element.innerText = `${Math.round(tempValue)}°F`;
        } else {
          tempValue = (tempValue - 32) * 5/9;
          element.innerText = `${Math.round(tempValue)}°C`;
        }
      }
    });
  }
  
// Search function
function searchLocation(event) {
  event.preventDefault();
  const city = document.getElementById("userLocation").value;
  if (city) {
    fetchWeather(city);
  }
}

// Function to change background based on weather condition
function changeBackground(weather) {
  const body = document.body;

  // Remove existing weather-related classes
  body.classList.remove("clear-sky", "cloudy", "rainy", "snowy", "stormy", "foggy");

  // Map weather conditions to background classes
  if (weather.includes("clear")) {
      body.classList.add("clear-sky");
  } else if (weather.includes("clouds")) {
      body.classList.add("cloudy");
  } else if (weather.includes("rain")) {
      body.classList.add("rainy");
  } else if (weather.includes("snow")) {
      body.classList.add("snowy");
  } else if (weather.includes("thunderstorm")) {
      body.classList.add("stormy");
  } else if (weather.includes("fog") || weather.includes("mist") || weather.includes("haze")) {
      body.classList.add("foggy");
  }
}
// Default weather location
fetchWeather("New York");
