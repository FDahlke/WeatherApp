import fetch from "node-fetch";
import express, { response } from "express";
import sqlite3 from "sqlite3";
import Sequelize from "sequelize";
import { Op } from "sequelize";
import fs from "fs";

const app = express();

const port = 3000;

const tablename = "test2";

app.set("view engine", "pug");

// Serve Static Assets
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index", { title: "Main Site", message: "Hello there!" });
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db/ormTest.db",
});

try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const Person = sequelize.define(
  "Person",
  {
    // Model attributes are defined here
    firstname: {
      type: Sequelize.STRING,
    },
    lastname: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
  },
  {
    // Other model options go here
  }
);

Person.sync();

//localhost/insertToDB?lastname=x&firstname=y&city=z
app.get("/insertToDB", async function (req, res) {
  var lastname = req.query.lastname;
  var firstname = req.query.firstname;
  var city = req.query.city;

  Person.create({
    lastname: lastname,
    firstname: firstname,
    city: city,
  });

  res.json(firstname + " " + lastname + "  wohnt in: " + city);
});

app.get("/getPeopleLastname", async function (req, res) {
  var lastname = req.query.lastname;

  res.json(
    await Person.findAll({
      where: { lastname: { [Op.like]: lastname } },
    })
  );
});

const City = sequelize.define(
  "City",
  {
    // Model attributes are defined here
    name: {
      type: Sequelize.STRING,
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

app.get("/insertCityFromJson", async function (req, res) {
  var x = "";
  const filepath =
    "C:\\Users\\DahlkeBe\\Downloads\\city.list.json\\city.list.json";

  var fullAr = [];
  fs.readFile(filepath, async (err, data) => {
    if (err) throw err;
    x = JSON.parse(data);

    await x.forEach(async (obj) => {
      //Object.entries(obj).forEach(([key, value]) => {
      var name = obj.name;
      var lat = obj.coord.lat;
      var lon = obj.coord.lon;
      var state = obj.state;
      var country = obj.country;

      var ar = {
        name: name,
        lat: lat,
        lon: lon,
        state: state,
        country: country,
      };
      fullAr.push(ar);
    });

    const citiesDB = await City.bulkCreate(fullAr);
    console.log(fullAr);
  });

  res.json("End of function reached");
});

app.get("/getSingleCity", async function (req, res) {
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

  var city = await City.findAll({
    where: {
      name: cityname,
      country: { [Op.like]: "%" + country },
      state: { [Op.like]: "%" + state },
    },
    limit: 1,
  }).then((cities) => {
    console.log(cities);
    res.json(cities);
  });
});

app.get("/getCities", async function (req, res) {
  const name = req.query.name;
  var cityname = name;
  var country = "";
  var state = "";
  console.log("Getting possible Cities for:" + name);

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

  var city = await City.findAll({
    where: {
      name: { [Op.like]: cityname + "%"},
      country: { [Op.like]: "%" + country },
      state: { [Op.like]: "%" + state },
    },
    limit: 10,
  }).then((cities) => {
    console.log(cities);
    res.json(cities);
    //JSON.stringify(cities, null, 4))
  });
});

app.get("/Weather", function (req, res) {
  res.render("Weather", { title: "Weather", message: "Wetter" });
});