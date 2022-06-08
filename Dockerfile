FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE  9012
CMD npm start sample.csv output.csv
