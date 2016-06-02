/**
 * To use the service call initialize method first after platform's ready (see app.ts)
 *
*/
import {Injectable, Injector, Inject} from '@angular/core';
import {Network, Connection} from 'ionic-native';
import {Http} from '@angular/http';

import {ITask} from './tasks/task-userdata';
import {UserData, Course, LearningModule} from './descriptions';

import {IConnection, ConnectionLocal, ConnectionServer} from './connections/connection';

@Injectable()
export class AppManager {
    private connection: IConnection;

    constructor(private connectionServer: ConnectionServer, private connectionLocal: ConnectionLocal,
        private http: Http) {
    }

    public initialize(): Promise<any> {
        var resolveFn, rejectFn;
        var promise = new Promise<any>((resolve, reject) => { resolveFn = resolve; rejectFn = reject; });
        try {
            this.updateConnection();
            resolveFn();
        } catch (error) {
            rejectFn(error);
        }
        return promise;
    }

    public login(userdata: UserData): Promise<any> {
        return this.connection.login(userdata).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    public getUserInfo(): Promise<UserData> {
        return this.connection.getUserInfo().then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    public getCourses(userdata: UserData): Promise<Course[]> {
        return this.connection.getCourses(userdata).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    public getCourseInfo(course: Course): Promise<LearningModule[]> {
        return this.connection.getCourseInfo(course).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    public updateConnection() {
        switch (Network.connection) {
            case Connection.UNKNOWN:
            case Connection.NONE:
            case Connection.ETHERNET:
                this.connection = this.connectionLocal;
                break;
            default:
                this.connection = this.connectionServer;
                break;
        }
    }
}

