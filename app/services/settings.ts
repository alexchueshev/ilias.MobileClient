import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Settings {

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
        });
    }

    public setting(property: string): string {
        if (!this.settings) return null;
        return this.settings[property];
    }

    public route(property: string): Route {
        if (!this.routes) return null;
        return this.routes[property];
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

interface Route {
    url: string;
    method: string;
}