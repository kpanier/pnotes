import { HomePage } from './home';
import { NavController } from 'ionic-angular';
import { NgRedux } from '@angular-redux/store';
import { INotesState, Actions } from '../../app/core/store';
import { Page } from 'ionic-angular/navigation/nav-util';
describe('Test home page', () => {

    describe('Modul test for login', () => {

        it('Handle successfully login', () => {
            let pageSet = false;
            let nav = {

                setRoot(page: Page) {
                    pageSet = true
                }
            }
            let page = new HomePage(nav as NavController, {} as NgRedux<INotesState>);

            page.handleLoginState({ login: true, loginSuccess: true })

            expect(pageSet).toBeTruthy();
            expect(page.message).toBeUndefined();
        })

        it('Handle login failed', () => {
            let page = new HomePage({} as NavController, {} as NgRedux<INotesState>);

            page.handleLoginState({ login: true, loginSuccess: false })

            expect(page.message).toBe('Login failed.');
        })

        it('Test redux dispatches a login event.', () => {
            let resultAction;
            let page = new HomePage({} as NavController, {
                dispatch(action) {
                    resultAction = action;
                }
            } as NgRedux<INotesState>);
            page.pnoteUrl = 'foo';

            page.login()

            expect(resultAction).toBeDefined();
            expect(resultAction.type).toBe(Actions.LOGIN);
            expect(resultAction.pnoteUrl).toBe('foo');
        })

    })

})