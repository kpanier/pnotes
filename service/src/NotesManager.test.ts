import * as assert from 'assert';
import 'mocha';
import { NotesManager } from '../src/NotesManager';
import { Note, NoteDiff } from './model';
import { getMongoDb } from './mongomock.test';

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

function createTestNote(): Note {
    let note = new Note();
    note.name = 'Foo';
    note.content = 'Some content.'
    return note;
}

suite('NotesManager tests', () => {

    suite('Revision tests', () => {

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

        test('test new revision on exisitng value', async () => {
            let coll = new Collection({ name: 'notes', revision: 2 });
            let nm = new NotesManager({ collection(name) { return coll } });
            await nm.increaseNoteRevision();
            assert.deepEqual(coll.newValue, { name: 'notes', revision: 3 });
        });

    })

    suite('CRUD tests', () => {

        let myDb;
        let notesManager: NotesManager;

        beforeEach(async () => {
            if (getMongoDb()) {
                myDb = getMongoDb();
                notesManager = new NotesManager(myDb);
                await getMongoDb().dropDatabase();
            }
        })

        suite('Read notes', () => {

            test('Get all notes', async () => {
                await myDb.collection('notes').insertOne(new Note());
                await myDb.collection('notes').insertOne(createTestNote());

                let result;
                await notesManager.getAllNotes().then(all => result = all);

                assert(result);
                assert.equal(2, result.length);
            });

            test('Get all note without history and content', (done) => {
                myDb.collection('notes').insertOne(createTestNote());

                notesManager.getAllNotes().then(all => {
                    assert.equal(all[0].name, 'Foo');
                    assert(!all[0].content);
                    done();
                });
            });

            test('Get note by id', (done) => {
                myDb.collection('notes').insertOne(createTestNote()).then(r => {
                    notesManager.getNoteWithId(r.insertedId).then(n => {
                        assert.equal('Foo', n.name);
                        assert.equal('Some content.', n.content);
                        done();
                    })
                });

            })

            test('Get note hitsory by id', (done) => {
                let note = createTestNote();
                note.history = [new NoteDiff(null, new Date()), new NoteDiff(null, new Date())];
                myDb.collection('notes').insertOne(note).then(r => {
                    notesManager.getNoteHistoryForId(r.insertedId).then(r => {
                        assert(r);
                        assert.equal(2, r.history.length);
                        assert(!r.content);
                        done();
                    });
                });
            })

        });

        suite('Store note', () => {

            test('Store and initialize note', (done) => {
                let note = createTestNote();

                notesManager.store(note).then(r => {
                    assert(r.result.ok);
                    assert(r.insertedId);
                    assert.equal(1, note.history.length);
                    assert(note.contentHashCode.length > 0);
                    done();
                });
            })

            test('Initialize history at store', (done) => {
                let note = createTestNote();
                delete note.history;

                notesManager.store(note).then(r => {
                    assert(r.result.ok);
                    assert.equal(1, note.history.length);
                    done();
                });
            })

            test('Update a note', async () => {
                let id;
                await myDb.collection('notes').insertOne(createTestNote()).then(r => id = r.insertedId);
                let note = createTestNote();

                note.content = 'My new content.';
                await notesManager.update(id, note);

                assert.equal(1, note.history.length);

                note.content = 'My Second content.';
                await notesManager.update(id, note);

                assert.equal(2, note.history.length);
            });
        })

        test('remove note', async () => {
            let id;
            await myDb.collection('notes').insertOne(createTestNote()).then(r => id = r.insertedId);

            await notesManager.remove(id);
            assert.equal(0, await myDb.collection('notes').count());

        });

    })

})