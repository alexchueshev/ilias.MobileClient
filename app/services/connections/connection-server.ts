import {Http} from '@angular/http';
import {Injectable} from '@angular/core';

import {Database} from '../database';
import {Settings} from '../settings'

import {IConnection, AuthData} from './connection';

@Injectable()
export class ConnectionServer extends IConnection {
    constructor(private http: Http, private database: Database, private settings: Settings) {
        super();
    }

    public login(authData: AuthData) {
        return new Promise((resolve, reject) => {
            this.http.get(this.settings.route('routes')).subscribe((data) => {
                console.log(data.json())
            }, (error) => {
                console.log(error);
                reject(error);
            })
        });
    }
};