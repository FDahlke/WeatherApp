

const weather = {
    init: () => {
        //Adding Click Function to button
        var x =document.getElementById('Submit')
        .addEventListener('click', weather.fetchWeather);
    },

    //Fetching response from the API
    fetchWeather: function(){
        let City= document.getElementById("City").value;
        let apiKey= "5041315af2658616f9addd0695a28fcb";
        let lang = 'de';
        let units = 'metric';
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${City}&appid=${apiKey}&units=${units}&lang=${lang}`;

        console.log('Fetching Data from' +  url);
        fetch(url)
          .then(resp=> {
              if(!resp.ok)throw new Error(resp.statusText);
              return resp.json();
          })
          .then(data =>{
              weather.showWeather(data);
          })
          .catch(console.err);
    },
    //Using the response
    showWeather: (resp)=> {
        console.log(resp);
        document.getElementById("columns").innerHTML = "<div class=\"column is-centered has-text-centered\" id=\"c1\" </div>";

        document.getElementById("c1").innerHTML += resp.name +"<br>";

        let pngUrl = `http://openweathermap.org/img/wn/${resp.weather[0].icon}@4x.png`
        document.getElementById("c1").innerHTML +="<img src=\"" + pngUrl + "\"> <br>";

        document.getElementById("c1").innerHTML += resp.weather[0].description + "<br>";
        document.getElementById("c1").innerHTML += "Aktuelle Temperatur: "+resp.main.temp+ "°C <br>";
        document.getElementById("c1").innerHTML += "Gefühlte Temperatur: "+resp.main.feels_like+ "°C <br>";
        document.getElementById("c1").innerHTML += "Luftfeuchtigkeit: "+resp.main.humidity+ "% <br>";
        document.getElementById("c1").innerHTML += "Wind: "+resp.wind.speed+ "m/s <br>";
        
    }

}



