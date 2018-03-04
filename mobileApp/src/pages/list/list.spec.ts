import { ListPage } from './list';
import { NavController } from 'ionic-angular';
import { NgRedux } from '@angular-redux/store';
import { INotesState, Actions } from '../../app/core/store';
import { Note } from '../../app/core/model';

describe('Test notes list', () => {

    it('Bind List view to redux', () => {
        let loadAction;
        let listener;
        let reduxMock = {
            dispatch(action) {
                loadAction = action;
            },
            subscribe(l) {
                listener = l;
            }
        } as NgRedux<INotesState>;
        let listPage = new ListPage({} as NavController, reduxMock);

        listPage.ionViewWillEnter()

        expect(loadAction.type).toBe(Actions.LOAD_NOTES);
        expect(listener).toBeDefined();
    })

    it('Reload view items from store', () => {
        let note = new Note();
        note.name = 'ToDo'
        let reduxMock = {
            getState() {
                return {
                    notes: [note]
                } as INotesState
            }
        } as NgRedux<INotesState>;
        let listPage = new ListPage({} as NavController, reduxMock);

        listPage.reloadNotesFromStore()

        expect(listPage.items).toBeDefined();
        expect(listPage.items[0].title).toBe('ToDo');
        expect(listPage.items[0].note).toBeDefined();
    })

})