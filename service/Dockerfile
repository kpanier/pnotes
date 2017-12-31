FROM node:carbon

WORKDIR /usr/src/noteservice

COPY *.json ./

RUN npm install

COPY src ./src

RUN npm run-script build

EXPOSE 3000
EXPOSE 3443

CMD [ "npm", "run", "serve" ]