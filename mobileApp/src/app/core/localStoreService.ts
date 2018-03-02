import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Actions } from './store';

@Injectable()
export class LocalStoreService {

    constructor(private storage: Storage) { }

    middleware = store => next => action => {
        switch (action.type) {
            case Actions.INIT_APP:
                return this.storage.get("url").then(url => {
                    return this.storage.get("username").then(uname => {
                        return next({ type: Actions.LAST_SESSION_LOADED, nextState: { pnoteUrl: url, username: uname } });
                    });
                })
            case Actions.LOGIN:
                this.storage.set("url", action.pnoteUrl);
                this.storage.set("username", action.username);
                return next(action)
        }
        return next(action);
    }

}