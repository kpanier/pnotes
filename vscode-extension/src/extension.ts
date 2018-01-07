'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NotesProvider } from './noteslist/notestree';
import { registerCommands } from './noteslist/commands';
import { NotesManager } from './core/NotesManager';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let manager = new NotesManager(); 
    let provider = new NotesProvider(manager);
    manager.eventListener = provider.noteEventEmitter;
    vscode.window.registerTreeDataProvider('pnote', provider);
    registerCommands(context, manager);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

