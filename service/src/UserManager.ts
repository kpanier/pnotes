
export class UserManager {

    constructor(private mongodb) { }

    getUserByUserName(userName: string): Promise<any> {
        return this.mongodb.collection('users').findOne({ userName: userName });
    }

}

export class User {
    userName: string;
    password: string;
}