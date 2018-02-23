import * as assert from 'assert';

import * as TypeMoq from "typemoq";
import { NotesServiceClient } from '../core/NotesServiceClient';
import { HttpClient, HttpClientResponse } from 'typed-rest-client/HttpClient';
import { IncomingMessage } from 'http';

suite("NoteService client tests", () => {

    test("Test http request header", () => {
        let service = new NotesServiceClient();
        service.token = 'Test Token'

        let header = service.createHeaders();

        assert.equal(header['Content-Type'], 'application/json');
        assert.equal(header['x-access-token'], service.token);
    });

    test("Test get all notes", async () => {
        let service = new NotesServiceClient();
        service.token = 'Test Token'
        let httpClMock: TypeMoq.IMock<HttpClient> = TypeMoq.Mock.ofType(HttpClient);
        service.httpCl = httpClMock.object;
        let respMock = TypeMoq.Mock.ofType(HttpClientResponse);
        let msgMock = TypeMoq.Mock.ofType<IncomingMessage>();

        httpClMock.setup(mock => mock.get(TypeMoq.It.isAnyString(), service.createHeaders())).returns(() => Promise.resolve(respMock.object));
        respMock.setup(mock => mock.message).returns(() => msgMock.object);
        respMock.setup(mock => mock.readBody()).returns(() => Promise.resolve('[ { "name": "ToDo", "content": "Some content"}]'));
        let notes = await service.getNoteList().then(n => { return n });

        assert.equal(1, notes.length);
        assert.equal('ToDo', notes[0].name);
        assert.equal(true, notes[0].remote);
    });

});