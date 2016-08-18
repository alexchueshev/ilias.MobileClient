import {Database} from '../database';
import {Settings} from '../settings';
import {Filesystem} from '../filesystem';

import {ITask} from './task';
import {LearningModule, Course, Status} from '../descriptions';
import {LearningModuleBuilder} from '../../builders/learning-module-builder';

/**
 * Describes data for LearningModulesTaskMerge
 * 
 * @interface LearningModules
 */
interface LearningModules {
    /**
     * List of modules stored on device
     * @type {LearningModule[]}
     */
    localModules: LearningModule[];
    /**
     * List of modules from LMS server
     * @type {LearningModule[]}
     */
    remoteModules: LearningModule[];
}

/**
 * Task to merge data of learning modules stored on device and LMS server using special rules 
 * 
 * @export
 * @class LearningModulesTaskMerge
 * @implements {ITask}
 */
export class LearningModulesTaskMerge implements ITask {
    /**
     * Task's data from connections
     * 
     * @private
     * @type {LearningModules}
     */
    private learningModules: LearningModules;

    /**
     * Creates an instance of LearningModulesTaskMerge
     * 
     * @param {Database} database Instance of database service
     * @param {Settings} settings Instance of settings service
     */
    constructor(private database: Database, private settings: Settings) {
    }

    /**
     * Merges data of local and remote modules, sets status Local&Remote for modules without differences
     * 
     * @returns {Promise<LearningModule[]>} Promise that resolves with list of merged learning modules
     */
    public execute(): Promise<LearningModule[]> {
        var mergedModules = this.learningModules.localModules;
        this.learningModules.remoteModules.forEach((lm) => {
            var module = mergedModules.find(m_lm => m_lm.ref_id == lm.ref_id);
            if (module) module.status = Status.Local | Status.Remote;
            else mergedModules.push(lm);
        })
        return Promise.resolve(mergedModules);
    }

    /**
     * Gets all learning modules that have been set
     * 
     * @returns {LearningModules} Task's data
     */
    public getResponseData(): LearningModules {
        return this.learningModules;
    }

    /**
     * Sets data according to LearningModules interface
     * 
     * @param {LearningModules} responseData Task's data
     */
    public setResponseData(responseData: LearningModules): void {
        this.learningModules = responseData;
    }
}

/**
 * Task to download zipped learning module from LMS server 
 * 
 * @export
 * @class LearningModuleTaskDownload
 * @implements {ITask}
 */
export class LearningModuleTaskDownload implements ITask {
    /**
     * Task's data
     * 
     * @private
     * @type {LearningModule}
     */
    private learningModule: LearningModule;

    /**
     * Creates an instance of LearningModuleTaskDownload
     * 
     * @param {Filesystem} filesystem Instance of filesystem service
     * @param {Settings} settings Instance of settings service
     */
    constructor(private filesystem: Filesystem, private settings: Settings) {
    }

    /**
     * Downloads learning module and unzips it to temporary storage
     * 
     * @returns {Promise<DirectoryEntry>} Promise that resolves with directory entry of unzipped module or rejects with error
     */
    public execute(): Promise<DirectoryEntry> {
        var url = this.settings.route('downloadLearningModule').concat(this.learningModule.ref_id.toString());
        return this.filesystem.downloadAndUnzip(url, Filesystem.TEMPORARY, {
            filename: 'lm.zip',
            headers: {
                access_token: this.settings.UserAccess.access_token,
                format: 'xml'
            }
        })
    }

    /**
     * Gets task's data that have been set
     * 
     * @returns {LearningModule} Task's data
     */
    public getResponseData(): LearningModule {
        return this.learningModule;
    }

    /**
     * Sets data according to LearningModule interface, learning module that should be downloaded
     * 
     * @param {LearningModule} responseData Task's data
     */
    public setResponseData(responseData: LearningModule): void {
        this.learningModule = responseData;
    }
}

/**
 * Task to prepare and save unzipped learning module to database
 * 
 * @export
 * @class LearningModuleTaskPrepare
 * @implements {ITask}
 */
export class LearningModuleTaskPrepare implements ITask {
    /**
     * Task's data
     * 
     * @private
     * @type {LearningModule}
     */
    private learningModule: LearningModule;

    /**
     * Creates an instance of LearningModuleTaskPrepare
     * 
     * @param {Filesystem} filesystem Instance of filesystem service
     * @param {Database} database Instance of database service
     * @param {Settings} settings Instance of settings service
     */
    constructor(private filesystem: Filesystem, private database: Database, private settings: Settings) {
    }

    /**
     * Prepares and saves unzipped module to database
     * 
     * @returns {Promise<any>} Promise that resolves or rejects with the result of operation
     */
    public execute(): Promise<any> {
        var builder = new LearningModuleBuilder(this.learningModule, this.filesystem);
        return this.filesystem.getDirectoryEntries(this.learningModule.directory).then((entries) => {
            this.learningModule.directory = <DirectoryEntry>entries[0];
            return builder.parseManifest();
        }).then(() => {
            return builder.parseStructureTree();
        }).then(() => {
            return builder.parseMediaObjects();
        }).then(() => {
            builder.parseChapters();
            return this.database.saveLearningModule(builder.getLearningModule());
        }).then(() => {
            return this.filesystem.cleanCache();
        }).then(() => {
            this.learningModule.status = Status.Remote | Status.Local;
            this.learningModule.onDesktop = this.learningModule.onDesktop || false;
        }).catch((error) => {
            this.filesystem.cleanCache();
            return Promise.reject(error);
        });
    }

    /**
     * Gets task's data that have been set
     * 
     * @returns {LearningModule} Task's data
     */
    public getResponseData(): LearningModule {
        return this.learningModule;
    }

    /**
     * Sets data accroding to LearningModule interface, learning module that should be prepared and saved
     * 
     * @param {LearningModule} responseData Task's data
     */
    public setResponseData(responseData: LearningModule): void {
        this.learningModule = responseData;
    }
}
export {ITask};