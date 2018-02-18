import { Note, NoteDiff } from './model';
import { Md5 } from 'ts-md5/dist/md5';

export class NotesManager {

    constructor(private mongodb) { }

    ObjectID = require('mongodb').ObjectID
    DiffMatch = require('diff-match-patch');
    df = new this.DiffMatch();

    getAllNotes(): Promise<Note[]> {
        return this.mongodb.collection('notes').find({}, { history: 0, content: 0 }).sort({ name: 1 }).toArray();
    }

    getNoteWithId(id: string): Promise<Note> {
        return this.mongodb.collection('notes').findOne({ _id: this.ObjectID(id) }, { history: 0 });
    }

    getNoteHistoryForId(id: string): Promise<Note> {
        return this.mongodb.collection('notes').findOne({ _id: this.ObjectID(id) }, { content: 0 });
    }

    store(note: Note): Promise<any> {
        if (!note.history) {
            note.history = [];
        }
        console.log("New with: " + note.content);
        this.updateNoteHistoryState(note, '');
        let result = this.mongodb.collection('notes').insertOne(note);
        this.increaseNoteRevision();
        return result;
    }

    async update(id: any, note: Note) {
        await this.getNoteHistoryForId(id).then(n => note.history = n.history);
        this.updateNoteHistoryState(note, this.computeOldContent(note));
        note._id = this.ObjectID(id);
        this.mongodb.collection('notes').update({ _id: this.ObjectID(id) }, note, { upsert: true });
        this.increaseNoteRevision();
    }

    computeOldContent(note: Note): string {
        let oldContent = ''
        note.history.forEach(diff => {
            oldContent = this.df.patch_apply(diff.diff, oldContent)[0];
        });
        return oldContent;
    }

    updateNoteHistoryState(note: Note, oldContent: string) {
        let patch = this.df.patch_make(oldContent, note.content);
        note.history.push(new NoteDiff(patch, new Date()));
        note.contentHashCode = Md5.hashStr(note.content) as string;
    }

    remove(id: any) {
        console.log('Remove note with id: ' + id);
        this.mongodb.collection('notes').deleteOne({ '_id': this.ObjectID(id) });
        this.increaseNoteRevision();
    }

    getNotesRevision(): Promise<any> {
        let result: Promise<any> = this.mongodb.collection('revision').findOne({ name: 'notes' });
        return result;
    }

    increaseNoteRevision(): any {
        this.getNotesRevision().then(r => {
            if (r) {
                this.mongodb.collection('revision').update({ name: 'notes' }, { name: 'notes', revision: r.revision + 1 }, { upsert: true });
            }
            else {
                this.mongodb.collection('revision').insert({ name: 'notes', revision: 0 });
            }
        });
    }

}