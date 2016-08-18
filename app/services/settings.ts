import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {UserAccess} from './descriptions';

/**
 * Service for loading and getting server and app's settings
 * 
 * @export
 * @class Settings
 */
@Injectable()
export class Settings {
    
    /**
     * URL of LMS server
     * 
     * @private
     * @type {string}
     */
    private serverURL: string;
    
    /**
     * Object to store user's OAuth2.0 information 
     * 
     * @private
     * @type {UserAccess}
     */
    private userAccess: UserAccess;

    /**
     * Gets UserAccess instance
     *
     * @property
     */
    public get UserAccess(): UserAccess {
        return this.userAccess;
    }
    
    /**
     * Sets UserAccess instance
     *
     * @property
     */
    public set UserAccess(userAccess: UserAccess) {
        this.userAccess = userAccess;
    }

    /**
     * Object to store app's settings
     * 
     * @private
     * @type {Object}
     */
    private settings: Object;

    /**
     * Object to store information about REST endpoints
     * 
     * @private
     * @type {Object}
     */
    private routes: Object;


    /**
     * Creates an instance of Settings
     * 
     * @param {Http} http Instance of Angular2 service to perfom http requests
     */
    constructor(private http: Http) {
    }

    /**
     * Initializes service for further working, loads setting from json files
     * 
     * @returns {Promise<any>} Promise that resolves or rejects the result of initialization proccess
     */
    public initialize(): Promise<any> {
        return Promise.all([
            this.readfromSettingsFolder('settings.json'),
            this.readfromSettingsFolder('routes.json')
        ]).then(([settings, routes]) => {
            this.settings = settings;
            this.routes = routes;
            this.serverURL = this.setting('url_api');
        });
    }

    /**
     * Gets app's setting by its name
     * 
     * @param {string} property Name of the setting
     * @returns {string} App's setting according to its name
     */
    public setting(property: string): string {
        if (!this.settings) return null;
        return this.settings[property];
    }

    /**
     * Gets REST endpoint by its name
     * 
     * @param {string} property Name of the route saved in json file
     * @returns {string} REST endpoint according to its name
     */
    public route(property: string): string {
        if (!this.routes) return null;
        return this.serverURL.concat(this.routes[property].url);
    }

    /**
     * Reads json file with different settings from 'settings' folder 
     * 
     * @private
     * @param {string} filename Name of json file from 'settings' folder
     * @returns {Promise<Object>} Promise that resolves with object created from json or rejects with error
     */
    private readfromSettingsFolder(filename: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            this.http.get('settings/'.concat(filename)).subscribe((data) => {
                resolve(data.json());
            }, (error) => {
                reject(error)
            });
        });
    }
};