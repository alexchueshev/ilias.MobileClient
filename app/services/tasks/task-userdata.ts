import {Database} from '../database';
import {Filesystem} from '../filesystem';
import {ITask} from './task';

export class UserDataSaver implements ITask {
    constructor(private filesystem: Filesystem, private database: Database) {
    }
    
    public execute() {

    }
}

export {ITask};