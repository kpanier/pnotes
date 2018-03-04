import { rootReducer, INIT_STATE, Actions, ILogin } from './store';
import { Note } from './model';
describe('Store reducer tests',() => {

    it('Return unmodified state on unknown action',() => {
        let state = INIT_STATE;
        state.username = 'username'

        let newState = rootReducer(INIT_STATE, {type: 'UNKNOWN_ACTION'});

        expect(state).toBe(newState);
    })

    it('Consume last session loaded', () =>{
        let action = {
            type: Actions.LAST_SESSION_LOADED,
            nextState: {
                pnoteUrl: 'http://server',
                username: 'foo'
            }
        }

        let state = rootReducer(INIT_STATE, action);

        expect(state.pnoteUrl).toBe('http://server');
        expect(state.username).toBe('foo');
    })

    it('Login successfully', () =>{
        let action = {
            type: Actions.LOGIN_SUCCESS
        }

        let state = rootReducer(INIT_STATE, action);

        expect(state.login.login).toBeTruthy();
        expect(state.login.loginSuccess).toBeTruthy()
    })

    it('Login failed', () =>{
        let action = {
            type: Actions.LOGIN_FAILED
        }

        let state = rootReducer(INIT_STATE, action);

        expect(state.login.login).toBeTruthy();
        expect(state.login.loginSuccess).toBeFalsy()        
    })

    it('Notes loaded', () => {
        let action = {
            type: Actions.NOTES_LOADED,
            payload: [new Note()]
        }

        let state = rootReducer(INIT_STATE, action);

        expect(state.notes).toBeTruthy();
        expect(state.notes.length).toBe(1)        
    })

    it('Session outdated', () => {
        let action = {
            type: Actions.SESSION_OUTDATED
        }

        let state = rootReducer(INIT_STATE, action);

        expect(state).toBe(INIT_STATE);
    })

})