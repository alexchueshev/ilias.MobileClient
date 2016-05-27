import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Settings {

    private settings: Object;
    
    constructor(private http: Http) {
    }

    public initialize(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.http.get('settings/settings.json').subscribe((data) => {
                this.settings = data.json();
                resolve();
            }, (error) => {
                reject(error)
            });
        });
    }

    public get(property: string): string {
        if (!this.settings) return null;
        return this.settings[property];
    } 
};