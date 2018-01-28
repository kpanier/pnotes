import { Note, NoteDiff } from './model';
import * as httpm from 'typed-rest-client/HttpClient';
import * as ifm from 'typed-rest-client/Interfaces';
import { request } from 'http';
import * as vscode from 'vscode';
import { read } from 'fs';
import { InputBoxOptions, window, Progress } from 'vscode';

export class NotesServiceClient {

    httpCl: httpm.HttpClient;
    token: string;

    constructor() {
        if (vscode.workspace.getConfiguration('pnote').get('proxyurl')) {
            let proxyCfg: ifm.IProxyConfiguration = {
                proxyUrl: vscode.workspace.getConfiguration('pnote').get('proxyurl'),
                proxyUsername: vscode.workspace.getConfiguration('pnote').get('proxyusername'),
                proxyPassword: vscode.workspace.getConfiguration('pnote').get('proxypassword')
            }
            let options: ifm.IRequestOptions = { proxy: proxyCfg, ignoreSslError: true }
            this.httpCl = new httpm.HttpClient('pnote-vscode-agent', [], options)
        }
        else {
            this.httpCl = new httpm.HttpClient('pnote-vscode-agent');
        }
    }

    createHeaders(): any {
        return {
            'Content-Type': 'application/json',
            'x-access-token': this.token
        }
    };

    async getNoteList(): Promise<Note[]> {
        return window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Load all notes' }, async p => {
            await this.checkToken(p);
            p.report({ message: 'Loading notes from remote' });
            return await this.httpCl.get(this.getNotesBaseURL(), this.createHeaders()).then(async response => {
                if (response.message.statusCode == 403) {
                    await this.reciveNewToken();
                    return this.getNoteList();
                }
                else {
                    p.report({ message: 'Setup local notes store' });
                    let notes: Note[] = JSON.parse(await response.readBody()) as Note[];
                    notes.forEach(n => n.remote = true);
                    return notes;
                }
            }).catch(this.handleError);
        });
    }

    async getNote(id: any): Promise<Note> {
        return window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Load note' }, async p => {
            await this.checkToken(p);
            p.report({ message: 'Loading note from remote' });
            return this.httpCl.get(this.getNotesBaseURL() + "/" + id, this.createHeaders()).then(async response => {
                if (response.message.statusCode == 403) {
                    await this.reciveNewToken();
                    return this.getNote(id);
                }
                else {
                    return JSON.parse(await response.readBody()) as Note;
                }
            })
        });
    }

    async getNoteHistory(id: any): Promise<NoteDiff[]> {
        return window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Load note' }, async p => {
            await this.checkToken(p);
            p.report({ message: 'Loading note history from remote' });
            return await this.httpCl.get(this.getNotesBaseURL() + "/" + id + "/history", this.createHeaders()).then(async r => {
                if (r.message.statusCode == 403) {
                    await this.reciveNewToken();
                    return this.getNoteHistory(id);
                }
                else {
                    return JSON.parse(await r.readBody()) as NoteDiff[];
                }
            });
        });
    }


    async updateNote(note: Note) {
        window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Update note' }, async p => {
            await this.checkToken(p);
            p.report({ message: 'Update note on remote' });
            this.httpCl.put(this.getNotesBaseURL() + "/" + note._id, JSON.stringify(note), this.createHeaders()).then(async response => {
                if (response.message.statusCode == 403) {
                    await this.reciveNewToken();
                    this.updateNote(note);
                }
            }).catch(this.handleError)
        });
    }

    async addNote(note: Note) {
        window.withProgress({ location: vscode.ProgressLocation.Window, title: 'Update note' }, async p => {
            await this.checkToken(p);
            p.report({ message: 'Add note to remote' });
            this.httpCl.post(this.getNotesBaseURL(), JSON.stringify(note), this.createHeaders()).then(async response => {
                if (response.message.statusCode == 403) {
                    await this.reciveNewToken();
                    this.addNote(note);
                }
            }).catch(this.handleError);
        });
    }

    // remove(note: Note) {
    //     this.http.delete(this.getBaseURL() + note._id).toPromise().catch(this.handleError);
    // }

    private getNotesBaseURL(): string {
        return this.getBaseUrl() + '/notes';
    }

    private getBaseUrl(): string {
        let result: string = vscode.workspace.getConfiguration('pnote').get('baseurl');
        return result;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for development purposes only
        return Promise.reject(error.message || error)
    }

    async checkToken(p?: Progress<any>) {
        if (p) {
            p.report({ message: 'Check credentials' });
        }
        if (!this.token) {
            if (p) {
                p.report({ message: 'Renew credentials' });
            }
            await this.reciveNewToken();
        }
    }

    async reciveNewToken() {
        let userName = vscode.workspace.getConfiguration('pnote').get('username');
        this.httpCl
        if (!userName) {
            await window.showInputBox({ prompt: 'Username for personal notes:' }).then(s => userName = s);
        }
        let password;
        await window.showInputBox({ prompt: 'Password for personal notes:', password: true }).then(s => password = s);
        let login = { userName: userName, password: password };
        console.log("send login");
        await this.httpCl.post(this.getBaseUrl() + "/login", JSON.stringify(login), { 'Content-Type': 'application/json' }).then(async response =>
            this.token = JSON.parse(await response.readBody()).token
        );
        console.log("token: " + this.token);
    }

}
