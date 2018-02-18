import * as assert from 'assert';

const MongoInMemory = require('mongo-in-memory');
let mongoInMemory
let myDb;
var mongodb = require('mongodb');

before(done => {
    console.log('Start mongo in memory');
    mongoInMemory = new MongoInMemory(8000);
    mongoInMemory.start(async (error, config) => {
        console.log('Mongo started');
        mongodb.connect(mongoInMemory.getMongouri("testDatabaseName"), (error, db) => {
            console.log('Connected');
            myDb = db;
            done();
        })
    });
})

beforeEach(async () => {
    if (myDb) {
        await myDb.dropDatabase();
    }
})

after(done => {
    mongoInMemory.stop((error) => {
        myDb.close();
        assert(!error);
        done();
    });
})

export function getMongoDb() {
    return myDb;
}