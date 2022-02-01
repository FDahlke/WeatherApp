import fetch from "node-fetch";
import express, { response } from "express";
import sqlite3 from "sqlite3";

const app = express();

const port = 3000;

app.set("view engine", "pug");

// Serve Static Assets
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index", { title: "Main Site", message: "Hello there!" });
});

app.get("/Site1", async function (req, res) {
  const url = "http://localhost:3000/ISS-now";
  const resp = await fetch(url);

  if (!resp.ok) throw new Error(resp.statusText);
  const data = await resp.json();

  var lat = data.lat;
  var lon = data.lon;

  const tablename = "test2";

  const db = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
    //console.log("Connected to the in-memory SQlite database.");
  });

  const createTable = `CREATE TABLE IF NOT EXISTS ${tablename}(timestamp timestamp, lat float, lon float);`;

  db.run(createTable);

  let sql = `SELECT * FROM ${tablename}`;

  var hiddenArrayText = "";
  const n = db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      hiddenArrayText = hiddenArrayText.concat(JSON.stringify(row) + "\n");
    });
  });
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
  //fetch location of the ISS
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1000);

  //console.log("This is the text" + hiddenArrayText);
  res.render("issLocation", {
    title: "ISS Stalker",
    message: "ISS Stalker",
    lat: lat,
    lon: lon,
    hiddenText: hiddenArrayText,
  });
  //store fetched data in database
});

app.get("/Site2", function (req, res) {
  res.render("WeatherRoute", {
    title: "Site2",
    message: "Wetter-Routenplaner",
  });
});

app.get("/Weather", function (req, res) {
  res.render("Weather", { title: "Weather", message: "Wetter" });
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

//Fetch Site for last location in Database
//SELECT * FROM table ORDER BY column DESC LIMIT 1;
app.get("/ISS-now",function(req, res){

  const tablename = "test2";

  const db = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });
  var lat = 0;
  var lon = 0;

  let sql = `SELECT * FROM ${tablename} ORDER BY timestamp DESC LIMIT 1`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
     rows.forEach((row) => {
      lat = row.lat;
      lon = row.lon;
    })
    
    var issNow ={
      "lat":lat, "lon":lon   
    }
  res.json(issNow);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
  

})
setInterval(async function () {
  await getLocation();
}, 60000);
setInterval(async function () {
  await deleteOld();
}, 360000);


//saving ISS location to Database
async function getLocation() {
  const url = "http://api.open-notify.org/iss-now.json";
  const resp = await fetch(url);

  if (!resp.ok) throw new Error(resp.statusText);
  const data = await resp.json();

  var lat = data.iss_position.latitude;
  var lon = data.iss_position.longitude;
  var date = new Date(data.timestamp * 1000);
  var timestamp = date.getFullYear() + "-";
  {
    if (date.getMonth() + 1 < 10) {
      timestamp += "0";
    }
    timestamp += date.getMonth() + 1 + "-";

    if (date.getDate() + 1 < 10) {
      timestamp += "0";
    }
    timestamp += date.getDate() + " ";

    if (date.getHours() < 10) {
      timestamp += "0";
    }
    timestamp += date.getHours() + ":";

    if (date.getMinutes() < 10) {
      timestamp += "0";
    }
    timestamp += date.getMinutes() + ":";

    if (date.getSeconds() < 10) {
      timestamp += "0";
    }
    timestamp += date.getSeconds();

    console.log(timestamp);
  }

  
  console.log("saving new value: {Timestamp: "+ timestamp+", lat: "+ lat,", lon: "+lon)
  const tablename = "test2";

  const db = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  db.run(
    `INSERT INTO ${tablename}(timestamp, lat, lon) VALUES(?,?,?)`,
    [timestamp, lat, lon],
    function (err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been inserted with rowid ${this.lastID}`);
    }
  );

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Close the database connection.");
  });
}

//Deleting location data older than 24
async function deleteOld() {
  const tablename = "test2";

  const db = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
    //console.log("Connected to the in-memory SQlite database.");
  });

  console.log("Deleting old Data");
  var query = `DELETE FROM ${tablename} WHERE timestamp=date('now','-1 day'); `;

  let id = 1;
  // delete a row based on id
  db.run(query, id, function (err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
}
