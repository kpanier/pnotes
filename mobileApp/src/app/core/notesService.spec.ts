import { NotesService } from './notesService';
import { Actions } from './store';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { Note } from './model';


describe('Test notesService using rest backend', () => {

    function next(object) {
        return object;
    }

    describe('Login tests', () => {

        let action = {
            type: Actions.LOGIN,
            pnoteUrl: 'http://note.server'
        };

        function getLoginPostMock(resultState): HttpClient {
            return {
                post(url: string, object: any, options: {
                    headers?: HttpHeaders | {
                        [header: string]: string | string[];
                    };
                    observe: 'response';
                    params?: HttpParams | {
                        [param: string]: string | string[];
                    };
                    reportProgress?: boolean;
                    responseType?: 'json';
                    withCredentials?: boolean;
                }): Observable<Object> {
                    return Observable.of({ status: resultState, body: { token: '12343' } });
                }
            } as HttpClient;
        }

        it('Successfull login to backend', () => {
            let mock = getLoginPostMock(200);

            let service: NotesService = new NotesService(mock);

            service.login(next, action).then(result => {
                expect(result.type).toBe(Actions.LOGIN_SUCCESS)
                expect(service.token).toBe('12343');
            });
        });

        it('Login failed to backend', () => {
            let mock = getLoginPostMock(404);

            let service: NotesService = new NotesService(mock);

            service.login(next, action).then(result => {
                expect(result.type).toBe(Actions.LOGIN_FAILED)
                expect(service.token).toBeUndefined();
            });
        });
    })

    it('Load all notes', () => {
        let mock = {
            get(url: string, options?: {
                headers?: HttpHeaders | {
                    [header: string]: string | string[];
                };
                observe?: 'body';
                params?: HttpParams | {
                    [param: string]: string | string[];
                };
                reportProgress?: boolean;
                responseType?: 'json';
                withCredentials?: boolean;
            }) {
                return Observable.of([new Note()]);
            }
        } as HttpClient;
        let service: NotesService = new NotesService(mock);

        service.loadAllNotes(next).then(result => {
            expect(result.type).toBe(Actions.NOTES_LOADED)
            expect(result.payload).toBeDefined();
            expect(result.payload.length).toBe(1);
        })

    })

})