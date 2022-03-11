# WeatherApp

docker container run --rm -p 3000:3000 -d -e HTTP_PROXY -e HTTPS_PROXY -e http_proxy -v ~/db:/usr/src/app/db --name WeatherApp fdahlke/weatherapp
docker container run --rm -p 3000:3000 -d --name WeatherApp fdahlke/weatherapp

docker container run --rm -p 3000:3000 -e HTTP_PROXY -e HTTPS_PROXY -e http_proxy -v ~/db:/usr/src/app/db -it --name WeatherApp fdahlke/weatherapp /bin/bash

docker container run --rm -p 3000:3000 -it --name WeatherApp fdahlke/weatherapp /bin/bash

docker build . -t fdahlke/weatherapp

docker image save -o weatherapp.tar fdahlke/weatherapp

pscp weatherapp.tar username@ip:weatherapp.tar

docker image load -i weatherapp.tar

apt install sqlite3 

compose:
docker-compose up -d


version : '3'
services:
  web:
    container_name: WeatherApp
    image: fdahlke/weatherapp
    volumes:
      -  ./db:/usr/src/app/db
    environment:
      - HTTP_PROXY
      - HTTPS_PROXY
      - http_proxy 
    ports:
      - "3000:3000"



docker stack deploy --compose-file docker-compose.yml fdahlke/weatherapp


10.61.16.6:3128