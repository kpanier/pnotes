import { NotesManager } from './NotesManager';
import { UserManager } from './UserManager';
import express = require('express');
import { NotesEndPointBuilder } from './notesEndPoint';
import { request } from 'http';
import { getSecret } from './Util';
import jwt = require('jsonwebtoken');

export class APIServer {

    private server = express();
    mongodb: any;

    constructor(mongodb) {
        this.mongodb = mongodb;
        let bodyParser = require('body-parser');
        this.server.use(bodyParser.urlencoded({
            extended: false
        }));
        this.server.use(bodyParser.json());
        this.server.use(this.getCorsFilter());
    }

    getCorsFilter(): any {
        return (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "http://localhost:8100");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
            return next();
        };
    }

    startServer() {
        this.createHelloMessageEndpoint();
        this.server.use('/notes', this.createNoteManagementEndpoints(new NotesManager(this.mongodb)));
        this.createAthenticationEndPoint();
        this.server.listen(3000);
    }

    createNoteManagementEndpoints(notesManager: NotesManager): any {
        let builder: NotesEndPointBuilder = new NotesEndPointBuilder();
        return builder.createNotesEndpoint(notesManager);
    }

    createHelloMessageEndpoint(): any {
        this.server.get('/', (request, response) => {
            response.send('Notes server up and running.');
        });
    }

    createAthenticationEndPoint(): any {
        let userManager = new UserManager(this.mongodb);
        this.server.post('/login', (request, response) => {
            userManager.getUserByUserName(request.body.userName).then(user => {
                if (user) {
                    if (user.password == request.body.password) {
                        var token = jwt.sign({
                            state: 'good',
                            data: user.userName
                        }, getSecret(), { expiresIn: '12h' });
                        response.status(200).send({ token: token });
                    }
                    else {
                        response.status(403).send({ message: 'Login failed.' });
                    }
                }
                else {
                    response.status(403).send({ message: 'Login failure.' });
                }
            })
        });
    }

}