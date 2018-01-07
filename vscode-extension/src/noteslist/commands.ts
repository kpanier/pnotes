import * as vscode from 'vscode';
import { QuickPickItem, window } from 'vscode';
import { Note } from '../core/model';
import { NotesManager } from '../core/NotesManager';

export function registerCommands(context: vscode.ExtensionContext, manager: NotesManager) {

    context.subscriptions.push(vscode.commands.registerCommand('pnote.openNote', (id: any) => {
        if (id) {
            openNote(id, manager);
        }
        else {
            manager.getNoteList().then(notes => {
                let pick: Thenable<NotePickItem> = vscode.window.showQuickPick(notes.map(n => new NotePickItem(n)), {});
                pick.then(sel => {
                    openNote(sel.label, manager);
                });
            });
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('pnote.addNote',
        note => {
            let newName = vscode.window.showInputBox();
            newName.then(n => {
                manager.createNote(n).then(path => {
                    let uri = vscode.Uri.file(path);
                    vscode.workspace.openTextDocument(uri).then(textDocument => {
                        vscode.window.showTextDocument(textDocument, 1, false)
                    });
                });
            });
        }));
    context.subscriptions.push(vscode.commands.registerCommand('pnote.deleteNote',
        note => { vscode.window.showInformationMessage("Delete") }
    ));
    context.subscriptions.push(vscode.commands.registerCommand('pnote.syncNote',
        () => { 
            manager.getNoteListRefreshed();
         }
    ));
}

function openNote(id: any, manager: NotesManager) {
    manager.getNotePath(id).then(path => {
        let uri = vscode.Uri.file(path);
        vscode.workspace.openTextDocument(uri).then(textDocument => {
            vscode.window.showTextDocument(textDocument, 1, false)
        });
    });
}


class NotePickItem implements QuickPickItem {

    label: string;
    description: string;
    noteId: any;

    constructor(note: Note) {
        this.label = note.name;
        this.description = note.content;
        this.noteId = note._id;
    }

}
