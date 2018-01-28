import * as vscode from 'vscode';
import { QuickPickItem, TreeDataProvider } from 'vscode';
import { Note, NoteDiff } from '../core/model';
import { NotesManager } from '../core/NotesManager';
import { configure } from 'vscode/lib/testrunner';


export class NotesProvider implements TreeDataProvider<Note | NoteDiff> {

    notesManager: NotesManager;
    noteEventEmitter: vscode.EventEmitter<Note | null> = new vscode.EventEmitter<Note | null>();
    onDidChangeTreeData: vscode.Event<Note> = this.noteEventEmitter.event;

    constructor(manager: NotesManager) {
        this.notesManager = manager;
    }

    getTreeItem(element: Note | NoteDiff): vscode.TreeItem | Thenable<vscode.TreeItem> {
        if (!element.note) {
            return new NoteDiffTreeItem(element as NoteDiff);
        }
        return new NoteTreeItem(element as Note);
    }

    getChildren(element?: Note): vscode.ProviderResult<Note[]> | vscode.ProviderResult<NoteDiff[]> {
        if (element) {
            return this.notesManager.getNoteHistory(element).then(
                h => {
                    h.forEach(e => {
                        e.parent = element;
                    })
                    element.history = h;
                    return h;
                }
            );
        }
        return this.notesManager.getNoteList()
    }

}

export class NoteTreeItem implements vscode.TreeItem {

    label: string;
    note: Note;
    //    iconPath?: string | vscode.Uri | { light: string | vscode.Uri; dark: string | vscode.Uri; };

    // iconPath: string = '../../resources/dark/document.svg';

    get command(): vscode.Command {
        return {
            command: 'pnote.openNote',
            title: 'Open Note',
            arguments: [this.note.name]
        }
    }

    get collapsibleState(): vscode.TreeItemCollapsibleState {
        if(this.note.showHistory) {
            return vscode.TreeItemCollapsibleState.Collapsed;
        }
        return vscode.TreeItemCollapsibleState.None;
    }
    //    contextValue?: string;

    constructor(note: Note) {
        if (note.remote) {
            this.label = note.name + "\t[R]";
            if (note.local) {
                this.label = note.name + "\t[RL]";
            }
        }
        else {
            this.label = note.name;
            if (note.local) {
                this.label = note.name + "\t[L]";
            }
        }
        this.note = note;
    }

}

export class NoteDiffTreeItem implements vscode.TreeItem {

    label: string;
    diff: NoteDiff;

    constructor(noteDiff: NoteDiff) {
        this.diff = noteDiff;
        this.label = noteDiff.creationDate.toLocaleString();
    }

    get command(): vscode.Command {
        return {
            command: 'pnote.openNoteHistory',
            title : 'Open history',
            arguments: [this.diff]
        }
    }
    
}