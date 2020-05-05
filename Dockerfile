FROM node:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN apt-get update && npm install && apt-get install sip-tester -y
COPY . .
VOLUME . .
EXPOSE 3000
EXPOSE 8080

CMD [ "npm", "start" ]
