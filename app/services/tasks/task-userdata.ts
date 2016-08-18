import {Database} from '../database';
import {Filesystem} from '../filesystem';
import {Settings} from '../settings';

import {ITask} from './task';
import {UserData} from '../descriptions';

/**
 * Task to save user's data (info, avatar) from LMS server on device
 * 
 * @export
 * @class UserDataTaskSaver
 * @implements {ITask}
 */
export class UserDataTaskSaver implements ITask {
    /**
     * Task's data from connections
     * 
     * @private
     * @type {UserData}
     */
    private userdata: UserData;

    /**
     * Creates an instance of UserDataTaskSaver
     * 
     * @param {Filesystem} filesystem Instance of filesystem service
     * @param {Database} database Instance of database service
     * @param {Settings} settings Instance of settings service
     */
    constructor(private filesystem: Filesystem, private database: Database, private settings: Settings) {
    }

    /**
     * Downloads avatar, saves user's data to database and filesystem
     * 
     * @returns {Promise<UserData>} Promise that resolves with saved user's data or rejects with error
     */
    public execute(): Promise<UserData> {
        var url = this.settings.setting('url_server').concat(this.userdata.avatar.substr(2));
        var filename = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('?'));
        return this.filesystem.downloadFile(url, Filesystem.PERSISTENT, { filename: filename }).then((imagefile) => {
            this.userdata.avatar = imagefile.toURL();
            this.userdata.password = this.settings.UserAccess.password;
            return this.database.saveUserData(this.userdata);
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    /**
     * Gets task's data that have been set
     * 
     * @returns {UserData} Task's data
     */
    public getResponseData(): UserData {
        return this.userdata;
    }

    /**
     * Sets data from connections according to UserData interface
     * 
     * @param {any} responseData Task's data
     */
    public setResponseData(responseData: UserData): void {
        this.userdata = responseData;
    }
}

export {ITask};