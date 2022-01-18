const weather = {
  data: "",
  apiKey: "5041315af2658616f9addd0695a28fcb",
  lang: "de",
  units: "metric",
  StartZeit: "",
  EndZeit: "",

  data: "",
  data2: "",

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

function fetchWeather(City) {
  let url = `http://api.openweathermap.org/data/2.5/forecast?lat=${City.lat}&lon=${City.lon}&appid=${weather.apiKey}&units=${weather.units}&lang=${weather.lang}`;

  fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    })
    .then((data) => {
      console.log(data);
      City.data = data;
    })
    .catch(console.err);
}

function init() {
  var currentTime = new Date().getTime();
  console.log("Current Time = " + currentTime);
  currentTime = currentTime.substring(0, 8) + "00000";
  console.log("normalized Time = " + currentTime);
}

const getData = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const data = await response.json();

  console.log(data);

  weather.StartCity.name = document.getElementById("StartCity").value;
  fetchLocation(weather.StartCity);

  weather.EndCity.name = document.getElementById("EndCity").value;

  fetchLocation(weather.EndCity);

  setMidCities();
  fetchWeather(weather.MidCity1);
};

function doTheThing() {
  weather.StartCity.name = document.getElementById("StartCity").value;

  weather.EndCity.name = document.getElementById("EndCity").value;

  
  fetchLocation(weather.StartCity, function () {
    fetchLocation(weather.EndCity, () => {
      setMidCities();
    });
  });
  
/*
  fetchLocation2(weather.StartCity).then( () =>
  {fetchLocation2(weather.EndCity).then( () =>
  {setMidCities()})});
*/
}

//async
async function fetchLocation2(city) {
  let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city.name}&limit=5&appid=${weather.apiKey}&lang=${weather.lang}`;

  const resp = await fetch(url);
  
  const data = resp.json;
  weather.data = resp;
  weather.data2 = data;
  console.log("fetched Locations:");
  console.log(data);
  city.lon = data[0].lon;
  city.lat = data[0].lat;

  fetchWeather(city);
  return " ";
}

function fetchLocation(city, callback) {
  let url = `http://api.openweathermap.org/geo/1.0/direct?q=${city.name}&limit=5&appid=${weather.apiKey}&lang=${weather.lang}`;

  fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(resp.statusText);
      return resp.json();
    })
    .then((data) => {
      console.log("fetched Locations:");
      console.log(data);

      //document.getElementById("LocationBox").className = "message is-hidden";
      city.lon = data[0].lon;
      city.lat = data[0].lat;

      fetchWeather(city);
    })
    .then(() => {
      if (callback) {
        callback();
      }
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

function setMidCities() {
  console.log(weather.StartCity, weather.EndCity);

  console.log("lat: " + weather.StartCity.lat);

  weather.MidCity1.lat = (weather.StartCity.lat + weather.EndCity.lat) / 2;
  weather.MidCity1.lon = (weather.StartCity.lon + weather.EndCity.lon) / 2;

  fetchWeather(weather.MidCity1);
}
