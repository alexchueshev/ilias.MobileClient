import {Http, Headers, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';

import {Database} from '../database';
import {Settings} from '../settings'

import {IConnection, AuthData} from './connection';

@Injectable()
export class ConnectionServer extends IConnection {
    constructor(private http: Http, private database: Database, private settings: Settings) {
        super();
    }

    public login(authData: AuthData): Promise<any> {
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
                    reject(error);
                })
        });
    }

    public getUserInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            var searchParams = new URLSearchParams();
            searchParams.set('access_token', this.settings.UserAccess.access_token);
            this.http.get(this.settings.route('userinfo'), { search: searchParams })
                .subscribe((data) => {
                    resolve(data.json());
                }, (error) => {
                    reject(error);
                })
        });
    }

    public getCourses(): Promise<any> {
        return new Promise((resolve, reject) => {
            var searchParams = new URLSearchParams();
            searchParams.set('access_token', this.settings.UserAccess.access_token);
            this.http.get(this.settings.route('courses'), { search: searchParams })
                .subscribe((data) => {
                    resolve(data.json());
                }, (error) => {
                    reject(error);
                })
        })
    }

    public getCourseInfo(refId: number): Promise<any> {
        return new Promise((resolve, reject) => {
           var searchParams = new URLSearchParams();
            searchParams.set('access_token', this.settings.UserAccess.access_token);
            this.http.get(this.settings.route('courseinfo').concat(String(refId)), { search: searchParams })
                .subscribe((data) => {
                    resolve(data.json());
                }, (error) => {
                    reject(error);
                })
        });
    }
};