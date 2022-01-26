import fetch from 'node-fetch';
import express, { response } from 'express';
import sqlite3 from 'sqlite3';
/*
import fetch from 'node-fetch';

var unirest = require('unirest');
const express = require('express');
const sqlite3  = require('sqlite3').verbose();
*/
const app = express();

const port = 3000;

app.set('view engine', 'pug')

// Serve Static Assets
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index', { title: 'Main Site', message: 'Hello there!' })
})

app.get('/Site1', async function(req, res) {

  const url = "http://api.open-notify.org/iss-now.json"
  const resp = await fetch(url);

  if (!resp.ok) throw new Error(resp.statusText);
  const data = await resp.json();

  var lat =data.iss_position.latitude
  var lon =data.iss_position.longitude
//fetch location of the ISS

  res.render('issLocation', { title: 'Site1', message: 'This is the first Site', lat:lat, lon:lon })
  //store fetched data in database
});

app.get('/Site2', function(req, res) {
  res.render('WeatherRoute', { title: 'Site2', message: 'Wetter-Routenplaner' })
});

app.get('/Weather', function(req, res) {
  res.render('Weather', { title: 'Weather', message: 'Wetter' })
});

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`)
});


const db= new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
}); 

db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});