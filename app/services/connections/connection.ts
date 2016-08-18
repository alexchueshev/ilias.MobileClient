import {UserData, Course, LearningModule} from '../descriptions';
import {ITask, TaskType, TaskFactory} from '../tasks/task';

import {Database} from '../database';
import {Settings} from '../settings'

/**
 * Base abstract class for all connections
 * 
 * @export
 * @abstract
 * @class IConnection
 */
export abstract class IConnection {
    /**
     * Creates an instance of IConnection
     * 
     * @param {Database} database Instance of database service
     * @param {Settings} settings (description) Instance of settings service
     * @param {TaskFactory} taskFactory Instance of factory to create tasks for managing requested data
     */
    constructor(protected database: Database, protected settings: Settings, protected taskFactory: TaskFactory) {
    }

    /**
     * Authorizes user in system
     * 
     * @abstract
     * @param {UserData} userdata Object that contains required information for authorization
     * @returns {Promise<ITask>} Promise that resolves with ITask object to manage requested data or rejects with error
     */
    public abstract login(userdata: UserData): Promise<ITask>;

    /**
     * Gets user's information
     * 
     * @abstract
     * @param {UserData} userdata Object that contains required information to get access to user's information
     * @returns {Promise<ITask>} Promise that resolves with ITask object to manage requested data or rejects with error
     */
    public abstract getUserInfo(userdata: UserData): Promise<ITask>;

    /**
     * Downloads learning module on user's device
     * 
     * @abstract
     * @param {LearningModule} learningModule Object that contains required information of learning module to download it
     * @returns {Promise<ITask>} Promise that resolves with ITask object to manage requested data or rejects with error
     */
    public abstract downloadModule(learningModule: LearningModule): Promise<ITask>;

    /**
     * Gets user's avaliable courses from device
     * 
     * @param {UserData} userdata Object that contains required information to get access to users's courses
     * @returns {Promise<ITask>} Promise that resolves with ITask object containing requested courses or rejects with error
     */
    public getCourses(userdata: UserData): Promise<ITask> {
        return this.database.getCourses(userdata).then((courses) => {
            var task = this.taskFactory.create();
            task.setResponseData (courses);
            return task;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Gets learning modules of avaliable course from user's device 
     * 
     * @param {Course} course Object that contains required information of course to get access to its learning modules
     * @returns {Promise<ITask>} Promise that resolves with ITask object containing requested learning modules or rejects with error
     */
    public getCourseInfo(course: Course): Promise<ITask> {
        return this.database.getLearningModules(course).then((learningModules) => {
            var task = this.taskFactory.create();
            task.setResponseData(learningModules);
            return task;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Saves user's local (which was downloaded) learning module on desktop for quicker access
     * 
     * @param {LearningModule} learningModule Object that contains information about learning module and should be saved on desktop
     * @returns {Promise<any>} Promise that resolves or reject the result
     */
    public saveLearningModuleOnDesktop(learningModule: LearningModule): Promise<any> {
        return this.database.saveLearningModuleOnDesktop(learningModule);
    }

    /**
     * Delete user's local (which was downloaded) learning module from desktop
     * 
     * @param {LearningModule} learningModule Object that contains information about learning module and should be deleted from desktop
     * @returns {Promise<any>} Promise that resolves or reject the result
     */
    public deleteLearningModuleFromDesktop(learningModule: LearningModule): Promise<any> {
        return this.database.deleteLearningModuleFromDesktop(learningModule);
    }

    /**
     * Gets all user's local (which was downloaded) learning modules which were saved on desktop 
     * 
     * @param {UserData} userdata Object that contains required user's information to get access to desktop
     * @returns {Promise<LearningModule[]>} Promise that resolves with list of desktop's learning modules or rejects with error
     */
    public getDesktopObjects(userdata: UserData): Promise<LearningModule[]> {
        return this.database.getDesktopObjects(userdata);
    }
}

export {ConnectionLocal} from './connection-local';
export {ConnectionServer} from './connection-server';