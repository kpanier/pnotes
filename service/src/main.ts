import { APIServer } from './APIServer';
import MongoClient = require('mongodb');

MongoClient.connect('mongodb://dbuser:notes-enc@localhost:27037/notes-db', function (err, mongodb) {
    if (err) {
        console.log(err);
    }
    else {
        let app: APIServer = new APIServer(mongodb);
        app.startServer();

        // mongodb.close();
    }
});


