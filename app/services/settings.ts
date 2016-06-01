import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {UserAccess} from './descriptions';

@Injectable()
export class Settings {
    private serverURL: string;
    
    private userAccess: UserAccess;
    public get UserAccess(): UserAccess {
        return this.userAccess;
    }
    public set UserAccess(userAccess: UserAccess) {
        this.userAccess = userAccess;
    }

    private settings: Object;
    private routes: Object;


    constructor(private http: Http) {
    }

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

    public setting(property: string): string {
        if (!this.settings) return null;
        return this.settings[property];
    }

    public route(property: string): string {
        if (!this.routes) return null;
        return this.serverURL.concat(this.routes[property].url);
    }

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