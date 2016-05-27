import {Injectable} from '@angular/core';
import {Network, Connection} from 'ionic-native';

import {IConnection, ConnectionLocal, ConnectionServer} from '../connections/connection';

@Injectable()
export class AppManager {
    connection: IConnection;
    get Connection(): IConnection {
        return this.connection;
    }

    constructor() {
    }

    /**To use the service call initialize method after platfom's ready  */
    public initialize(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.updateConnection();
            resolve();
        });
    }

    public updateConnection() {
        switch (Network.connection) {
            case Connection.UNKNOWN:
            case Connection.NONE:
            case Connection.ETHERNET:
                this.connection = new ConnectionLocal();
                break;
            default:
                this.connection = new ConnectionServer();
                break;
        }
    }

    public onConnect() {

    }

    private onDisconnect() {

    }
}

