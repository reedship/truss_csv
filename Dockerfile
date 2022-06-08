FROM node:8-alpine3.9

RUN apk update
RUN apk add --no-cache g++ make python python-dev
RUN rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE  9012
CMD npm start sample.csv output.csv
