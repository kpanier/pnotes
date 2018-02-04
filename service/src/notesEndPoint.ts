import express = require('express');
import { NotesManager } from './NotesManager';
import { getSecret } from './Util';
import { request } from 'http';
import jwt = require('jsonwebtoken');

export class NotesEndPointBuilder {

    hal = require('hal');

    createNotesEndpoint(notesManager: NotesManager): any {
        let notesAPI = express.Router();
        notesAPI.use(this.createSecurityFilter());
        notesAPI.get('/revision/', this.createGetRevisionEndpoint(notesManager));
        notesAPI.get('/', this.createGetNotesEndpoint(notesManager));
        notesAPI.get('/:id', this.createGetNotesDetailEndpoint(notesManager));
        notesAPI.get('/:id/history', this.createGetNotesHistoryEndpoint(notesManager));
        notesAPI.post('/', this.createPostNoteEndpoint(notesManager));
        notesAPI.put('/:id', this.createPutNoteEndpoint(notesManager));
        notesAPI.delete('/:id', this.createDeleteNoteEndpoint(notesManager));
        return notesAPI;
    }

    createDeleteNoteEndpoint(notesManager: NotesManager): any {
        return (request, response) => {
            console.log('Delete  ' + request.params.id);
            notesManager.remove(request.params.id);
            response.status(200).send();
        };
    }

    createPutNoteEndpoint(notesManager: NotesManager): any {
        return (request, response) => {
            console.log('Store  ' + request.params.id);
            let note = request.body;
            delete note._links;
            notesManager.update(request.params.id, note);
            response.status(200).send();
        };
    }

    createPostNoteEndpoint(notesManager: NotesManager): any {
        return (request, response) => {
            notesManager.store(request.body).then(r => response.status(200).send(r));
        };
    }

    createGetNotesDetailEndpoint(notesManager: NotesManager): any {
        return (request, response) => {
            notesManager.getNoteWithId(request.params.id).then(r => {
                let resource = new this.hal.Resource(r, request.originalUrl);
                response.status(200).send(resource);
            });
        }
    }

    createGetNotesHistoryEndpoint(notesManager: NotesManager): any {
        return (request, response) => {
            notesManager.getNoteHistoryForId(request.params.id).then(r => response.status(200).send(r.history));
        }
    }

    createGetNotesEndpoint(notesManager: NotesManager): any {
        return (request, response) => {
            let result: any[] = [];
            notesManager.getAllNotes().then(r => {
                r.forEach(n => {
                    let resource = new this.hal.Resource(n, request.originalUrl + '/' + n._id);
                    resource.link('delete', request.originalUrl + '/' + n._id)
                    result.push(resource);
                })
                response.status(200).send(result);
            });
        }
    }

    createGetRevisionEndpoint(notesManager: NotesManager): any {
        return (request, response) => {
            notesManager.getNotesRevision().then(r => {
                console.log('Revision: ' + r);
                if (r) {
                    response.status(200).send(r)
                }
                else {
                    response.status(200).send({ name: 'notes', revision: 0 });
                }
            });
        }
    }

    createSecurityFilter(): any {
        return (req, res, next) => {
            if (req.method == 'OPTIONS') {
                console.log('OPTIONS allowed');
                return next();
            }
            var token = req.headers['x-access-token'];
            if (token) {
                return jwt.verify(token, getSecret(), (err, decoded) => {
                    if (decoded && decoded.state == 'good') {
                        return next();
                    } else {
                        res.status(403).send({ message: 'invalid token' });
                    }
                });
            }
            else {
                return res.status(403).send({
                    success: false,
                    message: 'No token provided.'
                });
            }
        };
    }

}