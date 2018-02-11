import * as assert from 'assert';
import 'mocha';
import { NotesManager } from '../src/NotesManager';

class Collection {

    myColl: any
    newValue: any

    constructor(collContent: any) {
        this.myColl = collContent;
    }

    findOne(q: any): Promise<any> {
        return Promise.resolve(this.myColl);
    }

    insert(value) {
        this.newValue = value;
    }

    update(query: any, value: any) {
        this.newValue = value;
    }

}

suite('NotesManager Tests', () => {

    test('test read note revision', () => {
        let db = { collection(name) { return new Collection({ notes: '2' }) } };
        let nm = new NotesManager(db);
        nm.getNotesRevision().then(r => assert.deepEqual(r, { notes: '2' }));
    });

    test('test new revision on undifined', async () => {
        let coll = new Collection(null);
        let nm = new NotesManager({ collection(name) { return coll } });
        await nm.increaseNoteRevision();
        assert.deepEqual(coll.newValue, { name: 'notes', revision: 0 })
    });

    test('test new revision on exisitng vlaue', async () => {
        let coll = new Collection({ name: 'notes', revision: 2 });
        let nm = new NotesManager({ collection(name) { return coll } });
        await nm.increaseNoteRevision();
        assert.deepEqual(coll.newValue, { name: 'notes', revision: 3 });
    });

})