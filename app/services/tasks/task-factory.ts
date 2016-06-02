import {Injector, Injectable} from '@angular/core';
import {ITask} from './task';
import {Task} from './task-basic';
import {UserDataTaskSaver} from './task-userdata';
import {CoursesTaskMerge} from './task-courses';
import {LearningModulesTaskMerge} from './task-learning-module';

import {Database} from '../database';
import {Filesystem} from '../filesystem';
import {Settings} from '../settings';

export enum TaskType {
    SaveUserData,
    MergeCourses,
    MergeLearningModules,
    Default
}

@Injectable()
export class TaskFactory {
    constructor(private services: Injector) {
    }
    
    public create(type?: TaskType): ITask {
        switch (type) {
            case TaskType.SaveUserData:
                return new UserDataTaskSaver(
                    this.services.get(Filesystem),
                    this.services.get(Database),
                    this.services.get(Settings));
            case TaskType.MergeCourses:
                return new CoursesTaskMerge(
                    this.services.get(Database),
                    this.services.get(Settings));
            case TaskType.MergeLearningModules:
                return new LearningModulesTaskMerge(
                    this.services.get(Database),
                    this.services.get(Settings));
            case TaskType.Default:
            default:
                return new Task();
        }
    }
}