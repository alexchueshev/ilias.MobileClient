import {Database} from '../database';
import {Filesystem} from '../filesystem';

import {ITask} from './task';
import {UserData} from '../descriptions';

export class UserDataTaskSaver implements ITask {
    constructor(private filesystem: Filesystem, private database: Database,
        private userdata: UserData) {
    }
    
    public execute() {

    }
}



export {ITask};