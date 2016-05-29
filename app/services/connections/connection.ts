export interface AuthData {
    login: string,
    password: string
}

export abstract class IConnection {
    constructor() {
    }
    public abstract login(authData: AuthData);

    public abstract getUserInfo();

    public abstract getCourseInfo(refId: number);
    
    public getCourses(): Promise<any> {
        return Promise.resolve();
    }
}

export {ConnectionLocal} from './connection-local';
export {ConnectionServer} from './connection-server';