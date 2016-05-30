/// <reference path="../../typings/index.d.ts" />
import {Injectable} from '@angular/core';
import {File, Transfer} from 'ionic-native';

@Injectable()
export class Filesystem {
    public static TEMPORARY: number = 0;
    public static PERSISTENT: number = 1;

    private tempFileSystem: FileSystem;
    private persistentFileSystem: FileSystem;

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

    public downloadFile(uri: string, type: number): Promise<FileEntry> {
        var target = (type === Filesystem.TEMPORARY) ? this.tempFileSystem.root.toURL() : this.persistentFileSystem.root.toURL();
        var filename = uri.substring(uri.lastIndexOf('/') + 1, uri.lastIndexOf('?'));
        return File.createFile(target, filename, true).then((file: FileEntry) => {
            return this.transfer.download(encodeURI(uri), file.toURL(), true);
        });
        
    }
};