import {Injectable} from '@angular/core';
import {Platform} from 'ionic-angular';
import {Network, Connection} from 'ionic-native';

import {Database} from './database';
import {IConnection, ConnectionLocal, ConnectionServer} from '../connections/connection';

@Injectable()
export class AppManager {
    private platform: Platform;
    private database: Database;
    
    connection: IConnection;
    get Connection(): IConnection {
        return this.connection;
    }
    
    constructor(platform: Platform, database: Database) {
        this.platform = platform;
        this.database = database;
    }

    public initialize(): Promise<any> {
        return this.platform.ready().then(() => {
            this.updateConnection();
            return this.database.initialize();
        })
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

