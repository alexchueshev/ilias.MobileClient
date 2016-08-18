/**
 * To use the service call initialize method first after platform's ready (see app.ts)
*/
import {Injectable, Injector, Inject} from '@angular/core';
import {Network, Connection} from 'ionic-native';
import {Http} from '@angular/http';
import {ITask} from './tasks/task-userdata';
import {UserData, Course, LearningModule} from './descriptions';
import {IConnection, ConnectionLocal, ConnectionServer} from './connections/connection';

/**
 * Determines the type of connection
 * 
 * @export
 * @enum {number}
 */
export enum ConnectionType {
    /**
     * Determines remote connection
     */
    Online,
    
    /**
     * Determines local connection 
     */
    Offline
}

/**
 * The instance of this class is used to control the workflow,
 * should be injected into pages's classes 
 * 
 * @export
 * @class AppManager
 */
@Injectable()
export class AppManager {
    /**
     * Current connection 
     * 
     * @private
     * @type {IConnection}
     */
    private connection: IConnection;

    /**
     * Type according to the current connection 
     * 
     * @private
     * @type {ConnectionType}
     */
    private connectionType: ConnectionType;

    /**
     * Creates an instance of AppManager
     * 
     * @param {ConnectionServer} ConnectionServer Instance of class to control remote connection 
     * @param {ConnectionLocal} ConnectionLocal Instance of class to control local connection
     * @param {Http} http Instance of Angular2 service to perfom http requests
     */
    constructor(private connectionServer: ConnectionServer, private connectionLocal: ConnectionLocal,
        private http: Http) {
    }

    /**
     * Initializes the instance of class for further working,
     * sets the current connection type
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of initialization proccess
     */
    public initialize(): Promise<any> {
        var resolveFn, rejectFn;
        var promise = new Promise<any>((resolve, reject) => { resolveFn = resolve; rejectFn = reject; });
        try {
            this.updateConnection();
            resolveFn();
        } catch (error) {
            rejectFn(error);
        }
        return promise;
    }

    /**
     * Authorizes the user in the system, depending on the type of connection
     * 
     * @param {UserData} userdata Object that contains required information for authorization
     * @returns {Promise<any>} Promise that resolves or rejects the result of authorization
     */
    public login(userdata: UserData): Promise<any> {
        return this.connection.login(userdata).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    /**
     * Gets user's information, depending on the type of connection
     * 
     * @param {UserData} userdata Object that contains required information to get access to users's information
     * @returns {Promise<UserData>} Promise that resolves object with full user's information or rejects with error
     */
    public getUserInfo(userdata: UserData): Promise<UserData> {
        return this.connection.getUserInfo(userdata).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    /**
     * Gets user's avaliable courses, depending on the type of connection
     * 
     * @param {UserData} userdata Object that contains required information to get access to users's courses
     * @returns {Promise<Course[]>} Promise that resolves with list of user's courses or rejects with error
     */
    public getCourses(userdata: UserData): Promise<Course[]> {
        return this.connection.getCourses(userdata).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Gets learning modules of avaliable course, depending on the type of connection
     * 
     * @param {Course} course Object that contains required information of course to get access to its learning modules
     * @returns {Promise<LearningModule[]>} Promise that resolves with list of course's learning modules or rejects with error
     */
    public getCourseInfo(course: Course): Promise<LearningModule[]> {
        return this.connection.getCourseInfo(course).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Downloads learning module on user's device if the type of connection allows it
     * 
     * @param {LearningModule} learningModule Object that contains required information of learning module to download it
     * @returns {Promise<any>} Promise that resolves or rejects the result of download 
     */
    public downloadModule(learningModule: LearningModule): Promise<any> {
        return this.connection.downloadModule(learningModule).then((task) => {
            return task.execute();
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Updates current connection and its connection type
     * 
     * @param {ConnectionType} [target] Preferred type of connection, which is necessary to set
     * @returns {ConnectionType} Type of current connection. Always returns offline status if there is no connection to the Internet 
     */
    public updateConnection(target?: ConnectionType): ConnectionType {
        switch (Network.connection) {
            case Connection.CELL:
            case Connection.WIFI:
                this.connectionType = ConnectionType.Online; break;
            case Connection.UNKNOWN:
            case Connection.NONE:
            case Connection.ETHERNET:
            default:
                this.connectionType = ConnectionType.Offline; break;
        }
        if (this.connectionType == ConnectionType.Offline || target == ConnectionType.Offline) {
            this.connection = this.connectionLocal;
            this.connectionType = ConnectionType.Offline;
        } else if (this.connectionType == ConnectionType.Online || target == ConnectionType.Online) {
            this.connection = this.connectionServer;
            this.connectionType = ConnectionType.Online
        }
        return this.connectionType;
    }

    /**
     * Gets the type of current connection
     * 
     * @returns {ConnectionType} Type of current connection 
     */
    public getConnection(): ConnectionType {
        return this.connectionType;
    }

    /**
     * Saves user's local (which was downloaded) learning module on desktop for quicker access
     * 
     * @param {LearningModule} learningModule Object that contains information about learning module and should be saved on desktop
     * @returns {Promise<any>} Promise that resolves or rejects the result 
     */
    public saveLearningModuleOnDesktop(learningModule: LearningModule): Promise<any> {
        return this.connection.saveLearningModuleOnDesktop(learningModule);
    }

    /**
     * Deletes user's local (which was downloaded) learning module from desktop
     * 
     * @param {LearningModule} learningModule Object that contains information about learning module and should be deleted from desktop
     * @returns {Promise<any>} Promise that resolves or rejects the result
     */
    public deleteLearningModuleFromDesktop(learningModule: LearningModule): Promise<any> {
        return this.connection.deleteLearningModuleFromDesktop(learningModule);
    }

    /**
     * Gets all user's local (which was downloaded) learning modules which were saved on desktop 
     * 
     * @param {UserData} userdata Object that contains required user's information to get access to desktop
     * @returns {Promise<LearningModule[]>} Promise that resolves with list of desktop's learning modules or rejects with error
     */
    public getDesktopObjects(userdata: UserData): Promise<LearningModule[]> {
        return this.connection.getDesktopObjects(userdata);
    }
}

