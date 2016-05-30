export interface ITask {
    execute(): Promise<any>;
    getResponseData(): any;
}

export class Task implements ITask {
    
    constructor(private responseData: any) {
    }

    public execute(): Promise<any> {
        return Promise.resolve();
    }
    
    public getResponseData(): any {
        return this.responseData;
    }
};