const weather = {
  data: "",
  apiKey: "5041315af2658616f9addd0695a28fcb",
  lang: "de",
  units: "metric",
  StartZeit: "",
  EndZeit: "",

  data: "",

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

  init: function () {
    var currentTime = new Date().getTime();
    console.log("Current Time = " + currentTime);
    currentTime = currentTime.substring(0, 8) + "00000";
    console.log("normalized Time = " + currentTime);
  },
  //new Date(parseInt("1642852800000"))
  //5 days in miliseconds: 432000000
  //+1h = 3600000
  //new Date(parseInt("1642863621618"))
  //new Date(parseInt((new Date().getTime()+432000000)))

  doTheThing: function () {
    weather.StartCity.name = document.getElementById("StartCity").value;
    weather.fetchLocation(weather.StartCity);

    weather.EndCity.name = document.getElementById("EndCity").value;
    weather.fetchLocation(weather.EndCity);
    weather.setMidCities();
    weather.fetchWeather(weather.MidCity1);
  },

  fetchWeather: function (City) {
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
  },

  fetchLocation: function (City) {
    let url = `http://api.openweathermap.org/geo/1.0/direct?q=${City.name}&limit=5&appid=${weather.apiKey}&lang=${weather.lang}`;

    fetch(url)
      .then((resp) => {
        if (!resp.ok) throw new Error(resp.statusText);
        return resp.json();
      })
      .then((data) => {
        console.log("fetched Locations:");
        console.log(data);

        //document.getElementById("LocationBox").className = "message is-hidden";
        City.lon = data[0].lon;
        City.lat = data[0].lat;

        weather.fetchWeather(City);
      })
      .catch(console.err);
  },

  //Speichert Start und Endzeit 
  tempName: function () {
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
  },

  setMidCities() {
    weather.MidCity1.lat = (weather.StartCity.lat + weather.EndCity.lat) / 2;
    weather.MidCity1.lon = (weather.StartCity.lon + weather.EndCity.lon) / 2;
  },
};
