import * as assert from 'assert';
import { UserManager, User } from './UserManager';
import { getMongoDb } from './mongomock.test';

suite('UserManager tests', () => {

    let userManager: UserManager;
    let myDb;

    beforeEach(async () => {
        if (getMongoDb()) {
            myDb = getMongoDb();
            userManager = new UserManager(getMongoDb());
        }
    })

    test('Find user', (done) => {
        let user = new User();
        user.userName = 'user';
        user.password = 'pwd';
        myDb.collection('users').insertOne(user);

        userManager.getUserByUserName('user').then(u => {
            assert(u);
            assert.equal('user', u.userName);
            assert.equal('pwd', u.password);
            done();
        });
    })

})