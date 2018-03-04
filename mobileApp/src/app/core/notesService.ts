import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { Note } from './model';
import { Actions } from './store';

@Injectable()
export class NotesService {

  token: string;
  baseURL: string;

  constructor(private httpClient: HttpClient) { }

  middleware = store => next => action => {
    switch (action.type) {
      case Actions.LOGIN: return this.login(next, action);
    }
    return next(action);
  }

 login(next, action) {
    this.baseURL = action.pnoteUrl
    return this.loginOnServer(action.username, action.password).then(status => {
      if (status == 200) {
        return next({ type: Actions.LOGIN_SUCCESS })
      }
      else {
        return next({ type: Actions.LOGIN_FAILED })
      }
    }).catch(err => next({ type: Actions.LOGIN_FAILED, message: err }));
  }

  getNoteList(): Promise<Note[]> {
    return this.httpClient.get<Note[]>(this.baseURL + '/notes', { headers: this.createHeader() }).pipe(retry(3), catchError(this.handleError)).toPromise();
  }

  getNote(note: Note): Promise<Note> {
    console.log('Request for ' + note._id);
    return this.httpClient.get<Note>(this.baseURL + note._links.self.href, { headers: this.createHeader() }).pipe(retry(3), catchError(this.handleError)).toPromise();
  }

  getNoteById(id: any): Promise<Note> {
    console.log('Request for ' + id);
    return this.httpClient.get(this.baseURL + '/notes/' + id, { headers: this.createHeader() }).pipe(retry(3), catchError(this.handleError)).toPromise();
  }

  updateNote(note: Note): Promise<any> {
    console.log(this.baseURL + note._links.self.href);
    return this.httpClient.put(this.baseURL + note._links.self.href, note, { headers: this.createHeader(), observe: "response" }).toPromise();
  }

  addNote(note: Note): Promise<any> {
    return this.httpClient.post<any>(this.baseURL + '/notes', note, { headers: this.createHeader(), observe: "response" }).toPromise().then(r => {
      return r.body.insertedIds[0]
    }).catch(this.handleError);
  }

  remove(note: Note): Promise<any> {
    return this.httpClient.delete(this.baseURL + note._links.delete.href, { headers: this.createHeader() }).toPromise().catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for development purposes only
    return Promise.reject(error.message || error)
  }

  createHeader() {
    return {
      'Content-Type': 'application/json',
      'x-access-token': this.token
    }
  }

  loginOnServer(username: string, password: string): Promise<number> {
    let login = { userName: username, password: password };
    return this.httpClient.post<any>(this.baseURL + '/login', login, { observe: 'response' }).toPromise().then(response => {
      if (response.status == 200) {
        this.token = response.body.token;
      }
      return response.status;
    });
  }

}
