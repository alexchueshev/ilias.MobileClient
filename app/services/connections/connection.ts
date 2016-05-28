export interface AuthData {
    login: string,
    password: string
}

export abstract class IConnection {
    constructor() {
    }
    public abstract login(authData: AuthData);

    public getCourses(): Promise<any> {
        return Promise.resolve();
    }
}

export {ConnectionLocal} from './connection-local';
export {ConnectionServer} from './connection-server';