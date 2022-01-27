import fetch from "node-fetch";
import express, { response } from "express";
import sqlite3 from "sqlite3";
/*
import fetch from 'node-fetch';

var unirest = require('unirest');
const express = require('express');
const sqlite3  = require('sqlite3').verbose();
*/
const app = express();

const port = 3000;

app.set("view engine", "pug");

// Serve Static Assets
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("index", { title: "Main Site", message: "Hello there!" });
});

app.get("/Site1", async function (req, res) {
  const url = "http://api.open-notify.org/iss-now.json";
  const resp = await fetch(url);

  if (!resp.ok) throw new Error(resp.statusText);
  const data = await resp.json();

  var lat = data.iss_position.latitude;
  var lon = data.iss_position.longitude;

  const tablename = "test2";

  const db = await new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
    //console.log("Connected to the in-memory SQlite database.");
  });

  const createTable = `CREATE TABLE IF NOT EXISTS ${tablename}(timestamp text, lat float, lon float);`;

  await db.run(createTable);

  let sql = `SELECT * FROM ${tablename}`;

  var hiddenArrayText = "";
  const n = await db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    console.log("this is length:" + rows.length);
    rows.forEach((row) => {
      hiddenArrayText = hiddenArrayText.concat(JSON.stringify(row)+ "\n");
    });
  });
  await db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Close the database connection.");
  });
  //fetch location of the ISS
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(1000);

  console.log("This is the text" + hiddenArrayText);
  res.render("issLocation", {
    title: "Site1",
    message: "This is the first Site",
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

setInterval(function () {
  console.log("Updated Map");
  getLocation();
}, 60000);

async function getLocation() {
  const url = "http://api.open-notify.org/iss-now.json";
  const resp = await fetch(url);

  if (!resp.ok) throw new Error(resp.statusText);
  const data = await resp.json();

  var lat = data.iss_position.latitude;
  var lon = data.iss_position.longitude;

  const tablename = "test2";

  const db = await new sqlite3.Database(`./db/${tablename}.db`, (err) => {
    if (err) {
      return console.error(err.message);
    }
    //console.log("Connected to the in-memory SQlite database.");
  });

  console.log("trying to insert data");
  await db.run(
    `INSERT INTO ${tablename}(timestamp, lat, lon) VALUES(?,?,?)`,
    ["test", lat, lon],
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
