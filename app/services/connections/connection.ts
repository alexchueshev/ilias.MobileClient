import {UserData, Course} from '../descriptions';
import {ITask} from '../tasks/task-userdata';

export abstract class IConnection {
    constructor() {
    }

    public abstract login(userData: UserData);

    public abstract getUserInfo(): Promise<ITask>;

    public getCourses(userdata: UserData): Promise<ITask> {
        return Promise.resolve(null);
    }

    public getCourseInfo(course: Course): Promise<ITask> {
        return Promise.resolve(null);
    }
}

export {ConnectionLocal} from './connection-local';
export {ConnectionServer} from './connection-server';