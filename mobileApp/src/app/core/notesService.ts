import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Note } from './model';
import { Actions } from './store';

@Injectable()
export class NotesService {

  token: string;
  baseURL: string;

  constructor(private http: Http) { }

  middleware = store => next => action => {
    switch (action.type) {
      case Actions.LOGIN:
        this.baseURL = action.pnoteUrl
        this.login(action.username, action.password).then(status => {
          if (status = 200) {
            return next({ type: Actions.LOGIN_SUCCESS })
          }
          else {
            return next({ type: Actions.LOGIN_FAILED })
          }
        }).catch(err => next({ type: Actions.LOGIN_FAILED, message: err }));
        return next(action)
    }
    return next(action);
  }

  getNoteList(): Promise<Note[]> {
    return this.http.get(this.baseURL + '/notes', this.createHeader()).toPromise().then(response => {
      return response.json() as Note[]
    });
  }

  getNote(note: Note): Promise<Note> {
    console.log('Request for ' + note._id);
    return this.http.get(this.baseURL + note._links.self.href, this.createHeader()).toPromise().then(response => {
      return response.json() as Note;
    });
  }

  getNoteById(id: any): Promise<Note> {
    console.log('Request for ' + id);
    return this.http.get(this.baseURL + '/notes/' + id, this.createHeader()).toPromise().then(response => {
      return response.json() as Note;
    });
  }

  updateNote(note: Note): Promise<any> {
    console.log(this.baseURL + note._links.self.href);
    return this.http.put(this.baseURL + note._links.self.href, note, this.createHeader()).toPromise().catch(this.handleError);
  }

  addNote(note: Note): Promise<any> {
    return this.http.post(this.baseURL + '/notes', note, this.createHeader()).toPromise().then(r => {
      return r.json().insertedIds[0]
    }).catch(this.handleError);
  }

  remove(note: Note): Promise<any> {
    return this.http.delete(this.baseURL + note._links.delete.href, this.createHeader()).toPromise().catch(this.handleError);
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
    return this.http.post(this.baseURL + '/login', login).toPromise().then(response => {
      if (response.status == 200) {
        this.token = response.json().token;
      }
      return response.status;
    });
  }

}
