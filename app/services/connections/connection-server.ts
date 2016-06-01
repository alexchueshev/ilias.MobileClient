import {Http, HTTP_PROVIDERS, Headers, URLSearchParams} from '@angular/http';
import {Inject, Injectable} from '@angular/core';

import {Database} from '../database';
import {Settings} from '../settings'

import {IConnection} from './connection';
import {ITask, TaskType, TaskFactory} from '../tasks/task';
import {UserData} from '../descriptions';

@Injectable()
export class ConnectionServer extends IConnection {
    constructor(private database: Database, private settings: Settings,
        private http: Http, private taskFactory: TaskFactory) {
        super();
    }

    public login(userData: UserData): Promise<ITask> {
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
                    resolve(this.taskFactory.create(TaskType.Default));
                }, (error) => {
                    reject(error);
                })
        });
    }

    public getUserInfo(): Promise<ITask> {
        var searchParams = new URLSearchParams();
        searchParams.set('access_token', this.settings.UserAccess.access_token);

        return this.http.get(this.settings.route('userinfo'), { search: searchParams })
            .toPromise().then((response) => {
                var userdata = response.json();
                var task = this.taskFactory.create(TaskType.SaveUserData);
                task.setResponseData({
                    login: this.settings.UserAccess.login,
                    password: this.settings.UserAccess.password,
                    firstname: userdata.firstname,
                    lastname: userdata.lastname,
                    avatar: userdata.avatar
                });
                return task;
            }).catch((error) => {
                return Promise.reject(error);
            })

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