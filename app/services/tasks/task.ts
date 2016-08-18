/**
 * Describes interface for all tasks, used to manage user's data, courses, learning modules. 
 * Task objects should be created using special factory by connection instances and called by appmanager using execute method.
 * Using such tasks helps to isolate connections and appmanager from such things as
 * preparing, saving modules, merging and converting different objects.
 * Realization of such tasks reminds 'command' pattern. 
 *
 * @export
 * @interface ITask
 */
export interface ITask {
    /**
     * Works with task's data, converting, splitting it or something else
     * 
     * @returns {Promise<any>} Promise that resolves with task's data or rejects with error
     */
    execute(): Promise<any>;
    /**
     * Gets task's data
     * 
     * @returns {any} Task's data
     */
    getResponseData(): any;
    /**
     * Sets task's data to manage it in 'execute' method 
     * 
     * @param {any} responseData Task's data from connections
     */
    setResponseData(responseData: any): void;
}

export {TaskType, TaskFactory} from './task-factory';