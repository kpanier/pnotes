import { Note } from './model';
import * as httpm from 'typed-rest-client/HttpClient';
import { request } from 'http';
import * as vscode from 'vscode';
import { read } from 'fs';
import { InputBoxOptions, window } from 'vscode';

export class NotesServiceClient {

    httpCl: httpm.HttpClient = new httpm.HttpClient('pnote-vscode-agent');
    token: string;

    createHeaders(): any {
        return {
            'Content-Type': 'application/json',
            'x-access-token': this.token
        }
    };

    async getNoteList(): Promise<Note[]> {
        await this.checkToken();
        return await this.httpCl.get(this.getNotesBaseURL(), this.createHeaders()).then(async response => {
            if (response.message.statusCode == 403) {
                await this.reciveNewToken();
                return this.getNoteList();
            }
            else {
                let notes: Note[] = JSON.parse(await response.readBody()) as Note[];
                notes.forEach(n => n.remote = true);
                return notes;
            }
        }).catch(this.handleError);
    }

    async getNote(id: any): Promise<Note> {
        await this.checkToken();
        return await this.httpCl.get(this.getNotesBaseURL() + "/" + id, this.createHeaders()).then(async response => {
            if (response.message.statusCode == 403) {
                await this.reciveNewToken();
                return this.getNote(id);
            }
            else {
                return JSON.parse(await response.readBody()) as Note;
            }
        }).catch(this.handleError);
    }

    async updateNote(note: Note) {
        await this.checkToken();
        this.httpCl.put(this.getNotesBaseURL() + "/" + note._id, JSON.stringify(note), this.createHeaders()).then(async response => {
            if (response.message.statusCode == 403) {
                await this.reciveNewToken();
                this.updateNote(note);
            }
        }).catch(this.handleError);
    }

    async addNote(note: Note) {
        await this.checkToken();
        this.httpCl.post(this.getNotesBaseURL(), JSON.stringify(note), this.createHeaders()).then(async response => {
            if (response.message.statusCode == 403) {
                await this.reciveNewToken();
                this.addNote(note);
            }
        }).catch(this.handleError);
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

    async checkToken() {
        if (!this.token) {
            await this.reciveNewToken();
        }
    }

    async reciveNewToken() {
        let userName = vscode.workspace.getConfiguration('pnote').get('username');
        if (!userName) {
            await window.showInputBox({ prompt: 'Username for personal notes:' }).then(s => userName = s);
        }
        let password;
        await window.showInputBox({ prompt: 'Password for personal notes:' }).then(s => password = s);
        let login = { userName: userName, password: password };
        await this.httpCl.post(this.getBaseUrl() + "/login", JSON.stringify(login), { 'Content-Type': 'application/json' }).then(async response =>
            this.token = JSON.parse(await response.readBody()).token
        );
        console.log("token: " + this.token);
    }

}
