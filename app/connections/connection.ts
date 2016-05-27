export enum ConnectionStatus {
    online,
    offline,
    none
}

export interface IConnection {
    
}

export {ConnectionLocal} from './connection-local';
export {ConnectionServer} from './connection-server';