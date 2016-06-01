import {ITask} from './task';

export class Task implements ITask {

    private responseData: any;

    constructor() {
    }

    public execute(): Promise<any> {
        return Promise.resolve(this.responseData);
    }

    public getResponseData(): any {
        return this.responseData;
    }

    public setResponseData(responseData: any): void {
        this.responseData = responseData;
    }
};

export {ITask}