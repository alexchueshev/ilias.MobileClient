import {Injectable} from '@angular/core';

import {IConnection} from './connection';
import {UserData} from '../descriptions';
import {ITask, TaskType, TaskFactory} from '../tasks/task';

import {Database} from '../database';
import {Settings} from '../settings'

@Injectable()
export class ConnectionLocal extends IConnection {
    constructor(private database: Database, private settings: Settings, private taskFactory: TaskFactory) {
        super();
    }

    public login(userData: UserData) {
        return Promise.resolve();
    }

    public getUserInfo(): Promise<ITask> {
        return Promise.resolve(null);
    }

    public getCourseInfo(refId: number) {

    }
};