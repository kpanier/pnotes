import * as vscode from 'vscode';
import { QuickPickItem, TreeDataProvider } from 'vscode';
import { Note } from '../core/model';
import { NotesManager } from '../core/NotesManager';
import { configure } from 'vscode/lib/testrunner';


export class NotesProvider implements TreeDataProvider<Note> {

    notesManager: NotesManager;
    noteEventEmitter: vscode.EventEmitter<Note | null> = new vscode.EventEmitter<Note | null>();
    onDidChangeTreeData: vscode.Event<Note> = this.noteEventEmitter.event;

    constructor(manager: NotesManager) {
        this.notesManager = manager;
    }

    getTreeItem(element: Note): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return new NoteTreeItem(element);
    }

    getChildren(element?: Note): vscode.ProviderResult<Note[]> {
        return this.notesManager.getNoteList()
    }

}

export class NoteTreeItem implements vscode.TreeItem {

    label: string;
    note: Note;
    //    iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; };
    get command(): vscode.Command {
        return {
            command: 'pnote.openNote',
            title: '',
            arguments: [this.note.name]
        }
    }
    //    collapsibleState?: vscode.TreeItemCollapsibleState;
    //    contextValue?: string;

    constructor(note: Note) {
        if (note.remote) {
            this.label = note.name + "\t[R]";
            if(note.local){
                this.label = note.name + "\t[RL]";
            }
        }
        else {
            this.label = note.name;
            if(note.local){
                this.label = note.name + "\t[L]";
            }
        }
        this.note = note;
    }

}
