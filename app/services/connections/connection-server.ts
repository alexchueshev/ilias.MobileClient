import {Http, Headers, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';

import {Database} from '../database';
import {Settings} from '../settings'
import {Filesystem} from '../filesystem';

import {IConnection} from './connection';
import {ITask, UserDataTaskSaver} from '../tasks/task-userdata';
import {UserData} from '../descriptions';

@Injectable()
export class ConnectionServer extends IConnection {
    constructor(private http: Http, private database: Database,
        private filesystem: Filesystem, private settings: Settings) {
        super();
    }

    public login(userData: UserData): Promise<any> {
        return new Promise((resolve, reject) => {
            var headers = new Headers();
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
            this.http.post(this.settings.route('auth'),
                `grant_type=password&username=${userData.login}&password=${userData.password}&api_key=${this.settings.setting('api_key')}`, {
                    headers: headers
                })
                .subscribe((data) => {
                    var useraccess = data.json();
                    this.settings.UserAccess = {
                        login: userData.login,
                        password: userData.password,
                        access_token: useraccess.access_token,
                        refresh_token: useraccess.refresh_token,
                        expires_in: Number(useraccess.expires_in),
                        token_type: useraccess.token_type
                    };
                    resolve();
                }, (error) => {
                    reject(error);
                })
        });
    }

    public getUserInfo(): Promise<ITask> {
        return new Promise((resolve, reject) => {
            var searchParams = new URLSearchParams();
            searchParams.set('access_token', this.settings.UserAccess.access_token);
            this.http.get(this.settings.route('userinfo'), { search: searchParams })
                .subscribe((data) => {
                    var userdata = data.json();
                    resolve(new UserDataTaskSaver(this.filesystem, this.database, {
                        login: this.settings.UserAccess.login,
                        password: this.settings.UserAccess.password,
                        firstname: userdata.firstname,
                        secondname: userdata.secondname,
                        avatar: userdata.avatar
                    }));
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