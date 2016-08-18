import {Http, Headers, URLSearchParams} from '@angular/http';
import {Injectable} from '@angular/core';
import {Database} from '../database';
import {Settings} from '../settings'
import {IConnection} from './connection';
import {ITask, TaskType, TaskFactory} from '../tasks/task';
import {UserData, Course, LearningModule, Status} from '../descriptions';

/**
 * Implements functions which are necessary to manage remote user's data
 * using connection to Internet and REST Plugin on server side
 * 
 * @export
 * @class ConnectionServer
 * @extends {IConnection}
 */
@Injectable()
export class ConnectionServer extends IConnection {
    /**
     * Creates an instance of ConnectionServer
     * 
     * @param {Database} database Instance of database service
     * @param {Settings} settings Instance of settings service
     * @param {Http} http Instance of Angular2 service to perfom http requests
     * @param {TaskFactory} taskFactory Instance of factory to create tasks for managing requested data
     */
    constructor(database: Database, settings: Settings,
        private http: Http, taskFactory: TaskFactory) {
        super(database, settings, taskFactory);
    }

    /**
     * Authorizes the user using login,password and REST API-key in LMS ILIAS,
     * uses /v2/oauth2/token REST endpoint with grant_type=password
     * 
     * @param {UserData} userdata Object that contains required information for OAuth2.0 authorization
     * @returns {Promise<ITask>} Promise that resolves with ITask object containing user's information or rejects with error
     */
    public login(userdata: UserData): Promise<ITask> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(this.settings.route('auth'),
            `grant_type=password&username=${userdata.login}&password=${userdata.password}&api_key=${this.settings.setting('api_key')}`, {
                headers: headers
            })
            .toPromise().then((response) => {
                this.settings.UserAccess = response.json();
                this.settings.UserAccess.login = userdata.login;
                this.settings.UserAccess.password = userdata.password;
                this.settings.UserAccess.expires_in += Date.now() / 1000 - 300;
                var task = this.taskFactory.create();
                task.setResponseData(userdata);
                return task;
            }).catch((error) => {
                return Promise.reject(error);
            });
    }

    /**
     * Gets user's information from LMS server,
     * uses /v1/umr/userinfo REST endpoint
     * 
     * @param {UserData} userdata Object that contains required information to get access to user's information from LMS server
     * @returns {Promise<ITask>} Promise that resolves with ITask object needed to save and return user's information or rejects with error
     */
    public getUserInfo(userdata: UserData): Promise<ITask> {
        return this.update().then(() => {
            var searchParams = new URLSearchParams();
            searchParams.set('access_token', this.settings.UserAccess.access_token);
            return this.http.get(this.settings.route('userinfo'), { search: searchParams })
                .toPromise()
        }).then((response) => {
            var task = this.taskFactory.create(TaskType.SaveUserData);
            task.setResponseData(response.json());
            return task;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Gets user's avaliable courses from LMS server,
     * uses /v1/courses REST endpoint
     * 
     * @param {UserData} userdata Object that contains required information to get access to users's courses from LMS server
     * @returns {Promise<ITask>} Promise that resolves with ITask object needed to merge local and remote courses and return them or rejects with error
     */
    public getCourses(userdata: UserData): Promise<ITask> {
        var localCourses: Course[] = [];
        var searchParams = new URLSearchParams();
        return this.update().then(() => {
            searchParams.set('access_token', this.settings.UserAccess.access_token);
            return super.getCourses(userdata)
        }).then((task) => {
            return task.execute();
        }).then((courses) => {
            localCourses = courses;
            return this.http.get(this.settings.route('courses'), { search: searchParams }).toPromise();
        }).then((response) => {
            var courses = response.json().courses;
            var task = this.taskFactory.create(TaskType.MergeCourses);
            task.setResponseData({
                localCourses: localCourses,
                remoteCourses: courses.map(crs => {
                    var course = <Course>crs[0];
                    course.status = Status.Remote;
                    course.user = userdata;
                    return course;
                })
            });
            return task;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Gets learning modules of avaliable course from LMS server,
     * uses /v1/courses/:ref_id REST endpoint, where ref_id is unique identifier of ILIAS object
     * 
     * @param {Course} course Object that contains required information of course to get access to its learning modules from LMS server
     * @returns {Promise<ITask>} Promise that resolves with ITask object needed to merge local and remote modules and return them or rejects with error
     */
    public getCourseInfo(course: Course): Promise<ITask> {
        var localModules: LearningModule[] = [];
        var searchParams = new URLSearchParams();
        return this.update().then(() => {
            searchParams.set('access_token', this.settings.UserAccess.access_token);
            return super.getCourseInfo(course)
        }).then((task) => {
            return task.execute();
        }).then((learningModules) => {
            localModules = learningModules;
            return this.http.get(this.settings.route('courseinfo').concat(String(course.ref_id)), { search: searchParams })
                .toPromise();
        }).then((response) => {
            var contents = response.json().contents;
            var task = this.taskFactory.create(TaskType.MergeLearningModules);
            task.setResponseData({
                localModules: localModules,
                remoteModules: contents.filter(obj => obj.type === 'lm').map((lm: LearningModule) => {
                    lm.status = Status.Remote;
                    lm.onDesktop = false;
                    lm.chapters = [];
                    lm.course = course;
                    return lm;
                })
            });
            return task;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Downloads learning module on user's device from LMS server as zip-packet with xml files
     * 
     * @param {LearningModule} learningModule Object that contains required information of learning module to download it
     * @returns {Promise<ITask>} Promise that resolves with ITask object needed to save module and prepare it for using or rejects with error
     */
    public downloadModule(learningModule: LearningModule): Promise<ITask> {
        var task = this.taskFactory.create(TaskType.DownloadLearningModule);
        task.setResponseData(learningModule);
        return this.update().then(() => {
            return task.execute()
        }).then((moduleEntry: DirectoryEntry) => {
            task = this.taskFactory.create(TaskType.PrepareLearningModule);
            learningModule.directory = moduleEntry;
            task.setResponseData(learningModule);
            return task;
        }).catch((error) => {
            return Promise.reject(error);
        })
    }

    /**
     * Updates user's information for authorization when access_token key has expired
     * 
     * @private
     * @returns {Promise<any>} Promise that resolves or rejects the result of updating
     */
    private update(): Promise<any> {
        if (this.settings.UserAccess.expires_in <= Date.now())
            return this.login({ login: this.settings.UserAccess.login, password: this.settings.UserAccess.password });
        return Promise.resolve();
    }
};