import { APIServer } from './APIServer';
import MongoClient = require('mongodb');
let url = 'mongodb://dbuser:notes-enc@localhost:27037/notes-db';

if (process.env.mongourl) {
    url = process.env.mongourl;
    console.log('Use env for mongodb')
}

MongoClient.connect(url, function (err, mongodb) {
    if (err) {
        console.log(err);
    }
    else {
        let app: APIServer = new APIServer(mongodb);
        app.startServer();

        // mongodb.close();
    }
});


