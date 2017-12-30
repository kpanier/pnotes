FROM node:carbon

WORKDIR /usr/src/noteservice

COPY *.json ./
COPY src ./src

RUN npm install

RUN npm run-script build

EXPOSE 3000

CMD [ "npm", "start" ]