FROM node:18.19.0

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000