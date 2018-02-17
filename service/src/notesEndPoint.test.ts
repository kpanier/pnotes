import { NotesEndPointBuilder } from './notesEndPoint';
import * as assert from 'assert';
import { getSecret } from './Util';
import { NotesManager } from './NotesManager';
import * as TypeMoq from 'typemoq';
import jwt = require('jsonwebtoken');
import { Note, NoteDiff } from './model';


suite('NotesEndPointBuilder Security Filter Tests', () => {

    let builder = new NotesEndPointBuilder();
    let filter = builder.createSecurityFilter();
    let status;

    test('Bypass for options in Security Filter', () => {
        assert(filter);
        let next = false;
        filter({ method: 'OPTIONS' }, {}, () => { next = true });
        assert(next);
    })

    test('Security Filter answers 403 at non access token', () => {
        let response;
        filter({ headers: [] }, {
            status(num) {
                status = num;
                return { send(message) { response = message.message } }
            }
        }, () => { });
        assert.equal(status, 403);
        assert.equal(response, 'No token provided.')
    })

    test('Security Filter asnwers 403 with invalid access token', () => {
        let response;
        filter({ headers: { 'x-access-token': 'Foo' } }, {
            status(num) {
                status = num;
                return { send(message) { response = message.message } }
            }
        }, () => { });
        assert.equal(status, 403);
        assert.equal(response, 'invalid token')
    })

    test('Accepting correct JWT', () => {
        let next = false;
        let token = jwt.sign({ state: 'good', }, getSecret(), { expiresIn: '5m' });
        filter({ headers: { 'x-access-token': token } }, {}, () => { next = true });
        assert(next);
    })

})

suite('NotesEndPointBuilder endpoint tests', () => {

    let builder = new NotesEndPointBuilder();
    let responseCode;
    let nm: TypeMoq.IMock<NotesManager> = TypeMoq.Mock.ofType(NotesManager);

    test('can create endpoint', () => {
        let ep = builder.createNotesEndpoint(null);
        assert(ep);
    });

    test('delete endpoint', () => {
        nm.setup(mock => { mock.remove('11') })
        let ep = builder.createDeleteNoteEndpoint(nm.object);

        ep({ params: { id: '11' } }, { status(code) { responseCode = code; return { send() { } } } });

        assert.equal(200, responseCode);
    });

    test('put endpoint', () => {
        nm.setup(mock => { mock.update('11', TypeMoq.It.isAnyObject(Note)) });
        let ep = builder.createPutNoteEndpoint(nm.object);
        let note = new Note();
        note['_links'] = 'foo';
        assert(note['_links']);

        ep({ params: { id: '11' }, body: note }, { status(code) { responseCode = code; return { send() { } } } });

        assert(!note['_links']);
        assert.equal(200, responseCode);
    });

    test('post endpoint', async () => {
        nm.setup(mock => { mock.store(TypeMoq.It.isAnyObject(Note)) }).returns(() => Promise.resolve(new Note()));
        let ep = builder.createPostNoteEndpoint(nm.object);
        let result;

        await ep({ params: { id: 11 }, body: new Note() }, { status(code) { responseCode = code; return { send(n) { result = n; } } } });

        assert.equal(200, responseCode);
        assert(result);
    });

    test('get note details endpoint', async () => {
        let note = new Note();
        note.name = 'Foo';
        let response;
        nm.setup(mock => { mock.getNoteWithId('11') }).returns(() => Promise.resolve(note));
        let ep = builder.createGetNotesDetailEndpoint(nm.object);

        await ep({ params: { id: '11' }, originalUrl: 'http://notes.io/notes/11' }, { status(code) { responseCode = code; return { send(resp) { response = resp; } } } });

        assert.equal(200, responseCode);
        assert(response);
        assert(response.history);
        assert(response._links);
        assert.equal('Foo', response.name);
        assert.equal('http://notes.io/notes/11', response._links['self'].href);
    })

    test('note history endpoint', async () => {
        let response;
        let note = new Note();
        note.history = [new NoteDiff(null, new Date()), new NoteDiff(null, new Date())];
        nm.setup(mock => { mock.getNoteHistoryForId('11') }).returns(() => Promise.resolve(note));
        let ep = builder.createGetNotesHistoryEndpoint(nm.object);

        await ep({ params: { id: '11' } }, { status(code) { responseCode = code; return { send(resp) { response = resp; } } } })

        assert.equal(200, responseCode);
        assert(response);
        assert.equal(2, response.length)
    })

    test('all notes endpoint', async () => {
        let response;
        let note1 = new Note();
        note1.name = 'Foo';
        let note2 = new Note();
        note2.name = 'Bar';
        nm.setup(mock => { mock.getAllNotes() }).returns(() => Promise.resolve([note1, note2]));
        let ep = builder.createGetNotesEndpoint(nm.object);

        await ep({}, { status(code) { responseCode = code; return { send(resp) { response = resp; } } } });
        assert.equal(200, responseCode);
        assert.equal(2, response.length);
        assert.equal('Foo', response[0].name);
        assert(response[0]._links['self']);
        assert(response[0]._links['delete']);
        assert.equal('Bar', response[1].name);
    })

})