# Typescript based notes app following a Microservice approach

This project is used to explore a typescript based technologie stack with:

* Typescript
* Express
* MongoDB
* Ionic
* VSCode

The usage of the app is between a personal note and a personal wiki.

## Usage

* Notes list: http://localhost:3000/notes

## Development

### Build

#### Service

* Compile all the time: `npm run tsc`
* Run service hot code replacement: `npm run serve`

#### Mobile App

* ionic serve

### Inspect

####  MongoDB

Connect: 

mongo  --host localhost --port 27037 -u dbuser -p dbpassword-enc notes-db

Show Collections:

db.getCollectionNames()

Inspect colletion:

db.getCollection('notes').find()