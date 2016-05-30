import {Injectable} from '@angular/core';

import {IConnection} from './connection';
import {UserData} from '../descriptions';
import {ITask} from '../tasks/task-userdata';

import {Database} from '../database';
import {Settings} from '../settings'

@Injectable()
export class ConnectionLocal extends IConnection {
    constructor(private database: Database, private settings: Settings) {
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