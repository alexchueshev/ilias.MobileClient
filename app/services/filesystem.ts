/// <reference path="../../typings/index.d.ts" />
import {Injectable} from '@angular/core';
import {File, Transfer} from 'ionic-native';

@Injectable()
export class Filesystem {
    private tempFileSystem: FileSystem;
    private persistentFileSystem: FileSystem;

    private file: File;
    private transfer: Transfer;
    
    constructor() {
    }

    public initialize(): Promise<any> {
        var resolveFn, rejectFn;
        var promise = new Promise((resolve, reject) => { resolveFn = resolve, rejectFn = reject });
        try {
            this.transfer = new Transfer();
            window.requestFileSystem(window.TEMPORARY, 0, (tempFileSystem) => {
                this.tempFileSystem = tempFileSystem;
                window.requestFileSystem(window.PERSISTENT, 0, (persistentFileSystem) => {
                    this.persistentFileSystem = persistentFileSystem;
                    resolveFn();
                }, (fileError) => {
                    rejectFn(fileError);
                });
            }, (fileError) => {
                rejectFn(fileError);
            });
        } catch (error) {
            rejectFn(error);
        }
        return promise;
    }
};