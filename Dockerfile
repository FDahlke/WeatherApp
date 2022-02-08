FROM node:17

ENV NODE_ENV=production

WORKDIR /usr/src/app

#Copy package.json and install dependencies
COPY package*.json ./
RUN npm install 

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
