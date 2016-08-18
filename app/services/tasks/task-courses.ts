import {Database} from '../database';
import {Settings} from '../settings';

import {ITask} from './task';
import {UserData, Course, Status} from '../descriptions';

/**
 * Describes data for CoursesTaskMerge
 * 
 * @interface Courses
 */
interface Courses {
    /**
     * List of courses stored on device
     * @type {Course[]}
     */
    localCourses: Course[];
    /**
     * List of courses from LMS server
     * @type {Course[]}
     */
    remoteCourses: Course[];
}

/**
 * Task to merge data of courses stored on device and LMS server using special rules 
 * 
 * @export
 * @class CoursesTaskMerge
 * @implements {ITask}
 */
export class CoursesTaskMerge implements ITask {
    /**
     * Task's data from connections
     *
     * @private
     * @type {Courses}
     */
    private courses: Courses;

    /**
     * Creates an instance of CoursesTaskMerge
     * 
     * @param {Database} database Instance of database service
     * @param {Settings} settings Instance of settings service 
     */
    constructor(private database: Database, private settings: Settings) {
    }

    /**
     * Merges data of local and remote courses, sets status Local&Remote for courses without differences  
     * 
     * @returns {Promise<Course[]>} Promise that resolves list of merged courses
     */
    public execute(): Promise<Course[]> {
        var mergedCourses = this.courses.localCourses;
        this.courses.remoteCourses.forEach((crs) => { 
            var course = mergedCourses.find(m_crs => m_crs.ref_id == crs.ref_id);
            if (course) course.status = Status.Local | Status.Remote;
            else mergedCourses.push(crs);
        })
        return Promise.resolve(mergedCourses);
    }

    /**
     * Gets all courses that have been set
     * 
     * @returns {Courses} Task's courses
     */
    public getResponseData(): Courses {
        return this.courses;
    }

    /**
     * Sets courses according to Courses interface
     * 
     * @param {Courses} responseData Task's courses from connections
     */
    public setResponseData(responseData: Courses): void {
        this.courses = responseData;
    }
}

export {ITask};