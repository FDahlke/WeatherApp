var unirest = require('unirest');
const express = require('express');

const app = express();
const port = 3000;

app.set('view engine', 'pug')

// Serve Static Assets
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('index', { title: 'Main Site', message: 'Hello there!' })
})

app.get('/Site1', function(req, res) {
  res.render('basicSite', { title: 'Site1', message: 'This is the first Site' })
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