import { Note } from './model';

export interface INotesState {
    notes: Note[]
    pnoteUrl: string;
    username: string;
    login: ILogin;
}

export interface ILogin {
    login: boolean;
    loginSuccess: boolean;
}

export enum Actions {
    LOGIN = 'LOGIN',
    LOAD_NOTES = 'LOAD_NOTES',
    INIT_APP = 'INIT_APP',
    LAST_SESSION_LOADED = 'LAST_SESSION_LOADED',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILED = 'LOGIN_FAILED',
    NOTES_LOADED = 'NOTES_LOADED',
    SESSION_OUTDATED = 'SESSION_OUTDATED'
}

export const INIT_STATE: INotesState = {
    notes: [],
    pnoteUrl: '',
    username: '',
    login: { login: false, loginSuccess: false }
};

export function rootReducer(state: INotesState, action): INotesState {
    switch (action.type) {
        case Actions.LAST_SESSION_LOADED:
            return { notes: state.notes, pnoteUrl: action.nextState.pnoteUrl, username: action.nextState.username, login: { login: false, loginSuccess: false } };
        case Actions.LOGIN_SUCCESS:
            return { notes: state.notes, pnoteUrl: state.pnoteUrl, username: state.username, login: { login: true, loginSuccess: true } };
        case Actions.LOGIN_FAILED:
            return { notes: state.notes, pnoteUrl: state.pnoteUrl, username: state.username, login: { login: true, loginSuccess: false } };
        case Actions.NOTES_LOADED:
            return { notes: action.payload, pnoteUrl: state.pnoteUrl, username: state.username, login: state.login };
        case Actions.SESSION_OUTDATED: return INIT_STATE;
    }
    return state;
}