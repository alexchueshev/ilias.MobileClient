import {Injector, Injectable} from '@angular/core';
import {ITask} from './task';
import {Task} from './task-basic';
import {UserDataTaskSaver} from './task-userdata';
import {CoursesTaskMerge} from './task-courses';
import {LearningModulesTaskMerge, LearningModuleTaskDownload, LearningModuleTaskPrepare} from './task-learning-module';
import {Database} from '../database';
import {Filesystem} from '../filesystem';
import {Settings} from '../settings';

/**
 * Describes task to create by factory
 * 
 * @export
 * @enum {number}
 */
export enum TaskType {
    /**
     * Describes UserDataTaskSaver
     */
    SaveUserData,
    /**
     * Describes CoursesTaskMerge
     */
    MergeCourses,
    /**
     * Describes LearningModulesTaskMerge
     */
    MergeLearningModules,
    /**
     * Describes LearningModuleTaskDownload
     */
    DownloadLearningModule,
    /**
     * Describes LearningModuleTaskPrepare
     */
    PrepareLearningModule,
    /**
     * Describes Task
     */
    Default
}

/**
 * Factory for creating different tasks by their types
 * 
 * @export
 * @class TaskFactory
 */
@Injectable()
export class TaskFactory {
    /**
     * Creates an instance of TaskFactory.
     * 
     * @param {Injector} services Instance of Angular2 class for managing DI pattern
     */
    constructor(private services: Injector) {
    }
    
    /**
     * Creates task by its type
     * 
     * @param {TaskType} [type] Type of task or default task
     * @returns {ITask} Task created by its type with all dependencies
     */
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
            case TaskType.DownloadLearningModule:
                return new LearningModuleTaskDownload(
                    this.services.get(Filesystem),
                    this.services.get(Settings));
            case TaskType.PrepareLearningModule:
                return new LearningModuleTaskPrepare(
                    this.services.get(Filesystem),
                    this.services.get(Database),
                    this.services.get(Settings)
                );
            case TaskType.Default:
            default:
                return new Task();
        }
    }
}