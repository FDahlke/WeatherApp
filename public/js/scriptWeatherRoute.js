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
    dtIndex: 0,
  },

  EndCity: {
    lat: "",
    lon: "",
    name: "Error",
    data: "",
    dtIndex: 0,
  },
  oldChart: "",
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

//Main Function
async function doTheThing() {
  weather.StartCity.name = document.getElementById("StartCity").value;

  weather.EndCity.name = document.getElementById("EndCity").value;

  getTimes();

  await fetchLocation2(weather.StartCity);
  await fetchLocation2(weather.EndCity);
  await setMidCities();
  setMap();
}

//fetches Coordinates based on City Name
async function fetchLocation2(city) {
  let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city.name}&limit=5&appid=${weather.apiKey}&lang=${weather.lang}`;

  const resp = await fetch(url);

  const data = await resp.json();
  city.lon = data[0].lon;
  city.lat = data[0].lat;

  await fetchWeather(city);
}

//Speichert Start und Endzeit
function getTimes() {
  weather.StartZeit =
    document.getElementById("StartDate").value +
    " " +
    document.getElementById("StartTime").value.substring(0, 2) +
    ":00:00";
  weather.EndZeit =
    document.getElementById("EndDate").value +
    " " +
    document.getElementById("EndTime").value.substring(0, 2) +
    ":00:00";
}

//Berechnet Zwischenpunkte zwischen Start und Ende
async function setMidCities() {
  weather.Cities = [];
  weather.Cities.push(weather.StartCity);

  //wieviele Punkte zwischen Start und Ende ausgerechnet werden sollen
  var zwCities = 3;
  for (let i = 0; i < zwCities; i++) {
    var lat_zw = (weather.EndCity.lat - weather.StartCity.lat) / (zwCities + 2);
    var lon_zw = (weather.EndCity.lon - weather.StartCity.lon) / (zwCities + 2);

    var midCity = {
      name: i,
      lat: "",
      lon: "",
      data: "",
    };

    midCity.lat = lat_zw * (i + 1) + weather.StartCity.lat;
    midCity.lon = lon_zw * (i + 1) + weather.StartCity.lon;
    await fetchWeather(midCity);

    //added den Zwischenpunkt in das Array
    weather.Cities.push(midCity);
  }

  weather.Cities.push(weather.EndCity);

  setDiagramValues();

  //Daten fuer den Graphen
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Temperatur",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: weather.temp,
        tension: 0.2,
        yAxisID: "y",
      },
      {
        label: "Regenwahrscheinlichkeit",
        backgroundColor: "rgb(25,25, 255)",
        borderColor: "rgb(25, 25, 255)",
        data: weather.Regenwahrscheinlichkeit,
        tension: 0.2,
        yAxisID: "y1",
      },
      {
        label: "Windgeschwindigkeit",
        backgroundColor: "rgb(43, 255, 0)",
        borderColor: "rgb(43, 255, 0)",
        data: weather.windspeed,
        tension: 0.2,
        yAxisID: "y",
      },
    ],
  };

  //Konfiguration des Graphen
  const config = {
    type: "line",
    data: data,
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",
        },
        //zweite Y-Achse fuer die Regenwahrscheinlichkeit
        y1: {
          type: "linear",
          display: true,
          position: "left",
          min: 0,
          max: 1,

          // grid line settings
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
          },
        },
      },
    },
  };

  try {
    //const oldChart = document.getElementById("WetterDiagramm");

    weather.oldChart.destroy();
    console.log("OldChart destroyed");
  } catch (error) {
    console.log("OldChart destruction failed");
  }

  const myChart = new Chart(document.getElementById("WetterDiagramm"), config);
  weather.oldChart = myChart;
}

var labels = [1, 2, 3, 4, 5];

function setDiagramValues() {
  var temp = [];
  var wspeed = [];
  var pop = [];
  labels = [];

  var startindex = 0;
  var endindex = 0;
  var oneHour = 3600100;

  var EndZeit = new Date(weather.EndZeit).getTime();
  var StartZeit = new Date(weather.StartZeit).getTime();

  for (let index = 0; index < weather.Cities[0].data.list.length; index++) {
    if (StartZeit >= weather.Cities[0].data.list[index].dt * 1000) {
      startindex = index;
    }
    if (
      weather.Cities[0].data.list[index].dt * 1000 - oneHour <= EndZeit &&
      weather.Cities[0].data.list[index].dt * 1000 + oneHour >= EndZeit
    ) {
      console.log(endindex);
      endindex = index;
    }
  }

  weather.Cities[0].dtIndex = startindex;
  weather.Cities[4].dtIndex = endindex;

  //Interpoliert die Timestamps zwischen start und Ende
  var zwCities = 3;
  for (let i = 0; i < zwCities; i++) {
    var dtIndex_zw =
      (weather.Cities[4].dtIndex - weather.Cities[0].dtIndex) / 5;

    //Runded auf die naechste Ganze Zahl
    weather.Cities[i + 1].dtIndex = Math.round(
      dtIndex_zw * (i + 1) + weather.Cities[0].dtIndex
    );
  }

  //Added die Wetterdaten in das Array des Graphen
  for (let i = 0; i < weather.Cities.length; i++) {
    temp.push(weather.Cities[i].data.list[0].main.temp);
    wspeed.push(weather.Cities[i].data.list[0].wind.speed);
    pop.push(weather.Cities[i].data.list[0].pop);
    var DateTime = new Date(
      parseInt(weather.Cities[i].data.list[weather.Cities[i].dtIndex].dt * 1000)
    );
    labels.push(("" + DateTime).substring(16, 24));
  }

  weather.temp = temp;
  weather.windspeed = wspeed;
  weather.Regenwahrscheinlichkeit = pop;
}

//Zeichnet eine Linie zwischen Start und Ende auf die Karte und setzt den Fokus auf den Mittelpunkz
function setMap() {
  document.getElementById("WetterAnzeige").innerHTML = '<div id="map"></div>';
  var map = L.map("map").setView(
    [weather.Cities[2].lat, weather.Cities[2].lon],
    8
  );

  L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  var polygon = L.polygon([
    [weather.Cities[0].lat, weather.Cities[0].lon],
    [weather.Cities[1].lat, weather.Cities[1].lon],
    [weather.Cities[2].lat, weather.Cities[2].lon],
    [weather.Cities[3].lat, weather.Cities[3].lon],
    [weather.Cities[4].lat, weather.Cities[4].lon],
  ]).addTo(map);
}
