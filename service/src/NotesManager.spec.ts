import { NotesManager } from "./NotesManager";
import { isUndefined } from "util";

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

describe('NotesManager', () => {

    it('test read note revision', () => {
        let nm = new NotesManager(new NoteRevistionMongoDB({ notes: '2' }));
        expect(nm).toBeTruthy();
        nm.getNotesRevision().then(r => expect(r).toEqual({ notes: '2' }));
    });

    it('test new revision on undifined', async () => {
        let db = new NoteRevistionMongoDB(null);
        let nm = new NotesManager(db);
        expect(nm).toBeTruthy();
        await nm.increaseNoteRevision();
        expect(db.newValue).toEqual({ name: 'notes', revision: 0 });
    });

    it('test new revision on exisitng vlaue', async () => {
        let db = new NoteRevistionMongoDB({ name: 'notes', revision: 2 });
        let nm = new NotesManager(db);
        expect(nm).toBeTruthy();
        await nm.increaseNoteRevision();
        expect(db.newValue).toEqual({ name: 'notes', revision: 3 });
    });

});