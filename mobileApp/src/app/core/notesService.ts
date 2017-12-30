import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Note } from './model';
import { Storage } from '@ionic/storage';

@Injectable()
export class NotesService {

  token: string;

  constructor(private http: Http, private storage: Storage) { }

  getNoteList(): Promise<Note[]> {
    return this.http.get('http://localhost:3000/notes', this.createHeader()).toPromise().then(response => {
      return response.json() as Note[]
    });
  }

  getNote(id: any): Promise<Note> {
    console.log('Request for ' + id);
    return this.http.get('http://localhost:3000/notes/' + id, this.createHeader()).toPromise().then(response => {
      return response.json() as Note;
    });
  }

  updateNote(note: Note): Promise<any> {
    console.log('http://localhost:3000/notes/' + note._id);
    return this.http.put('http://localhost:3000/notes/' + note._id, note, this.createHeader()).toPromise().catch(this.handleError);
  }

  addNote(note: Note): Promise<any> {
    return this.http.post('http://localhost:3000/notes/', note, this.createHeader()).toPromise().then(r => {
      return r.json().insertedIds[0]
    }).catch(this.handleError);
  }

  remove(note: Note): Promise<any> {
    return this.http.delete('http://localhost:3000/notes/' + note._id, this.createHeader()).toPromise().catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for development purposes only
    return Promise.reject(error.message || error)
  }

  createHeader(): RequestOptions {
    let headers: Headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('x-access-token', this.token);
    return new RequestOptions({ headers: headers });
  }

  login(username: string, password: string): Promise<number> {
    let login = { userName: username, password: password };
    return this.http.post('http://localhost:3000/login', login).toPromise().then(response => {
      if (response.status == 200) {
        this.token = response.json().token;
      }
      return response.status;
    });
  }

}
