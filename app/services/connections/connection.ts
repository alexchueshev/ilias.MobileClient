import {UserData} from '../descriptions';
import {ITask} from '../tasks/task-userdata';

export abstract class IConnection {
    constructor() {
    }

    public abstract login(userData: UserData);

    public abstract getUserInfo(): Promise<ITask>;

    public abstract getCourseInfo(refId: number);

    public getCourses(): Promise<any> {
        return Promise.resolve();
    }
}

export {ConnectionLocal} from './connection-local';
export {ConnectionServer} from './connection-server';