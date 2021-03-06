var protocoll = "http";
var ip = "localhost";
var port = "3000";

//getting correct IP-Adress
try {
  var fullURL = window.location.href;
  protocoll = fullURL.substring(0, fullURL.indexOf("/") - 1);
  fullURL = fullURL.substring(fullURL.indexOf("/") + 2);
  var partUrl = fullURL.substring(0, fullURL.indexOf("/"));
  ip = partUrl.substring(0, partUrl.indexOf(":"));
  port = partUrl.substring(partUrl.indexOf(":") + 1);
} catch (error) {
  console.log(error);
  protocoll = "http";
  ip = "localhost";
  port = "3000";
}
console.log(`This is ${ip}:${port}`);

const weather = {
  data: "",
  apiKey: "5041315af2658616f9addd0695a28fcb",
  lang: "de",
  units: "metric",

  temp1: "x",

  city: "",
  lon: "",
  lat: "",

  citylist: "",
};


function init() {
  //Adding Click Function to button
  var x = document
    .getElementById("Submit")
    .addEventListener("click", FirstFunction);

  var btnCurrent = document
    .getElementById("currentWeather")
    .addEventListener("click", showCurrent);
  var btnHourly = document
    .getElementById("hourlyWeather")
    .addEventListener("click", showHourly);
  var btnDaily = document
    .getElementById("dailyWeather")
    .addEventListener("click", showDaily);

  //object.addEventListener("select", myScript);
  var CitySelector = document
    .getElementById("Selector")
    .addEventListener("change", secondFunction);
}

async function FirstFunction() {

  var partialName = document.getElementById("City").value;
  const url2 = `${protocoll}://${ip}:${port}/getSingleCity?name=${partialName}`;
  const singleCity = await fetch(url2);
  const singleData = await singleCity.json();
  weather.lat = singleData.lat;
  weather.lon = singleData.lon;
  fetchWeather();
}

function secondFunction() {
  var x = document.getElementById("CitySelector").value;
  if (x != "Stadt auswählen") {
    fetchLocation(x);
  }
  document.getElementById("City").value =
    document.getElementById("CitySelector").value;
}

//fetching Koordinaten der Stadt
function fetchLocation(City) {
  let url = `https://api.openweathermap.org/geo/1.0/direct?q=${City}&limit=5&appid=${weather.apiKey}&lang=${weather.lang}`;

  fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    })
    .then((data) => {
      console.log("fetched Locations:");
      console.log(data);
      if (data.length > 1) {
        tooManyLocations(data);
      } else {
        document.getElementById("LocationBox").className = "message is-hidden";
        weather.lon = data[0].lon;
        weather.lat = data[0].lat;
        fetchWeather();
      }
    })
    .catch(console.err);
}

//fetches Stadtnamen basierend auf Coordinaten
function fetchCity() {
  url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${weather.lat}&lon=${weather.lon}&limit=1&appid=${weather.apiKey}`;

  console.log("Fetching City Name from: " + url);
  fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    })
    .then((data) => {
      weather.temp1 = data;
      if (data.length == 0) {
        weather.city = "NoName";
      } else {
        console.log(data[0]);
        weather.city = data[0].name;
        try {
          weather.city += "," + data[0].state;
        } catch (error) {}
        weather.city += "," + data[0].country;
      }
      console.log(weather.city);
      document.getElementById("City").value = weather.city;
    })
    .catch(console.err);
}

//ruft Auswahl auf, wenn es zuviele moegliche Staedte gibt
function tooManyLocations(locations) {
  document.getElementById("LocationBox").className = "message";

  document.getElementById("CitySelector").innerHTML =
    "<option>Stadt auswählen</option>";
  var i = 0;
  while (i < locations.length) {
    var CityOption = "";
    CityOption += "<option>" + locations[i].name;
    if (locations[i].state != undefined) {
      CityOption += "," + locations[i].state;
    }

    CityOption += "," + locations[i].country + "</option>";
    document.getElementById("CitySelector").innerHTML += CityOption;
    i++;
  }
  document.getElementById("TooManyLocationsMessage").innerHTML +=
    "</select>    </div>";
}
//Fetches Wetterdaten basieren auf Koordinaten
function fetchWeather() {
  let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${weather.lat}&lon=${weather.lon}&appid=${weather.apiKey}&units=${weather.units}&lang=${weather.lang}`;

  fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    })
    .then((data) => {
      console.log(data);
      weather.data = data;
      showCurrent();
    })
    .catch(console.err);
}

