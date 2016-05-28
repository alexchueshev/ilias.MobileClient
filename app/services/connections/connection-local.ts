import {Injectable} from '@angular/core';
import {IConnection, AuthData} from './connection';

import {Database} from '../database';
import {Settings} from '../settings'

@Injectable()
export class ConnectionLocal extends IConnection {
    constructor(private database: Database, private settings: Settings) {
        super();
    }

    public login(authData: AuthData) {
        return Promise.resolve();
    }
};