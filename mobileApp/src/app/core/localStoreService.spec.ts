import { LocalStoreService } from './localStoreService';
import { Storage } from '@ionic/storage';
import * as TypeMoq from 'typemoq';
import { Actions } from './store';

describe('local Store service tests', () => {

  let storage: TypeMoq.IMock<Storage> = TypeMoq.Mock.ofType(Storage);
  let service = new LocalStoreService(storage.object);

  function next(object) {
    return object;
  }

  it('Init App loads values from store', () => {
    storage.setup(st => { st.get('url') }).returns(() => Promise.resolve('http://bar.foo'));
    storage.setup(st => { st.get('username') }).returns(() => Promise.resolve('root'));
    

    service.initApp(next).then(result => {
      expect(result.type).toBe(Actions.LAST_SESSION_LOADED)
      expect(result.nextState.pnoteUrl).toBe('http://bar.foo');
      expect(result.nextState.username).toBe('root');
    })
  });

  it('Store values on login', () => {

    let result = service.login(next, { pnoteUrl: 'http://foo.bar', usernaem: 'user' });

    expect(result).toBeDefined();
    storage.verify(st => { st.set('url', result.pnoteUrl) }, TypeMoq.Times.atLeastOnce());
    storage.verify(st => { st.set('username', result.username) }, TypeMoq.Times.atLeastOnce());
  });

});