//zeigt Aktuelles Wetter an
function showCurrent() {
  let resp = weather.data;
  document.getElementById("wetterAnzeige").innerHTML =
    '<div class="column is-centered has-text-centered has-background-primary-light" id="columnCurrent" </div>';

  //document.getElementById("columnCurrent").innerHTML += resp.name + "<br>";

  let pngUrl = `https://openweathermap.org/img/wn/${resp.current.weather[0].icon}@4x.png`;
  document.getElementById("columnCurrent").innerHTML +=
    '<img src="' + pngUrl + '"> <br>';

  document.getElementById("columnCurrent").innerHTML +=
    resp.current.weather[0].description + "<br>";
  document.getElementById("columnCurrent").innerHTML +=
    "Aktuelle Temperatur: " + resp.current.temp + "°C <br>";
  document.getElementById("columnCurrent").innerHTML +=
    "Gefühlte Temperatur: " + resp.current.feels_like + "°C <br>";
  document.getElementById("columnCurrent").innerHTML +=
    "Luftfeuchtigkeit: " + resp.current.humidity + "% <br>";
  document.getElementById("columnCurrent").innerHTML +=
    "Wind: " + resp.current.wind_speed + "m/s <br>";

  document.getElementById("wetterAnzeige").innerHTML +=
    '<div class="column is-centered has-text-centered" id="columnMap" </div>';

  document.getElementById("columnMap").innerHTML += '<div id="map"></div>';

  var map = L.map("map").setView([weather.lat, weather.lon], 10);

  L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on("click", function (e) {
    console.log("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng);
    weather.lat = e.latlng.lat;
    weather.lon = e.latlng.lng;
    fetchCity();
    fetchWeather();
  });
}

//zeigt vorhersagen des aktuellen Tages an
function showHourly() {
  let resp = weather.data;

  document.getElementById("wetterAnzeige").innerHTML = "";
  for (let i = 0; i <= 8; i += 4) {
    if (i == 4) {
      document.getElementById("wetterAnzeige").innerHTML +=
        '<div class="column is-centered has-text-centered has-background-primary-light" id="column' +
        i +
        '" </div>';
    } else {
      document.getElementById("wetterAnzeige").innerHTML +=
        '<div class="column is-centered has-text-centered" id="column' +
        i +
        '" </div>';
    }

    //document.getElementById("columnCurrent").innerHTML += resp.name + "<br>";
    if (i == 0) {
      document.getElementById("column" + i).innerHTML += " Jetzt: <br>";
    } else {
      document.getElementById("column" + i).innerHTML +=
        "In " + i + " Stunden <br>";
    }

    let pngUrl = `https://openweathermap.org/img/wn/${resp.hourly[i].weather[0].icon}@4x.png`;
    document.getElementById("column" + i).innerHTML +=
      '<img src="' + pngUrl + '"> <br>';

    document.getElementById("column" + i).innerHTML +=
      resp.hourly[i].weather[0].description + "<br>";
    document.getElementById("column" + i).innerHTML +=
      "Aktuelle Temperatur: " + resp.hourly[i].temp + "°C <br>";
    document.getElementById("column" + i).innerHTML +=
      "Gefühlte Temperatur: " + resp.hourly[i].feels_like + "°C <br>";
    document.getElementById("column" + i).innerHTML +=
      "Luftfeuchtigkeit: " + resp.hourly[i].humidity + "% <br>";
    document.getElementById("column" + i).innerHTML +=
      "Wind: " + resp.hourly[i].wind_speed + "m/s <br>";
  }
}

//zeigt vorhersagen der aktuellen Woche an
function showDaily() {
  let resp = weather.data;

  document.getElementById("wetterAnzeige").innerHTML = "";
  for (let i = 0; i <= 2; i++) {
    if (i == 1) {
      document.getElementById("wetterAnzeige").innerHTML +=
        '<div class="column is-centered has-text-centered has-background-primary-light" id="column' +
        i +
        '" </div>';
    } else {
      document.getElementById("wetterAnzeige").innerHTML +=
        '<div class="column is-centered has-text-centered" id="column' +
        i +
        '" </div>';
    }

    switch (i) {
      case 0:
        document.getElementById("column" + i).innerHTML += "Heute: <br>";
        break;

      case 1:
        document.getElementById("column" + i).innerHTML += "Morgen: <br>";
        break;
      case 2:
        document.getElementById("column" + i).innerHTML += "Übermorgen: <br>";
        break;
    }
    //document.getElementById("columnCurrent").innerHTML += resp.name + "<br>";

    let pngUrl = `https://openweathermap.org/img/wn/${resp.daily[i].weather[0].icon}@4x.png`;
    document.getElementById("column" + i).innerHTML +=
      '<img src="' + pngUrl + '"> <br>';

    document.getElementById("column" + i).innerHTML +=
      resp.daily[i].weather[0].description + "<br>";
    document.getElementById("column" + i).innerHTML +=
      "Aktuelle Temperatur: " + resp.daily[i].temp.day + "°C <br>";
    document.getElementById("column" + i).innerHTML +=
      "Gefühlte Temperatur: " + resp.daily[i].feels_like.day + "°C <br>";
    document.getElementById("column" + i).innerHTML +=
      "Luftfeuchtigkeit: " + resp.daily[i].humidity + "% <br>";
    document.getElementById("column" + i).innerHTML +=
      "Wind: " + resp.daily[i].wind_speed + "m/s <br>";
  }
}

//fetching CityData
async function getCities() {
  var partialName = document.getElementById("City").value;

  if (partialName.length > 3) {
    let url = `${protocoll}://${ip}:${port}/getCities?name=${partialName}`;

    const resp = await fetch(url);

    if (!resp.ok) throw new Error(resp.statusText);
    const data = await resp.json();

    document.getElementById("Citylist").innerHTML = "";

    weather.citylist = data;
    for (let i = 0; i < data.Cities.length; i++) {
      document.getElementById(
        "Citylist"
      ).innerHTML += `<option value="${data.Cities[i].name},${data.Cities[i].country},${data.Cities[i].state}">`;
    }
  } else {
    document.getElementById("Citylist").innerHTML = "";
  }
}
