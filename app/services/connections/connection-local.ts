import {Injectable} from '@angular/core';
import {IConnection} from './connection';
import {UserData, LearningModule} from '../descriptions';
import {ITask, TaskType, TaskFactory} from '../tasks/task';
import {Database} from '../database';
import {Settings} from '../settings'

/**
 * Implements functions which are necessary to manage local user's data without connection to Internet
 * 
 * @export
 * @class ConnectionLocal
 * @extends {IConnection}
 */
@Injectable()
export class ConnectionLocal extends IConnection {

    /**
     * Creates an instance of ConnectionLocal
     * 
     * @param {Database} database Instance of database service
     * @param {Settings} settings Instance of settings service
     * @param {TaskFactory} taskFactory Instance of factory to create tasks for managing requested data
     */
    constructor(database: Database, settings: Settings, taskFactory: TaskFactory) {
        super(database, settings, taskFactory);
    }

    /**
     * Authorizes the user using saved login and password without connection to Internet
     * 
     * @param {UserData} userdata Object that contains required information for local authorization
     * @returns {Promise<ITask>} Promise that resolves with ITask object containing user's information or rejects with error
     */
    public login(userdata: UserData): Promise<ITask> {
        return this.database.checkUser(userdata).then((hasRecord) => {
            if (hasRecord) {
                this.settings.UserAccess = {
                    login: userdata.login,
                    password: userdata.password,
                    access_token: null,
                    refresh_token: null,
                    expires_in: 0,
                    token_type: null
                };
                var task = this.taskFactory.create();
                task.setResponseData(userdata);
                return task;
            }
            else return Promise.reject<ITask>('Cannot find such user');
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Gets user's information saved on device
     * 
     * @param {UserData} userdata Object that contains required information to get access to local user's information
     * @returns {Promise<ITask>} Promise that resolves with ITask object containing user's information or rejects with error
     */
    public getUserInfo(userdata: UserData): Promise<ITask> {
        return this.database.getUser(userdata).then(() => {
            var task = this.taskFactory.create();
            task.setResponseData(userdata);
            return task;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Generalization of abstract function,
     * return promise that rejects with error
     */
    public downloadModule(learningModule: LearningModule): Promise<ITask> {
        return Promise.reject<ITask>('There is no connection to Internet');
    }
};