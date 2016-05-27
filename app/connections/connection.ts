export interface AuthData {
    login: string,
    password: string
}

export abstract class IConnection {
    abstract login(authData: AuthData);
}

export {ConnectionLocal} from './connection-local';
export {ConnectionServer} from './connection-server';