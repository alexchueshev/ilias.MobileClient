import {Http, Headers, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';

import {Database} from '../database';
import {Settings} from '../settings'

import {IConnection} from './connection';
import {ITask, TaskType, TaskFactory} from '../tasks/task';
import {UserData, Course, LearningModule} from '../descriptions';

@Injectable()
export class ConnectionServer extends IConnection {
    constructor(private database: Database, private settings: Settings,
        private http: Http, private taskFactory: TaskFactory) {
        super();
    }

    public login(userdata: UserData): Promise<ITask> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        
        return this.http.post(this.settings.route('auth'),
            `grant_type=password&username=${userdata.login}&password=${userdata.password}&api_key=${this.settings.setting('api_key')}`, {
                headers: headers
            })
            .toPromise().then((response) => {
                this.settings.UserAccess = response.json();
                this.settings.UserAccess.login = userdata.login;
                this.settings.UserAccess.password = userdata.password;
                return this.taskFactory.create();
            }).catch((error) => { 
                return Promise.reject(error);
            });
    }

    public getUserInfo(): Promise<ITask> {
        var searchParams = new URLSearchParams();
        searchParams.set('access_token', this.settings.UserAccess.access_token);

        return this.http.get(this.settings.route('userinfo'), { search: searchParams })
            .toPromise().then((response) => {
                var task = this.taskFactory.create(TaskType.SaveUserData);
                task.setResponseData(response.json());
                return task;
            }).catch((error) => {
                return Promise.reject(error);
            })

    }

    public getCourses(userdata: UserData): Promise<ITask> {
        var localCourses = [];
        var searchParams = new URLSearchParams();
        searchParams.set('access_token', this.settings.UserAccess.access_token);
        return this.http.get(this.settings.route('courses'), { search: searchParams })
            .toPromise().then((response) => {
                var courses = response.json().courses;
                var task = this.taskFactory.create(TaskType.MergeCourses);
                task.setResponseData({
                    user: userdata,
                    localCourses: localCourses,
                    remoteCourses: courses.map(crs => <Course>crs[0])
                });
                return task;
            }).catch((error) => {
                return Promise.reject(error);
            })
    }

    public getCourseInfo(course: Course): Promise<ITask> {
        var localModules = [];
        var searchParams = new URLSearchParams();
        searchParams.set('access_token', this.settings.UserAccess.access_token);
        return this.http.get(this.settings.route('courseinfo').concat(String(course.ref_id)), { search: searchParams })
            .toPromise().then((response) => {
                var contents = response.json().contents;
                var task = this.taskFactory.create(TaskType.MergeLearningModules);
                task.setResponseData({
                    course: course,
                    localModules: localModules,
                    remoteModules: contents.filter(obj => obj.type === 'lm')
                });
                return task;
            }).catch((error) => {
                return Promise.reject(error);
            })
    }
};