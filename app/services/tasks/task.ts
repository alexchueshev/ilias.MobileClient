export interface ITask {
    execute(): Promise<any>;
    getResponseData(): any;
    setResponseData(responseData: any): void;
}

export {TaskType, TaskFactory} from './task-factory';