import {Database} from '../database';
import {Settings} from '../settings';

import {ITask} from './task';
import {UserData, Course, Status} from '../descriptions';

interface Courses {
    user: UserData,
    localCourses: Course[];
    remoteCourses: Course[];
}

export class CoursesTaskMerge implements ITask {
    private courses: Courses;

    constructor(private database: Database, private settings: Settings) {
    }

    public execute(): Promise<any> {
        return Promise.resolve(this.courses.remoteCourses.map(crs => {
            crs.status = Status.Remote;
            crs.user = this.courses.user;
            return crs;
        }));
    }

    public getResponseData(): Courses {
        return this.courses;
    }

    public setResponseData(responseData: Courses): void {
        this.courses = responseData;
    }
}

export {ITask};