import * as assert from 'assert';
import 'mocha';
import { NotesManager } from '../src/NotesManager';

class NoteRevistionMongoDB {

    rev: any;
    newValue: any;
    coll = new Collection(this);

    constructor(revision: any) {
        this.rev = revision;
    }

    collection(name): any {
        return this.coll;
    }

}

class Collection {

    myDb: any

    constructor(db: any) {
        this.myDb = db;
    }

    findOne(q: any): Promise<any> {
        return Promise.resolve(this.myDb.rev);
    }

    insert(value) {
        this.myDb.newValue = value;
    }

    update(query: any, value: any) {
        this.myDb.newValue = value;
    }

}

suite('NotesManager Tests', () => {

    test('test read note revision', () => {
        let nm = new NotesManager(new NoteRevistionMongoDB({ notes: '2' }));
        nm.getNotesRevision().then(r => assert.deepEqual(r, { notes: '2' }));

    });

    test('test new revision on undifined', async () => {
        let db = new NoteRevistionMongoDB(null);
        let nm = new NotesManager(db);
        await nm.increaseNoteRevision();
        assert.deepEqual(db.newValue, { name: 'notes', revision: 0 })
    });

    test('test new revision on exisitng vlaue', async () => {
        let db = new NoteRevistionMongoDB({ name: 'notes', revision: 2 });
        let nm = new NotesManager(db);
        await nm.increaseNoteRevision();
        assert.deepEqual(db.newValue, { name: 'notes', revision: 3 });
    });

})