import {ITask} from './task';

/**
 * Basic task to return data from connections to appmanager without changes 
 * 
 * @export
 * @class Task
 * @implements {ITask}
 */
export class Task implements ITask {
    /**
     * Task's data from connections
     *
     * @private
     * @type {*}
     */
    private responseData: any;

    /**
     * Creates an instance of Task
     */
    constructor() {
    }

    /**
     * Returns data from connections to appmanager without changes
     * 
     * @returns {Promise<any>} Promise that resolves task's data
     */
    public execute(): Promise<any> {
        return Promise.resolve(this.responseData);
    }

    /**
     * Gets task's data
     * 
     * @returns {any} Task's data
     */
    public getResponseData(): any {
        return this.responseData;
    }

    /**
     * Sets task's data from connections
     * 
     * @param {any} responseData Task's data from connections
     */
    public setResponseData(responseData: any): void {
        this.responseData = responseData;
    }
};

export {ITask}