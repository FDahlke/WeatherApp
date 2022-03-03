import fetch from "node-fetch";
import express, { response } from "express";
import sqlite3 from "sqlite3";
import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const port = process.env.PORT;
const ip = process.env.IP;
const tablename = "test2";

app.set("view engine", "pug");

// Serve Static Assets
app.use(express.static("public"));

const dbStatic = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
  if (err) {
    return console.error(err.message);
  }
});
var dbFree = true;

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

app.get("/", function (req, res) {
  res.render("index", { title: "Main Site", message: "Hello there!" });
});

app.get("/Site1", async function (req, res) {
  const url = `http://${ip}:${port}/ISS-now`;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(resp.statusText);
    const data = await resp.json();
    var lat = data.lat;
    var lon = data.lon;

    const createTable = `CREATE TABLE IF NOT EXISTS ${tablename}(timestamp timestamp, lat float, lon float);`;

    while (!dbFree) {
      console.log("dbFree:" + dbFree);
    }

    dbFree = false;
    dbStatic.run(createTable);

    let sql = `SELECT * FROM ${tablename}`;

    var hiddenArrayText = "";
    const n = dbStatic.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        hiddenArrayText = hiddenArrayText.concat(JSON.stringify(row) + "\n");
      });
    });
    dbFree = true;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(1000);

    res.render("issLocation", {
      title: "ISS Stalker",
      message: "ISS Stalker",
      lat: lat,
      lon: lon,
      hiddenText: hiddenArrayText,
    });
  } catch (error) {
    res.json("Error");
  }
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

//Fetch Site for last location in Database
app.get("/ISS-now", function (req, res) {
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
    });

    var issNow = {
      lat: lat,
      lon: lon,
    };

    res.json(issNow);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });
});
setInterval(async function () {
  try {
    getLocation();
    deleteOld();
  } catch (error) {}
}, 150000);
setInterval(async function () {
  try {
    //await deleteOld();
  } catch (error) {}
}, 360000);

app.get("/getISS", function (req, res) {
  getLocation();
  res.json("");
});

//saving ISS location to Database
async function getLocation() {
  try {
    console.log("Getting ISS Location")
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

      //console.log(timestamp);
    }

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
      }
    );

    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Close the database connection.");
    });
  } catch (error) {
    console.log("Connection Error while Fetching ISS Location");
  }
}

//Deleting location data older than 24
async function deleteOld() {
  const db = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  console.log("Deleting old Data");
  var query = `DELETE FROM ${tablename} WHERE timestamp<datetime('now','-2 hour'); `;

  db.run(query, function (err) {
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

//fur Fetching Requests, gibt 10 moegliche alle Stadtnamen zurueck
app.get("/getCities", function (req, res) {
  const name = req.query.name;
  console.log("Getting possible Cities for:" + name);
  var cityname = name;
  var country = "";

  if (name.includes(",")) {
    cityname = name.substring(0, name.indexOf(","));
    country = name.substring(name.indexOf(",") + 1, name.length);
  }

  var sql = `SELECT * FROM Cities WHERE name LIKE '${cityname}%' AND country LIKE '${country}%' limit 20;`;

  console.time("possible Cities: Opening Database");

  while (!dbFree) {
    console.log("GetCities: dbFree:" + dbFree);
  }

  dbFree = false;

  console.timeEnd("possible Cities: Opening Database");

  var json = '{"Cities":[';
  console.time("possible Cities: Fetching rows");
  const n = dbStatic.all(sql, [], (err, rows) => {
    if (err) {
      res.json();
      throw err;
    }

    console.timeEnd("possible Cities: Fetching rows");
    rows.forEach((row) => {
      json += JSON.stringify(row) + ",";
    });
    if (json[json.length - 1] == ",") {
      json = json.substring(0, json.length - 1);
    }
    json += "]}";
    res.json(JSON.parse(json));
  });

  dbFree = true;
  /*
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
  });*/
});

//gibt eine Stadt mit exakt dem gleichen Namen zurueck
app.get("/getSingleCity", function (req, res) {
  const name = req.query.name;
  var cityname = name;
  var country = "";
  var state = "";
  console.log("Getting single City " + name);

  var ar = name.split(",");
  switch (ar.length) {
    case 1:
      cityname = ar[0];
      break;

    case 2:
      cityname = ar[0];
      country = ar[1];
      break;

    case 3:
      cityname = ar[0];
      country = ar[1];
      state = ar[2];
      break;
  }
  if (name.includes(",")) {
  }

  var sql = `SELECT * FROM Cities WHERE name = '${cityname}' AND country LIKE '${country}%' AND state like '%${state}' limit 1;`;

  console.time("single City: fetching");
  const db = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  var alreadySet = false;

  var json = '{"Cities":[';
  const n = db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      const test123 = City.create({
        name: row.name,
        lat: row.lat,
        lon: row.lon,
        country: row.country,
        state: row.state,
      });
      res.json(row);
      alreadySet = true;
    });
    console.timeEnd("single City: fetching");
    if (!alreadySet) {
      res.json("none");
    }

    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
    });
  });
});

const sequelize = new Sequelize("sqlite::memory:");

try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const City = sequelize.define(
  "City",
  {
    // Model attributes are defined here
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lat: {
      type: Sequelize.FLOAT,
    },
    lon: {
      type: Sequelize.FLOAT,
    },
    country: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
  },
  {
    // Other model options go here
  }
);

City.sync();

app.get("/ORM-Test", async function (req, res) {
  var test123 = "";
  await City.findAll({}).then((cities) => {
    test123 = cities;
  });

  res.json(test123);
});
/*
app.get("/Cities", async function (req, res) {
  //const fs = require("fs");

  var x = "";
  const filepath =
    "C:\\Users\\DahlkeBe\\Downloads\\city.list.json\\city.list.json";

  var name = "";
  var lat = "";
  var lon = "";
  var state = "";
  var country = "";
  var id = "";

  console.log(filepath);
  fs.readFile(filepath, async (err, data) => {
    if (err) throw err;
    x = JSON.parse(data);

    //const createTable = `CREATE TABLE IF NOT EXISTS cities(id int,name text, lat float, lon float, state text, country text);`;

    //db.run(createTable);
    const db = new sqlite3.Database(`./db/${tablename}.db`, (err) => {
      if (err) {
        return console.error(err.message);
      }
    });
    await x.forEach(async (obj) => {
      //Object.entries(obj).forEach(([key, value]) => {
      name = obj.name;
      lat = obj.coord.lat;
      lon = obj.coord.lon;
      state = obj.state;
      country = obj.country;
      id = obj.id;

      var ar = [id, name, lat, lon, state, country];

      //console.log("inserting " + ar)
      db.run(
        `INSERT INTO cities(id, name, lat, lon, state, country) VALUES(?,?,?,?,?,?)`,
        ar,()=>{
      console.log("inserted " + ar);
        }
      );
    });

    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Close the database connection.");
    });

    console.log(x[0]);
    res.json(x[0]);
  });
  
});
*/
