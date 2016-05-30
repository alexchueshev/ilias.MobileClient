/**
 * To use the service call initialize method first after platform's ready (see app.ts)
 *
*/
import {Injectable, Inject} from '@angular/core';
import {Network, Connection} from 'ionic-native';
import {Http} from '@angular/http';

import {Settings} from './settings';
import {ITask} from './tasks/task-userdata';
import {UserData} from './descriptions';

import {IConnection, ConnectionLocal, ConnectionServer} from './connections/connection';

@Injectable()
export class AppManager {
    private connection: IConnection;
    get Connection(): IConnection {
        return this.connection;
    }

    constructor(private connectionLocal: ConnectionLocal, private connectionServer: ConnectionServer) {
    }


    public initialize(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.updateConnection();
            resolve();
        });
    }

    public login() {

    }

    public getUserInfo(): Promise<UserData> {
        return this.connection.getUserInfo().then((task) => {
            return task.execute();
        }).catch((error) => { 
            return Promise.reject(error);
        });
    }

    public updateConnection() {
        switch (Network.connection) {
            case Connection.UNKNOWN:
            case Connection.NONE:
            case Connection.ETHERNET:
                this.connection = this.connectionLocal; 
                break;
            default:
                this.connection = this.connectionServer;
                break;
        }
    }

    public onConnect() {

    }

    private onDisconnect() {

    }
}

