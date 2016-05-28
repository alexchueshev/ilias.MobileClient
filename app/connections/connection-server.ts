import {IConnection, AuthData} from './connection';

export class ConnectionServer implements IConnection {
    constructor() {
    }
    
    public login(authData: AuthData) {
        return Promise.resolve();
    }
};