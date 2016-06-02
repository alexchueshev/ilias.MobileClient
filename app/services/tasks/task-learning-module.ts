import {Database} from '../database';
import {Settings} from '../settings';

import {ITask} from './task';
import {LearningModule, Course, Status} from '../descriptions';

interface LearningModules {
    course: Course,
    localModules: LearningModule[];
    remoteModules: LearningModule[];
}

export class LearningModulesTaskMerge implements ITask {
    private learningModules: LearningModules;

    constructor(private database: Database, private settings: Settings) {
    }

    public execute(): Promise<any> {
        return Promise.resolve(this.learningModules.remoteModules.map(lm => {
            lm.status = Status.Remote;
            lm.course = this.learningModules.course;
            return lm;
        }));
    }

    public getResponseData(): LearningModules {
        return this.learningModules;
    }

    public setResponseData(responseData: LearningModules): void {
        this.learningModules = responseData;
    }
}

export {ITask};