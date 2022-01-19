const weather = {
  data: "",
  apiKey: "5041315af2658616f9addd0695a28fcb",
  lang: "de",
  units: "metric",
  StartZeit: "",
  EndZeit: "",

  data: "",
  data2: "",

  Cities: [],
  StartCity: {
    lat: "",
    lon: "",
    name: "Error",
    data: "",
  },

  MidCity1: {
    lat: "",
    lon: "",
    name: "Error",
    data: "",
  },

  EndCity: {
    lat: "",
    lon: "",
    name: "Error",
    data: "",
  },
};
//new Date(parseInt("1642852800000"))
//5 days in miliseconds: 432000000
//+1h = 3600000
//new Date(parseInt("1642863621618"))
//new Date(parseInt((new Date().getTime()+432000000)))

async function fetchWeather(cityWeather) {
  let url = `http://api.openweathermap.org/data/2.5/forecast?lat=${cityWeather.lat}&lon=${cityWeather.lon}&appid=${weather.apiKey}&units=${weather.units}&lang=${weather.lang}`;

  const resp = await fetch(url);

  if (!resp.ok) throw new Error(resp.statusText);
  const data = await resp.json();

  cityWeather.data = data;
}

async function doTheThing() {
  weather.StartCity.name = document.getElementById("StartCity").value;

  weather.EndCity.name = document.getElementById("EndCity").value;

  weather.StartZeit =
    document.getElementById("StartDate").value +
    " " +
    document.getElementById("StartTime").value.substring(3, 5) +
    ":00:00";
  weather.EndZeit =
    document.getElementById("EndDate").value +
    " " +
    document.getElementById("EndTime").value.substring(3, 5) +
    ":00:00";

  await fetchLocation2(weather.StartCity);
  await fetchLocation2(weather.EndCity);
  await setMidCities();

  
}

//asyncroner Versuch, wird nicht benutzt
async function fetchLocation2(city) {
  let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city.name}&limit=5&appid=${weather.apiKey}&lang=${weather.lang}`;

  const resp = await fetch(url);

  const data = await resp.json();
  //weather.data = resp;
  //weather.data2 = data;
  city.lon = data[0].lon;
  city.lat = data[0].lat;

  await fetchWeather(city);
  //return " ";
}

function fetchLocation(city, callback) {
  let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city.name}&limit=5&appid=${weather.apiKey}&lang=${weather.lang}`;

  fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    })
    .then((data) => {
      //console.log("fetched Locations:");
      //console.log(data);

      //document.getElementById("LocationBox").className = "message is-hidden";
      city.lon = data[0].lon;
      city.lat = data[0].lat;

      fetchWeather(city, callback);
    })
    .catch(console.err);
}

//Speichert Start und Endzeit
function tempName() {
  var StartTS =
    document.getElementById("StartDate").value +
    " " +
    document.getElementById("StartTime").value.substring(0, 3);
  var EndTS =
    document.getElementById("EndDate").value +
    " " +
    document.getElementById("EndTime").value.substring(0, 3);

  var longTimeStart = new Date(StartTS).getTime();
  var longTimeEnd = new Date(EndTS).getTime();
  console.log(longTimeEnd);
}

async function setMidCities() {
  weather.MidCity1.lat = (weather.StartCity.lat + weather.EndCity.lat) / 2;
  weather.MidCity1.lon = (weather.StartCity.lon + weather.EndCity.lon) / 2;

  weather.Cities.push(weather.StartCity);
  var zwCities = 3;
  for (let i = 0; i < zwCities; i++) {
    var lat_zw = (weather.EndCity.lat - weather.StartCity.lat) / 5;
    var lon_zw = (weather.EndCity.lon - weather.StartCity.lon) / 5;

    var midCity = {
      name: i,
      lat: "",
      lon: "",
      data: "",
    };

    midCity.lat = lat_zw * (i + 1) + weather.StartCity.lat;
    midCity.lon = lon_zw * (i + 1) + weather.StartCity.lon;
    await fetchWeather(midCity);

    weather.Cities.push(midCity);
  }

  weather.Cities.push(weather.EndCity);

  setDiagramValues();

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Temperatur",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: weather.temp,
      },
      {
        label: "Regenwahrscheinlichkeit",
        backgroundColor: "rgb(25,25, 255)",
        borderColor: "rgb(25, 25, 255)",
        data: weather.Regenwahrscheinlichkeit,
      },
      {
        label: "Windgeschwindigkeit",
        backgroundColor: "rgb(43, 255, 0)",
        borderColor: "rgb(43, 255, 0)",
        data: weather.windspeed,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    options: {},
  };
  const myChart = new Chart(document.getElementById("WetterDiagramm"), config);
}

var labels = [1, 2, 3, 4, 5];

function setDiagramValues() {
  var temp = [];
  var wspeed = [];
  var pop = [];
  new Date(parseInt("1642863621618"));
  labels = [];

  console.log(weather.Cities);
  for (let i = 0; i < weather.Cities.length; i++) {
    temp.push(weather.Cities[i].data.list[0].main.temp);
    wspeed.push(weather.Cities[i].data.list[0].wind.speed);
    pop.push(weather.Cities[i].data.list[0].pop);
    var DateTime = new Date(parseInt(weather.Cities[i].data.list[0].dt * 1000));
    labels.push(("" + DateTime).substring(16, 24));
  }

  weather.temp = temp;
  weather.windspeed = wspeed;
  weather.Regenwahrscheinlichkeit = pop;
}
