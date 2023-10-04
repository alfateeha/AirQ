import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const airVisual_API_URL = "http://api.airvisual.com/v2/nearest_city?lat=";
const openWeather_API_URL = "http://api.openweathermap.org/data/2.5/air_pollution?lat=";
const currentWeather_API_URL = "https://api.openweathermap.org/data/2.5/weather?lat=";
const locationIQ_API_URL = "https://us1.locationiq.com/v1/search?key=";
const geoapify_API_URL = "https://maps.geoapify.com/v1/staticmap?style=osm-bright-grey&width=600&height=200&center=lonlat:";

const airVisualAPIKey = "7acf9781-0f08-4bd3-a960-4471e070e8e3";
const openWeatherAPIKey = "dbcdb21da2f67a71678f4da182ad7534";
const currentWeatherAPIKey = "dbcdb21da2f67a71678f4da182ad7534";
const locationIQAPIToken = "pk.6ccf2561355b98239a919f16540078d7";
const geoapifyAPIKey = "53fd501ff40748378dc22521db2baea6";
const configGeo = {
  headers: { Authorization: `Bearer ${locationIQAPIToken}` },
};

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
  });

app.post("/", async (req, res) => {
  const searchCity = req.body.city;
  
  try {
    // locationIQ API to get latitude and longitude of a city
    const result = await axios.get(locationIQ_API_URL + locationIQAPIToken + "&q=" + searchCity + "&format=json", configGeo);
    // return latitude and longitude;
    const latitude = result.data[0].lat;
    const longitude = result.data[0].lon;
    

    try {
      // Air Visual API to get air quality of the city
      const airQuality = await axios.get(airVisual_API_URL + latitude + "&lon=" + longitude + "&key=" + airVisualAPIKey);
      // return air quality index of the searched city
      const cityName = capitalizeWords(searchCity.toLowerCase()) + ", " + airQuality.data.data.country;
      const cityAirQuality = airQuality.data.data.current.pollution.aqius;

      // OpenWeather API to get pollutants concentration
      const airPollutant = await axios.get(openWeather_API_URL + latitude + "&lon=" + longitude + "&appid=" + openWeatherAPIKey);
      const pollutants = airPollutant.data.list[0].components;

      // Geoapify API to get static map
      const staticMap = geoapify_API_URL + longitude + "," + latitude + "&zoom=10&apiKey=" + geoapifyAPIKey;


      // IQAir API to get current weather
      const weather = await axios.get(currentWeather_API_URL + latitude + "&lon=" + longitude + "&appid=" + currentWeatherAPIKey + "&units=metric");
      // return weather name
      const weatherName = capitalizeWords(weather.data.weather[0].description.toLowerCase());
      // return weather data
      const weatherData = weather.data.main;
      // return weather icon path
      const weatherIconSrc = "/Images/Weather/" + weather.data.weather[0].icon + ".png";


      res.render("index.ejs", { 
        content: JSON.stringify(cityAirQuality), 
        city: cityName, 
        map: staticMap, 
        pollutant: pollutants, 
        weatherName: weatherName, 
        weatherData: weatherData,  
        weatherIconSrc: weatherIconSrc });
    } catch (error) {
      res.render("index.ejs", { content: "City is not exist." });
    }
  } catch (error) {
    res.render("index.ejs", { content: "City is not exist." });
  }
});

function capitalizeWords(str) {
  // Split the string into words
  const words = str.split(' ');

  // Capitalize the first letter of each word
  const capitalizedWords = words.map(word => {
    // Check if the word is not empty
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    } else {
      return '';
    }
  });

  // Join the capitalized words back into a single string
  return capitalizedWords.join(' ');
}


app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });
  