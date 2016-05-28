import {Http, Headers} from '@angular/http';
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
            var headers = new Headers();
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
            this.http.post(this.settings.route('auth'),
                `grant_type=password&username=${authData.login}&password=${authData.password}&api_key=${this.settings.setting('api_key')}`, {
                    headers: headers
                })
                .subscribe((data) => {
                    this.settings.UserAccess = data.json();
                    resolve();
                }, (error) => {
                    console.log(error);
                    reject(error);
                })
        });
    }

    public getCourses() {
        return super.getCourses();
    }
};