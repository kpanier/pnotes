import { NotesServiceClient } from './NotesServiceClient';
import { Note, NoteDiff } from './model';
import { Md5 } from 'ts-md5/dist/md5';
import { configure } from 'vscode/lib/testrunner';
import * as vscode from 'vscode';

export class NotesManager {

    service: NotesServiceClient;
    notes: Map<string, Note>;
    eventListener: vscode.EventEmitter<Note>;

    fs = require('fs');
    notesHome = process.env['HOME'] + '/.enc-notes/';
    noteIndex = this.notesHome + 'note.index';

    constructor() {
        this.service = new NotesServiceClient();
        this.startNoteUploadWatcher();
    }

    getNoteList(): Promise<Note[]> {
        if (this.notes) {
            return Promise.resolve(Array.from(this.notes.values()));
        }
        else {
            return this.getNoteListRefreshed();
        }
    }

    getNoteListRefreshed(): Promise<Note[]> {
        this.notes = new Map();
        return new Promise(async (resolve, reject) => {
            await this.fs.readdir(this.notesHome, async (err, files) => {
                await files.forEach(file => {
                    if (file.endsWith('.md')) {
                        let noteName: string = file.substring(0, file.length - 3);
                        let note: Note = this.selectOrRegisterNote(noteName, () => new Note());
                        note.local = true;
                        note.name = noteName;
                        note.localFilePath = this.notesHome + file;
                    }
                });
            });
            await this.service.getNoteList().then(async rNotes => {
                await rNotes.forEach(n => {
                    let note: Note = this.selectOrRegisterNote(n.name, () => n);
                    note.remote = true;
                    note._id = n._id;
                    note.contentHashCode = n.contentHashCode;
                    note.history = n.history;
                });
                this.fs.writeFile(this.noteIndex, JSON.stringify(Array.from(this.notes.values())), (error) => { if (error) { console.log(error) } });
            }).catch((error) => console.log("Unable to connect to remote server: " + error));
            this.eventListener.fire();
            resolve(Array.from(this.notes.values()));
        });
    }

    selectOrRegisterNote(name: string, noteCreator): Note {
        let note: Note;
        if (this.notes.has(name)) {
            note = this.notes.get(name);
        }
        else {
            note = noteCreator();
            this.notes.set(name, note);
        }
        return note;
    }

    getNote(id: any): Promise<Note> {
        return this.service.getNote(id);
    }

    async getNoteHistory(note: Note): Promise<NoteDiff[]> {
        return await this.service.getNoteHistory(note._id);
    }

    getNotePath(name: string): Promise<string> {
        if (!this.notes.get(name).local || !this.isLocalNoteUpToDate(name)) {
            return this.getNote(this.notes.get(name)._id).then(
                async n => {
                    n.local = true;
                    n.remote = true;
                    n.localFilePath = this.notesHome + name + '.md';;
                    this.notes.set(name, n);
                    this.eventListener.fire();
                    return this.writeNote(n.name, n.content);
                }
            );
        }
        return Promise.resolve(this.notes.get(name).localFilePath);
    }

    isLocalNoteUpToDate(name: string): boolean {
        return this.notes.get(name).contentHashCode == this.hashCodeOf(this.notes.get(name).localFilePath);
    }

    async createNote(name: string): Promise<string> {
        let n = new Note();
        n.name = name;
        n.content = '';
        await this.service.addNote(n);
        return this.writeNote(name, '');
    }

    async writeNote(name: string, content: string): Promise<string> {
        let path = this.notesHome + name + '.md';
        await this.fs.writeFile(path, content, (err) => {
            if (err) {
                console.log(err);
            }
        });
        this.eventListener.fire();
        return Promise.resolve(path);
    }

    startNoteUploadWatcher() {
        let processingFiles: string[] = [];
        this.createNotesHome();
        this.fs.watch(this.notesHome, (event, filename: string) => {
            if (filename.endsWith('.md') && event == 'change' && processingFiles.indexOf(filename) == -1) {
                let noteIndex = this.readNoteIndex();
                processingFiles.push(filename);
                let newContent = this.fs.readFileSync(this.notesHome + filename, 'UTF-8');
                let noteName = filename.substring(0, filename.lastIndexOf('.'));
                if (vscode.window.state.focused && noteIndex.get(noteName) && Md5.hashStr(newContent) != noteIndex.get(noteName).contentHashCode) {
                    console.log('Real file change detected for ' + filename);
                    let note = this.service.getNote(noteIndex.get(noteName)._id);
                    note.then(async n => {
                        n.content = newContent;
                        await this.service.updateNote(n);
                        console.log('Note updated on backend ' + n.name);
                        this.eventListener.fire();
                    });
                }
                processingFiles.splice(processingFiles.indexOf(filename), 1);
            }
        });

    }

    private async createNotesHome() {
        await this.fs.access(this.notesHome, (err) => {
            if (err) {
                this.fs.mkdir(this.notesHome, (err) => { if (err) { console.log(err) } });
            }
        });
    }

    private hashCodeOf(filename: string): any {
        let newContent = this.fs.readFileSync(filename, 'UTF-8');
        return Md5.hashStr(newContent);
    }

    readNoteIndex(): Map<string, Note> {
        let fileContent = this.fs.readFileSync(this.noteIndex, 'UTF-8');
        let notes: Note[] = JSON.parse(fileContent);
        let result = new Map();
        notes.forEach(n => {
            result.set(n.name, n);
        });
        return result;
    }
}


